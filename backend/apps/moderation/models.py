import uuid
from django.db import models

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create Entity'),
        ('update', 'Update Entity'),
        ('delete', 'Delete Entity'),
        ('verify', 'Verify Status'),
        ('archive', 'Archive Entity'),
        ('csv_import', 'CSV Import Batch'),
        ('moderation_decision', 'Moderation Decision'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=50, help_text="e.g. establishment, review, complaint_channel, suggestion")
    entity_id = models.CharField(max_length=255)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.user.email if self.user else "System"
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {user_str} - {self.action} on {self.entity_type} {self.entity_id}"
