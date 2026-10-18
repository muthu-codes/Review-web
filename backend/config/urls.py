from django.contrib import admin
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db_status = 'ok'
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
                if not row or row[0] != 1:
                    db_status = 'unexpected_response'
        except Exception as e:
            db_status = f'error: {str(e)}'

        return Response({
            'status': 'healthy' if db_status == 'ok' else 'degraded',
            'service': 'Review Web Backend (Tirunelveli District)',
            'database': db_status,
            'version': '1.0.0'
        })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', HealthCheckView.as_view(), name='api-health'),

    # OpenAPI 3.0 Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Core Application APIs
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.directory.urls')),
    path('api/v1/', include('apps.reviews.urls')),
    path('api/v1/', include('apps.complaints.urls')),
    path('api/v1/', include('apps.moderation.urls')),
]
