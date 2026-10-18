from django.urls import path
from .views import (
    EstablishmentComplaintChannelListView,
    AdminComplaintChannelListCreateView,
    AdminComplaintChannelDetailView
)

urlpatterns = [
    path('establishments/<uuid:establishment_id>/complaint-channels/', EstablishmentComplaintChannelListView.as_view(), name='establishment-complaint-channels'),
    path('admin/complaint-channels/', AdminComplaintChannelListCreateView.as_view(), name='admin-complaint-channels'),
    path('admin/complaint-channels/<uuid:id>/', AdminComplaintChannelDetailView.as_view(), name='admin-complaint-channel-detail'),
]
