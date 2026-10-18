from django.contrib import admin
from .models import (
    District, Town, Locality, Category, SubCategory,
    Establishment, EstablishmentSuggestion, ListingCorrection
)

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ('name', 'tamil_name', 'state', 'slug')

@admin.register(Town)
class TownAdmin(admin.ModelAdmin):
    list_display = ('name', 'tamil_name', 'district', 'slug')
    list_filter = ('district',)
    search_fields = ('name', 'tamil_name')

@admin.register(Locality)
class LocalityAdmin(admin.ModelAdmin):
    list_display = ('name', 'tamil_name', 'town', 'postal_code')
    list_filter = ('town',)
    search_fields = ('name', 'tamil_name', 'postal_code')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'tamil_name', 'slug', 'icon', 'display_order')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'tamil_name', 'category', 'slug')
    list_filter = ('category',)

@admin.register(Establishment)
class EstablishmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'town', 'category', 'verification_status', 'status', 'average_rating', 'review_count', 'created_at')
    list_filter = ('status', 'verification_status', 'category', 'town')
    search_fields = ('name', 'tamil_name', 'address_line1', 'phone')
    readonly_fields = ('average_rating', 'review_count', 'rating_distribution', 'created_at', 'updated_at')
    actions = ['mark_as_verified', 'mark_as_checked']

    def mark_as_verified(self, request, queryset):
        queryset.update(status='verified', verification_status='official_verified')
    mark_as_verified.short_description = "Mark selected as Official Verified"

    def mark_as_checked(self, request, queryset):
        queryset.update(status='verified', verification_status='checked')
    mark_as_checked.short_description = "Mark selected as Checked by Review Web"

@admin.register(EstablishmentSuggestion)
class EstablishmentSuggestionAdmin(admin.ModelAdmin):
    list_display = ('name', 'town', 'category', 'submitted_by', 'status', 'created_at')
    list_filter = ('status', 'town', 'category')
    search_fields = ('name', 'address', 'notes')

@admin.register(ListingCorrection)
class ListingCorrectionAdmin(admin.ModelAdmin):
    list_display = ('establishment', 'field_to_correct', 'status', 'submitted_by', 'created_at')
    list_filter = ('status', 'field_to_correct')
