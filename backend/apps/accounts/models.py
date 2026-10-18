import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name='Email Address')
    display_name = models.CharField(max_length=150, blank=True, verbose_name='Display Name')
    profile_picture_url = models.URLField(max_length=1000, blank=True, null=True, verbose_name='Profile Picture URL')
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True, verbose_name='Google Subject ID')
    is_moderator = models.BooleanField(default=False, verbose_name='Moderator Status')
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.display_name or self.username or self.email

    @property
    def public_name(self):
        return self.display_name or (self.first_name and f"{self.first_name} {self.last_name}".strip()) or self.username or "Anonymous Citizen"
