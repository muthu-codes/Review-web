import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class Review(models.Model):
    STATUS_CHOICES = [
        ('published', 'Published'),
        ('flagged', 'Flagged for Moderation'),
        ('hidden', 'Hidden'),
        ('deleted', 'Deleted'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    establishment = models.ForeignKey(
        'directory.Establishment',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Star rating from 1 (Very Poor) to 5 (Excellent)"
    )
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(help_text="Detailed personal experience review")
    visit_date = models.DateField(null=True, blank=True)
    review_category = models.CharField(
        max_length=100,
        blank=True,
        help_text="Focus area e.g. Customer Service, Cleanliness, Infrastructure, Value"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published', db_index=True)
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['establishment', 'user'],
                name='unique_user_establishment_review'
            )
        ]

    def __str__(self):
        return f"{self.rating}★ Review by {self.user.public_name} on {self.establishment.name}"

    @property
    def rating_label(self):
        labels = {
            1: "Very Poor",
            2: "Poor",
            3: "Average",
            4: "Good",
            5: "Excellent"
        }
        return labels.get(self.rating, "Average")

class ReviewReport(models.Model):
    REASON_CHOICES = [
        ('offensive_language', 'Offensive or abusive language'),
        ('defamatory', 'Defamatory or false allegation'),
        ('fake_review', 'Suspected fake / paid / competitor review'),
        ('privacy_violation', 'Private individual or minor information'),
        ('conflict_of_interest', 'Employee or owner self-review'),
        ('other', 'Other community guideline violation'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewed', 'Reviewed - No Action'),
        ('action_taken', 'Action Taken (Hidden / Removed)'),
        ('dismissed', 'Dismissed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='reports')
    reported_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='submitted_reports')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    details = models.TextField(help_text="Additional context for review moderators")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_reports')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} on Review {self.review_id}"

# Signals to automatically update establishment aggregate rating & distribution
@receiver([post_save, post_delete], sender=Review)
def update_establishment_rating_on_change(sender, instance, **kwargs):
    if instance.establishment:
        instance.establishment.recalculate_rating_aggregates()
