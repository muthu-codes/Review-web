from django.urls import path
from .views import GoogleAuthView, CurrentUserView, LogoutView

urlpatterns = [
    path('auth/google/', GoogleAuthView.as_view(), name='auth-google'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
]
