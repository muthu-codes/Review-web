from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'display_name', 'is_staff', 'is_moderator', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_moderator', 'is_active', 'date_joined')
    search_fields = ('email', 'display_name', 'username')
    ordering = ('-date_joined',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('display_name', 'first_name', 'last_name', 'profile_picture_url', 'google_sub')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_moderator', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
