from rest_framework import serializers
from apps.accounts.serializers import PublicUserSerializer
from .models import Review, ReviewReport

class ReviewReadSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    establishment_id = serializers.UUIDField(source='establishment.id', read_only=True)
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)
    rating_label = serializers.CharField(read_only=True)
    is_own_review = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id',
            'establishment_id',
            'establishment_name',
            'user',
            'rating',
            'rating_label',
            'title',
            'comment',
            'visit_date',
            'review_category',
            'is_edited',
            'is_own_review',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'is_edited', 'created_at', 'updated_at']

    def get_is_own_review(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False

class ReviewCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'rating',
            'title',
            'comment',
            'visit_date',
            'review_category',
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 (Very Poor) and 5 (Excellent).")
        return value

    def validate_comment(self, value):
        stripped = value.strip()
        if len(stripped) < 10:
            raise serializers.ValidationError("Review comment must contain at least 10 characters detailing your experience.")
        if len(stripped) > 2000:
            raise serializers.ValidationError("Review comment cannot exceed 2000 characters.")
        return stripped

class ReviewReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReport
        fields = ['id', 'review', 'reason', 'details', 'created_at']
        read_only_fields = ['id', 'review', 'created_at']
