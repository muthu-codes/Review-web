from django.urls import path
from .views import (
    ModerationReportsQueueView, ModerationDecisionView,
    AuditLogListView, AdminDashboardOverviewView
)

urlpatterns = [
    path('admin/moderation/reports/', ModerationReportsQueueView.as_view(), name='admin-moderation-reports'),
    path('admin/moderation/reports/<uuid:report_id>/decision/', ModerationDecisionView.as_view(), name='admin-moderation-decision'),
    path('admin/audit-logs/', AuditLogListView.as_view(), name='admin-audit-logs'),
    path('admin/dashboard/overview/', AdminDashboardOverviewView.as_view(), name='admin-dashboard-overview'),
]
