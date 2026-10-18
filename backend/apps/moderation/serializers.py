from rest_framework import serializers
from apps.reviews.models import ReviewReport, Review
from apps.reviews.serializers import ReviewReadSerializer
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user_email', 'action', 'entity_type', 'entity_id', 'details', 'ip_address', 'timestamp']

class ModerationQueueReportSerializer(serializers.ModelSerializer):
    review = ReviewReadSerializer(read_only=True)
    reported_by_email = serializers.CharField(source='reported_by.email', read_only=True)

    class Meta:
        model = ReviewReport
        fields = [
            'id', 'review', 'reported_by_email', 'reason',
            'details', 'status', 'created_at', 'resolved_at'
        ]
