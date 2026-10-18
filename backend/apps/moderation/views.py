import datetime
from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.reviews.models import ReviewReport, Review
from apps.directory.models import Establishment, EstablishmentSuggestion
from .models import AuditLog
from .serializers import AuditLogSerializer, ModerationQueueReportSerializer

class ModerationReportsQueueView(generics.ListAPIView):
    serializer_class = ModerationQueueReportSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = ReviewReport.objects.all().select_related('review', 'review__user', 'review__establishment', 'reported_by')
        status_param = self.request.query_params.get('status', 'pending')
        if status_param != 'all':
            qs = qs.filter(status=status_param)
        return qs.order_by('-created_at')

class ModerationDecisionView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, report_id):
        report = get_object_or_404(ReviewReport, pk=report_id)
        decision = request.data.get('decision') # 'uphold_and_hide' or 'dismiss'
        admin_notes = request.data.get('notes', '')

        if decision == 'uphold_and_hide':
            report.status = 'action_taken'
            report.resolved_at = datetime.datetime.now(datetime.timezone.utc)
            report.resolved_by = request.user
            report.save()

            review = report.review
            review.status = 'hidden'
            review.save()
            review.establishment.recalculate_rating_aggregates()

            AuditLog.objects.create(
                user=request.user,
                action='moderation_decision',
                entity_type='review',
                entity_id=str(review.id),
                details={'decision': 'hidden', 'report_id': str(report.id), 'notes': admin_notes}
            )

            return Response({'message': 'Report upheld and review hidden from public display.'})

        elif decision == 'dismiss':
            report.status = 'dismissed'
            report.resolved_at = datetime.datetime.now(datetime.timezone.utc)
            report.resolved_by = request.user
            report.save()

            AuditLog.objects.create(
                user=request.user,
                action='moderation_decision',
                entity_type='review',
                entity_id=str(report.review_id),
                details={'decision': 'dismissed', 'report_id': str(report.id), 'notes': admin_notes}
            )

            return Response({'message': 'Report dismissed; review remains published.'})

        return Response({'error': 'Invalid decision. Use "uphold_and_hide" or "dismiss".'}, status=status.HTTP_400_BAD_REQUEST)

class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.all().select_related('user').order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminDashboardOverviewView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response({
            'total_establishments': Establishment.objects.count(),
            'verified_establishments': Establishment.objects.filter(status='verified').count(),
            'pending_establishments': Establishment.objects.filter(status='pending_verification').count(),
            'pending_suggestions': EstablishmentSuggestion.objects.filter(status='pending').count(),
            'pending_review_reports': ReviewReport.objects.filter(status='pending').count(),
            'total_reviews': Review.objects.filter(status='published').count(),
            'recent_audit_logs': AuditLogSerializer(AuditLog.objects.all()[:10], many=True).data
        })
