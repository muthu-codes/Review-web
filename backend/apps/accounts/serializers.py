from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    reviews_count = serializers.SerializerMethodField()
    reviews_edited_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'display_name',
            'first_name',
            'last_name',
            'profile_picture_url',
            'is_staff',
            'is_moderator',
            'date_joined',
            'reviews_count',
            'reviews_edited_count',
        ]
        read_only_fields = ['id', 'email', 'is_staff', 'is_moderator', 'date_joined']

    def get_reviews_count(self, obj):
        return obj.reviews.filter(status='published').count()

    def get_reviews_edited_count(self, obj):
        return obj.reviews.filter(is_edited=True).count()

class PublicUserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='public_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'profile_picture_url',
        ]

class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField(required=False, allow_blank=True)
    access_token = serializers.CharField(required=False, allow_blank=True)
    # Test mode / demo support fields
    email = serializers.EmailField(required=False)
    name = serializers.CharField(required=False, allow_blank=True)
    picture = serializers.URLField(required=False, allow_blank=True)
