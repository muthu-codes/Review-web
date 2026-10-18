import datetime
import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import User

def generate_jwt_token(user):
    """
    Generates a signed JWT token valid for JWT_EXPIRATION_DAYS.
    """
    expiration = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=settings.JWT_EXPIRATION_DAYS)
    payload = {
        'sub': str(user.id),
        'email': user.email,
        'is_staff': user.is_staff,
        'is_moderator': user.is_moderator,
        'exp': expiration,
        'iat': datetime.datetime.now(datetime.timezone.utc),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
    return token

class JWTAuthentication(authentication.BaseAuthentication):
    """
    DRF authentication class for Bearer JWT tokens.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Authentication token has expired.')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid authentication token.')

        user_id = payload.get('sub')
        try:
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError):
            raise exceptions.AuthenticationFailed('User associated with token does not exist.')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('User account is disabled.')

        return (user, token)
