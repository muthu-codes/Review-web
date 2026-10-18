import uuid
from django.db import models

class ComplaintChannel(models.Model):
    CHANNEL_TYPES = [
        ('portal', 'Official Complaint Portal'),
        ('form', 'Official Complaint Form'),
        ('email', 'Verified Official Complaint Email'),
        ('helpline', 'Verified Official Helpline'),
        ('support_page', 'Official Customer Support Page'),
    ]

    VERIFICATION_STATUSES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified Official Channel'),
        ('rejected', 'Rejected / Unverified'),
        ('expired', 'Verification Expired / Needs Re-check'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    establishment = models.ForeignKey(
        'directory.Establishment',
        on_delete=models.CASCADE,
        related_name='complaint_channels'
    )
    channel_type = models.CharField(max_length=30, choices=CHANNEL_TYPES)
    channel_name = models.CharField(max_length=150, help_text="e.g. Tamil Nadu CM Special Cell Portal, Consumer Helpline, Official Grievance Desk")
    receiving_organization = models.CharField(max_length=200, help_text="Official Department, Board, or Corporate entity receiving the complaint")
    official_url = models.URLField(blank=True, null=True, help_text="Direct link to official complaint portal or form")
    official_contact = models.CharField(max_length=150, blank=True, help_text="Official email or helpline number")
    
    verified_source_url = models.URLField(help_text="Evidence URL (e.g. government order, official gazette, verified site) validating this channel")
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUSES, default='pending', db_index=True)
    last_verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_channels')
    
    instructions = models.TextField(help_text="Clear citizen guidance on procedure, required documents, or turnaround expectations")
    is_currently_available = models.BooleanField(default=True, db_index=True)
    administrative_notes = models.TextField(blank=True, help_text="Internal notes; never displayed publicly")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['channel_type', 'channel_name']

    def __str__(self):
        return f"{self.channel_name} ({self.get_channel_type_display()}) - {self.establishment.name}"
