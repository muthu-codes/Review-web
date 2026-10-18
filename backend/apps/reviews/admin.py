from django.contrib import admin
from .models import Review, ReviewReport

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('establishment', 'user', 'rating', 'status', 'is_edited', 'created_at')
    list_filter = ('status', 'rating', 'is_edited', 'created_at')
    search_fields = ('establishment__name', 'user__email', 'user__display_name', 'comment')
    readonly_fields = ('created_at', 'updated_at')
    actions = ['approve_review', 'hide_review']

    def approve_review(self, request, queryset):
        queryset.update(status='published')
        for review in queryset:
            review.establishment.recalculate_rating_aggregates()
    approve_review.short_description = "Approve and publish selected reviews"

    def hide_review(self, request, queryset):
        queryset.update(status='hidden')
        for review in queryset:
            review.establishment.recalculate_rating_aggregates()
    hide_review.short_description = "Hide selected reviews from public"

@admin.register(ReviewReport)
class ReviewReportAdmin(admin.ModelAdmin):
    list_display = ('review', 'reported_by', 'reason', 'status', 'created_at')
    list_filter = ('status', 'reason', 'created_at')
    search_fields = ('details', 'review__comment', 'reported_by__email')
    readonly_fields = ('created_at',)
    actions = ['take_action_and_hide_review', 'dismiss_report']

    def take_action_and_hide_review(self, request, queryset):
        for report in queryset:
            report.status = 'action_taken'
            report.resolved_by = request.user
            report.save()
            report.review.status = 'hidden'
            report.review.save()
            report.review.establishment.recalculate_rating_aggregates()
    take_action_and_hide_review.short_description = "Uphold report and hide offending review"

    def dismiss_report(self, request, queryset):
        queryset.update(status='dismissed', resolved_by=request.user)
    dismiss_report.short_description = "Dismiss selected reports"
