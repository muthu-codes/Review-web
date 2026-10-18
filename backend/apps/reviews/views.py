from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.directory.models import Establishment
from .models import Review, ReviewReport
from .serializers import ReviewReadSerializer, ReviewCreateUpdateSerializer, ReviewReportSerializer

class EstablishmentReviewListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateUpdateSerializer
        return ReviewReadSerializer

    def get_queryset(self):
        est_id = self.kwargs.get('establishment_id')
        qs = Review.objects.filter(establishment_id=est_id, status='published').select_related('user', 'establishment')

        # Review sorting
        sort = self.request.query_params.get('sort', 'newest')
        if sort == 'rating_desc':
            qs = qs.order_by('-rating', '-created_at')
        elif sort == 'rating_asc':
            qs = qs.order_by('rating', '-created_at')
        else:
            qs = qs.order_by('-created_at')

        return qs

    def create(self, request, *args, **kwargs):
        est_id = self.kwargs.get('establishment_id')
        establishment = get_object_or_404(Establishment, pk=est_id)

        # Enforce one active review per user per establishment
        existing = Review.objects.filter(establishment=establishment, user=request.user).first()
        if existing:
            return Response(
                {"error": "You have already reviewed this establishment. You may edit or update your existing review."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(establishment=establishment, user=request.user, status='published')

        read_serializer = ReviewReadSerializer(review, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all().select_related('user', 'establishment')
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ReviewCreateUpdateSerializer
        return ReviewReadSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        # Verify ownership
        if review.user != request.user and not request.user.is_staff:
            return Response({"error": "You do not have permission to edit this review."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(review, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(is_edited=True)

        read_serializer = ReviewReadSerializer(review, context={'request': request})
        return Response(read_serializer.data)

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user and not request.user.is_staff:
            return Response({"error": "You do not have permission to delete this review."}, status=status.HTTP_403_FORBIDDEN)

        establishment = review.establishment
        review.delete()
        # Explicit recalculation is also triggered by post_delete signal
        establishment.recalculate_rating_aggregates()
        return Response({"message": "Review successfully deleted."}, status=status.HTTP_200_OK)

class ReviewReportCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReviewReportSerializer

    def create(self, request, *args, **kwargs):
        review_id = self.kwargs.get('id')
        review = get_object_or_404(Review, pk=review_id)

        # Check if user already reported this review
        existing = ReviewReport.objects.filter(review=review, reported_by=request.user, status='pending').exists()
        if existing:
            return Response({"error": "You have already submitted a pending report for this review."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(review=review, reported_by=request.user)

        return Response(
            {"message": "Thank you for helping maintain community trust. Your report will be reviewed by our moderation team."},
            status=status.HTTP_201_CREATED
        )

class CurrentUserReviewListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReviewReadSerializer

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related('establishment').order_by('-created_at')
