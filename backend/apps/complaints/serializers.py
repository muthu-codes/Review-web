from rest_framework import serializers
from .models import ComplaintChannel

class PublicComplaintChannelSerializer(serializers.ModelSerializer):
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)

    class Meta:
        model = ComplaintChannel
        fields = [
            'id',
            'channel_type',
            'channel_type_display',
            'channel_name',
            'receiving_organization',
            'official_url',
            'official_contact',
            'instructions',
            'verified_source_url',
            'last_verified_at',
        ]
        read_only_fields = fields

class AdminComplaintChannelSerializer(serializers.ModelSerializer):
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)

    class Meta:
        model = ComplaintChannel
        fields = '__all__'
