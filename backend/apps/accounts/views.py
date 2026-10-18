import logging
import uuid
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import User
from .serializers import UserSerializer, GoogleAuthSerializer
from .authentication import generate_jwt_token

logger = logging.getLogger(__name__)

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        credential = serializer.validated_data.get('credential')
        email = None
        google_sub = None
        name = ''
        picture = ''

        # 1. Attempt verification with Google's public keys if credential provided
        if credential:
            try:
                # If Google client ID configured, verify with audience check
                client_id = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
                id_info = id_token.verify_oauth2_token(
                    credential,
                    google_requests.Request(),
                    audience=client_id,
                    clock_skew_in_seconds=10
                )
                email = id_info.get('email')
                google_sub = id_info.get('sub')
                name = id_info.get('name', '')
                picture = id_info.get('picture', '')
            except Exception as e:
                logger.warning(f"Google ID token verification failed: {str(e)}")
                # If test mode is enabled, permit fallback
                if not settings.GOOGLE_OAUTH_TEST_MODE:
                    return Response(
                        {"error": "Invalid or expired Google authentication credential."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

        # 2. Support test/demo mode when explicitly allowed
        if not email and settings.GOOGLE_OAUTH_TEST_MODE:
            email = serializer.validated_data.get('email')
            name = serializer.validated_data.get('name', 'Community Reviewer')
            picture = serializer.validated_data.get('picture', '')
            google_sub = f"test-sub-{email}"

        if not email:
            return Response(
                {"error": "Authentication could not identify user email."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Retrieve or create user record securely
        username = email.split('@')[0]
        # Ensure unique username
        existing_username = User.objects.filter(username=username).exclude(email=email).first()
        if existing_username:
            username = f"{username}_{uuid.uuid4().hex[:6]}"

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'display_name': name or username,
                'profile_picture_url': picture,
                'google_sub': google_sub,
            }
        )

        # Update profile if information has evolved
        updated = False
        if name and not user.display_name:
            user.display_name = name
            updated = True
        if picture and not user.profile_picture_url:
            user.profile_picture_url = picture
            updated = True
        if google_sub and not user.google_sub:
            user.google_sub = google_sub
            updated = True
        if updated:
            user.save()

        # 4. Generate secure JWT token
        token = generate_jwt_token(user)

        return Response({
            'token': token,
            'user': UserSerializer(user).data,
            'message': 'Successfully authenticated with Google.'
        }, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        User account deletion adhering to published data retention policy.
        Anonymizes reviews to preserve community ratings history without retaining private identifiers.
        """
        user = request.user
        # Anonymize user records and mark user inactive
        user.display_name = "Deactivated Account"
        user.email = f"deleted_{user.id}@deleted.local"
        user.profile_picture_url = ""
        user.google_sub = None
        user.is_active = False
        user.save()

        return Response(
            {"message": "Your account has been deleted and personal data removed in accordance with policy."},
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Successfully signed out."}, status=status.HTTP_200_OK)
