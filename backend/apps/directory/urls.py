from django.urls import path
from .views import (
    CategoryListView, TownListView, LocalityListView,
    EstablishmentListView, EstablishmentDetailView,
    EstablishmentSuggestionCreateView, SuggestionApproveView,
    CSVImportView, DuplicateCheckView, DirectoryStatsView,
    DataImportRunListView, TriggerDataImportView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('towns/', TownListView.as_view(), name='town-list'),
    path('localities/', LocalityListView.as_view(), name='locality-list'),
    path('establishments/', EstablishmentListView.as_view(), name='establishment-list'),
    path('establishments/<uuid:id>/', EstablishmentDetailView.as_view(), name='establishment-detail'),
    path('establishment-suggestions/', EstablishmentSuggestionCreateView.as_view(), name='establishment-suggestion'),
    path('establishment-suggestions/<uuid:pk>/approve/', SuggestionApproveView.as_view(), name='suggestion-approve'),
    path('check-duplicates/', DuplicateCheckView.as_view(), name='check-duplicates'),
    path('admin/establishments/csv-import/', CSVImportView.as_view(), name='admin-csv-import'),
    path('admin/check-duplicates/', DuplicateCheckView.as_view(), name='admin-check-duplicates'),
    path('admin/import-runs/', DataImportRunListView.as_view(), name='admin-import-runs'),
    path('admin/trigger-import/', TriggerDataImportView.as_view(), name='admin-trigger-import'),
    path('stats/', DirectoryStatsView.as_view(), name='directory-stats'),
]
