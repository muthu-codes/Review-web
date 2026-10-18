from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user', 'action', 'entity_type', 'entity_id', 'ip_address')
    list_filter = ('action', 'entity_type', 'timestamp')
    search_fields = ('user__email', 'entity_id', 'details')
    readonly_fields = ('timestamp', 'user', 'action', 'entity_type', 'entity_id', 'details', 'ip_address')
