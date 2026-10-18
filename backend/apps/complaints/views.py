from rest_framework import generics, permissions
from .models import ComplaintChannel
from .serializers import PublicComplaintChannelSerializer, AdminComplaintChannelSerializer

class EstablishmentComplaintChannelListView(generics.ListAPIView):
    """
    Public endpoint: Exposes strictly verified, currently available official complaint channels.
    Never exposes internal administrative notes or unverified channels.
    """
    serializer_class = PublicComplaintChannelSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        est_id = self.kwargs.get('establishment_id')
        return ComplaintChannel.objects.filter(
            establishment_id=est_id,
            verification_status='verified',
            is_currently_available=True
        ).order_by('channel_type')

class AdminComplaintChannelListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminComplaintChannelSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = ComplaintChannel.objects.all().select_related('establishment')
        est_id = self.request.query_params.get('establishment_id')
        if est_id:
            qs = qs.filter(establishment_id=est_id)
        return qs

class AdminComplaintChannelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ComplaintChannel.objects.all()
    serializer_class = AdminComplaintChannelSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'
