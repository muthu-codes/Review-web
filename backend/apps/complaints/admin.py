from django.contrib import admin
from .models import ComplaintChannel

@admin.register(ComplaintChannel)
class ComplaintChannelAdmin(admin.ModelAdmin):
    list_display = ('channel_name', 'establishment', 'channel_type', 'receiving_organization', 'verification_status', 'is_currently_available', 'last_verified_at')
    list_filter = ('verification_status', 'is_currently_available', 'channel_type')
    search_fields = ('channel_name', 'establishment__name', 'receiving_organization', 'official_contact')
    readonly_fields = ('created_at', 'updated_at')
    actions = ['verify_selected', 'disable_selected']

    def verify_selected(self, request, queryset):
        import datetime
        queryset.update(
            verification_status='verified',
            is_currently_available=True,
            last_verified_at=datetime.datetime.now(datetime.timezone.utc),
            verified_by=request.user
        )
    verify_selected.short_description = "Mark selected channels as Verified Official"

    def disable_selected(self, request, queryset):
        queryset.update(is_currently_available=False)
    disable_selected.short_description = "Temporarily disable selected channels"
