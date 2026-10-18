from rest_framework import serializers
from .models import (
    District, Town, Locality, Category, SubCategory,
    Establishment, EstablishmentSuggestion, ListingCorrection
)

class CategorySerializer(serializers.ModelSerializer):
    establishments_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'tamil_name', 'slug', 'icon', 'description', 'display_order', 'establishments_count']

    def get_establishments_count(self, obj):
        # Only count verified/public listings
        return obj.establishments.filter(status__in=['verified', 'pending_verification']).count()

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'tamil_name', 'slug', 'category']

class TownSerializer(serializers.ModelSerializer):
    establishments_count = serializers.SerializerMethodField()

    class Meta:
        model = Town
        fields = ['id', 'name', 'tamil_name', 'slug', 'establishments_count']

    def get_establishments_count(self, obj):
        return obj.establishments.filter(status__in=['verified', 'pending_verification']).count()

class LocalitySerializer(serializers.ModelSerializer):
    town_name = serializers.CharField(source='town.name', read_only=True)

    class Meta:
        model = Locality
        fields = ['id', 'name', 'tamil_name', 'postal_code', 'town', 'town_name']

class EstablishmentListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    town_name = serializers.CharField(source='town.name', read_only=True)
    locality_name = serializers.CharField(source='locality.name', read_only=True)
    has_verified_complaint_channel = serializers.SerializerMethodField()

    class Meta:
        model = Establishment
        fields = [
            'id',
            'name',
            'tamil_name',
            'category_name',
            'category_slug',
            'town_name',
            'locality_name',
            'address_line1',
            'postal_code',
            'average_rating',
            'review_count',
            'verification_status',
            'status',
            'has_verified_complaint_channel',
            'created_at',
        ]

    def get_has_verified_complaint_channel(self, obj):
        return obj.complaint_channels.filter(verification_status='verified', is_currently_available=True).exists()

class EstablishmentDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    subcategory = SubCategorySerializer(read_only=True)
    town = TownSerializer(read_only=True)
    locality = LocalitySerializer(read_only=True)
    full_address = serializers.CharField(read_only=True)
    map_url = serializers.CharField(read_only=True)
    has_verified_complaint_channel = serializers.SerializerMethodField()

    class Meta:
        model = Establishment
        fields = [
            'id',
            'name',
            'tamil_name',
            'category',
            'subcategory',
            'town',
            'locality',
            'address_line1',
            'address_line2',
            'postal_code',
            'full_address',
            'map_url',
            'latitude',
            'longitude',
            'phone',
            'email',
            'website',
            'business_hours',
            'verification_status',
            'status',
            'average_rating',
            'review_count',
            'rating_distribution',
            'has_verified_complaint_channel',
            'created_at',
            'updated_at',
        ]

    def get_has_verified_complaint_channel(self, obj):
        return obj.complaint_channels.filter(verification_status='verified', is_currently_available=True).exists()

class EstablishmentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Establishment
        fields = '__all__'

class EstablishmentSuggestionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    town_name = serializers.CharField(source='town.name', read_only=True)

    class Meta:
        model = EstablishmentSuggestion
        fields = [
            'id', 'name', 'tamil_name', 'category', 'category_name',
            'town', 'town_name', 'locality_name', 'address', 'phone',
            'website', 'notes', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']

class ListingCorrectionSerializer(serializers.ModelSerializer):
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)

    class Meta:
        model = ListingCorrection
        fields = [
            'id', 'establishment', 'establishment_name',
            'field_to_correct', 'proposed_value', 'reason', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']
