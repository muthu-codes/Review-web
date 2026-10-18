from django.db.models import Q
from rest_framework import generics, status, views, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import (
    Category, SubCategory, Town, Locality,
    Establishment, EstablishmentSuggestion, ListingCorrection
)
from .serializers import (
    CategorySerializer, SubCategorySerializer, TownSerializer, LocalitySerializer,
    EstablishmentListSerializer, EstablishmentDetailSerializer, EstablishmentWriteSerializer,
    EstablishmentSuggestionSerializer, ListingCorrectionSerializer
)
from .services import process_csv_import, detect_potential_duplicates

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('display_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class TownListView(generics.ListAPIView):
    queryset = Town.objects.all().order_by('name')
    serializer_class = TownSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class LocalityListView(generics.ListAPIView):
    serializer_class = LocalitySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = Locality.objects.all().select_related('town').order_by('name')
        town_id = self.request.query_params.get('town')
        town_slug = self.request.query_params.get('town_slug')
        if town_id:
            qs = qs.filter(town_id=town_id)
        elif town_slug:
            qs = qs.filter(town__slug=town_slug)
        return qs

class EstablishmentListView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EstablishmentWriteSerializer
        return EstablishmentListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        # Public users see verified and pending_verification; archived/rejected are hidden
        is_admin = self.request.user and self.request.user.is_staff
        if is_admin and self.request.query_params.get('include_all') == 'true':
            qs = Establishment.objects.all()
        else:
            qs = Establishment.objects.filter(status__in=['verified', 'pending_verification'])

        qs = qs.select_related('category', 'town', 'locality')

        # Filters
        category = self.request.query_params.get('category')
        if category:
            if category.isdigit():
                qs = qs.filter(category_id=category)
            else:
                qs = qs.filter(category__slug=category)

        town = self.request.query_params.get('town')
        if town:
            if town.isdigit():
                qs = qs.filter(town_id=town)
            else:
                qs = qs.filter(town__slug=town)

        locality = self.request.query_params.get('locality')
        if locality:
            qs = qs.filter(locality_id=locality)

        verification_status = self.request.query_params.get('verification_status')
        if verification_status:
            qs = qs.filter(verification_status=verification_status)

        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            try:
                qs = qs.filter(average_rating__gte=float(min_rating))
            except ValueError:
                pass

        # Search (English + Tamil + address)
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            qs = qs.filter(
                Q(name__icontains=search_query) |
                Q(tamil_name__icontains=search_query) |
                Q(address_line1__icontains=search_query) |
                Q(locality__name__icontains=search_query) |
                Q(town__name__icontains=search_query)
            )

        # Sorting
        sort = self.request.query_params.get('sort', 'alpha_asc')
        if sort == 'alpha_asc':
            qs = qs.order_by('name')
        elif sort == 'alpha_desc':
            qs = qs.order_by('-name')
        elif sort == 'rating_desc':
            qs = qs.order_by('-average_rating', '-review_count')
        elif sort == 'rating_asc':
            # Lowest rated places, displayed neutrally
            qs = qs.filter(review_count__gt=0).order_by('average_rating', 'name')
        elif sort == 'reviews_desc':
            qs = qs.order_by('-review_count', '-average_rating')
        elif sort == 'newest':
            qs = qs.order_by('-created_at')
        elif sort == 'recently_updated':
            qs = qs.order_by('-updated_at')
        else:
            qs = qs.order_by('name')

        return qs

class EstablishmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def get_queryset(self):
        return Establishment.objects.all().select_related('category', 'subcategory', 'town', 'locality')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EstablishmentWriteSerializer
        return EstablishmentDetailSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

class EstablishmentSuggestionCreateView(generics.ListCreateAPIView):
    serializer_class = EstablishmentSuggestionSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return EstablishmentSuggestion.objects.all().select_related('category', 'town')

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(submitted_by=user)

class SuggestionApproveView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        suggestion = generics.get_object_or_404(EstablishmentSuggestion, pk=pk)
        if suggestion.status == 'approved':
            return Response({'error': 'Suggestion is already approved.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create unverified establishment from suggestion
        district = suggestion.town.district
        locality = None
        if suggestion.locality_name:
            locality, _ = Locality.objects.get_or_create(
                town=suggestion.town,
                name=suggestion.locality_name
            )

        est = Establishment.objects.create(
            name=suggestion.name,
            tamil_name=suggestion.tamil_name,
            category=suggestion.category,
            district=district,
            town=suggestion.town,
            locality=locality,
            address_line1=suggestion.address,
            phone=suggestion.phone,
            website=suggestion.website,
            source_type='user_suggestion',
            source_reference=f"Suggestion #{suggestion.id}",
            status='pending_verification',
            verification_status='listed'
        )

        suggestion.status = 'approved'
        suggestion.reviewed_by = request.user
        suggestion.review_notes = request.data.get('notes', 'Approved by administrator.')
        suggestion.save()

        return Response({
            'message': 'Suggestion approved and establishment listing created.',
            'establishment_id': str(est.id)
        }, status=status.HTTP_200_OK)

class CSVImportView(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'Please provide a valid CSV file.'}, status=status.HTTP_400_BAD_REQUEST)

        report = process_csv_import(file_obj, imported_by=request.user)
        return Response(report, status=status.HTTP_200_OK)

class DuplicateCheckView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        name = request.data.get('name', '')
        town_id = request.data.get('town')
        address = request.data.get('address', '')

        if not name:
            return Response({'error': 'Name is required to check duplicates.'}, status=status.HTTP_400_BAD_REQUEST)

        duplicates = detect_potential_duplicates(name, town_id, address)
        return Response({'potential_duplicates': duplicates})

class DirectoryStatsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apps.reviews.models import Review
        return Response({
            'total_establishments': Establishment.objects.filter(status__in=['verified', 'pending_verification']).count(),
            'verified_establishments': Establishment.objects.filter(status='verified').count(),
            'total_reviews': Review.objects.filter(status='published').count(),
            'total_categories': Category.objects.count(),
            'total_towns': Town.objects.count(),
        })
