from django.urls import path
from .views import (
    EstablishmentReviewListCreateView, ReviewDetailView,
    ReviewReportCreateView, CurrentUserReviewListView
)

urlpatterns = [
    path('establishments/<uuid:establishment_id>/reviews/', EstablishmentReviewListCreateView.as_view(), name='establishment-reviews'),
    path('reviews/<uuid:id>/', ReviewDetailView.as_view(), name='review-detail'),
    path('reviews/<uuid:id>/report/', ReviewReportCreateView.as_view(), name='review-report'),
    path('auth/me/reviews/', CurrentUserReviewListView.as_view(), name='user-reviews'),
]
