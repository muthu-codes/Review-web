import uuid
import re
from django.db import models
from django.db.models import Index

def normalize_text_for_search(text):
    """
    Normalizes search text (removes excess whitespace, lowercases, handles basic Unicode).
    """
    if not text:
        return ""
    text = text.lower().strip()
    return re.sub(r'\s+', ' ', text)

class District(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, default='Tirunelveli')
    tamil_name = models.CharField(max_length=100, default='திருநெல்வேலி')
    state = models.CharField(max_length=100, default='Tamil Nadu')
    slug = models.SlugField(max_length=100, unique=True, default='tirunelveli')

    def __str__(self):
        return f"{self.name} ({self.tamil_name})"

class Town(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='towns')
    name = models.CharField(max_length=100)
    tamil_name = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100)

    class Meta:
        ordering = ['name']
        unique_together = ('district', 'slug')

    def __str__(self):
        return f"{self.name}{' / ' + self.tamil_name if self.tamil_name else ''}"

class Locality(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    town = models.ForeignKey(Town, on_delete=models.CASCADE, related_name='localities')
    name = models.CharField(max_length=120)
    tamil_name = models.CharField(max_length=120, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Localities'

    def __str__(self):
        return f"{self.name}, {self.town.name}"

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    tamil_name = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default='building')
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class SubCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)
    tamil_name = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100)

    class Meta:
        ordering = ['name']
        unique_together = ('category', 'slug')
        verbose_name_plural = 'Subcategories'

    def __str__(self):
        return f"{self.category.name} - {self.name}"

def default_rating_distribution():
    return {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0}

class Establishment(models.Model):
    VERIFICATION_CHOICES = [
        ('listed', 'Listed on Review Web'),
        ('checked', 'Information Checked by Review Web'),
        ('official_verified', 'Official Registration Independently Verified'),
    ]

    STATUS_CHOICES = [
        ('pending_verification', 'Pending Verification'),
        ('verified', 'Verified'),
        ('needs_updating', 'Needs Updating'),
        ('rejected', 'Rejected'),
        ('archived', 'Archived'),
    ]

    SOURCE_CHOICES = [
        ('csv_import', 'CSV Import'),
        ('admin_entry', 'Administrator Entry'),
        ('user_suggestion', 'User Suggestion'),
        ('public_directory', 'Permitted Public Directory'),
        ('osm_import', 'OpenStreetMap Import'),
        ('official_dataset', 'Official Government Dataset'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    tamil_name = models.CharField(max_length=255, blank=True, db_index=True)
    normalized_name = models.CharField(max_length=255, db_index=True, blank=True)
    
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='establishments')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='establishments')
    
    district = models.ForeignKey(District, on_delete=models.PROTECT, related_name='establishments')
    town = models.ForeignKey(Town, on_delete=models.PROTECT, related_name='establishments')
    locality = models.ForeignKey(Locality, on_delete=models.SET_NULL, null=True, blank=True, related_name='establishments')
    
    address_line1 = models.CharField(max_length=300)
    address_line2 = models.CharField(max_length=300, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    business_hours = models.JSONField(default=dict, blank=True)
    
    verification_status = models.CharField(max_length=30, choices=VERIFICATION_CHOICES, default='listed')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_verification', db_index=True)
    
    source_type = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='admin_entry')
    source_reference = models.CharField(max_length=255, blank=True)
    
    # Source provenance & idempotency
    source_name = models.CharField(max_length=50, default='manual', db_index=True)
    source_id = models.CharField(max_length=150, blank=True, db_index=True)
    source_url = models.URLField(max_length=500, blank=True)
    source_attribution = models.CharField(max_length=255, blank=True, default='© OpenStreetMap contributors, ODbL')
    first_imported_at = models.DateTimeField(null=True, blank=True)
    last_imported_at = models.DateTimeField(null=True, blank=True)
    operational_status = models.CharField(max_length=30, default='active')
    
    # Calculated aggregates
    average_rating = models.FloatField(default=0.0, db_index=True)
    review_count = models.PositiveIntegerField(default=0, db_index=True)
    rating_distribution = models.JSONField(
        default=default_rating_distribution,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ['name']
        indexes = [
            Index(fields=['status', 'category']),
            Index(fields=['status', 'town']),
            Index(fields=['status', 'average_rating']),
            Index(fields=['status', '-created_at']),
            Index(fields=['source_name', 'source_id']),
        ]

    def save(self, *args, **kwargs):
        self.normalized_name = normalize_text_for_search(self.name)
        if not self.rating_distribution:
            self.rating_distribution = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0}
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.town.name})"

    @property
    def full_address(self):
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        if self.locality:
            parts.append(self.locality.name)
        parts.append(self.town.name)
        if self.postal_code:
            parts.append(f"PIN: {self.postal_code}")
        parts.append(f"{self.district.name} District, Tamil Nadu")
        return ", ".join(parts)

    @property
    def map_url(self):
        if self.latitude and self.longitude:
            return f"https://www.google.com/maps/search/?api=1&query={self.latitude},{self.longitude}"
        return f"https://www.google.com/maps/search/?api=1&query={self.name}+{self.town.name}+Tirunelveli"

    def recalculate_rating_aggregates(self):
        """
        Recalculates average rating, review count, and distribution strictly from published reviews.
        """
        from apps.reviews.models import Review
        reviews = Review.objects.filter(establishment=self, status='published')
        count = reviews.count()
        self.review_count = count

        if count == 0:
            self.average_rating = 0.0
            self.rating_distribution = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0}
        else:
            dist = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0}
            total_sum = 0
            for r in reviews:
                total_sum += r.rating
                str_star = str(r.rating)
                if str_star in dist:
                    dist[str_star] += 1
            self.average_rating = round(total_sum / count, 1)
            self.rating_distribution = dist

        self.save(update_fields=['average_rating', 'review_count', 'rating_distribution', 'updated_at'])

class EstablishmentSuggestion(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved & Created'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    tamil_name = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    town = models.ForeignKey(Town, on_delete=models.CASCADE)
    locality_name = models.CharField(max_length=150, blank=True)
    address = models.TextField()
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    notes = models.TextField(blank=True, help_text="Evidence or context for this place")
    
    submitted_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='suggestions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_suggestions')
    review_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Suggestion: {self.name} in {self.town.name}"

class ListingCorrection(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('applied', 'Applied'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    establishment = models.ForeignKey(Establishment, on_delete=models.CASCADE, related_name='corrections')
    submitted_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    field_to_correct = models.CharField(max_length=100)
    proposed_value = models.TextField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Correction for {self.establishment.name}: {self.field_to_correct}"

class DataImportRun(models.Model):
    STATUS_CHOICES = [
        ('running', 'Running'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_name = models.CharField(max_length=50, default='osm')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='running')
    is_dry_run = models.BooleanField(default=False)
    features_examined = models.PositiveIntegerField(default=0)
    records_inserted = models.PositiveIntegerField(default=0)
    records_updated = models.PositiveIntegerField(default=0)
    records_skipped = models.PositiveIntegerField(default=0)
    records_rejected = models.PositiveIntegerField(default=0)
    duration_seconds = models.FloatField(default=0.0)
    report_summary = models.JSONField(default=dict, blank=True)
    errors = models.TextField(blank=True)
    initiated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Data Import Run'
        verbose_name_plural = 'Data Import Runs'

    def __str__(self):
        status_str = "DRY RUN" if self.is_dry_run else self.status.upper()
        return f"[{status_str}] {self.source_name} on {self.started_at.strftime('%Y-%m-%d %H:%M')}: +{self.records_inserted} places"

