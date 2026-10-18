from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User
from .authentication import generate_jwt_token

class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='citizen_nellai',
            email='citizen@tirunelveli.local',
            display_name='Nellai Citizen',
            password='testpassword123'
        )

    def test_jwt_token_generation_and_authentication(self):
        token = generate_jwt_token(self.user)
        self.assertIsNotNone(token)

        # Access protected endpoint with Bearer token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(reverse('auth-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'citizen@tirunelveli.local')
        self.assertEqual(response.data['display_name'], 'Nellai Citizen')

    def test_unauthenticated_access_denied_on_protected_endpoints(self):
        response = self.client.get(reverse('auth-me'))
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_google_auth_test_mode_endpoint(self):
        payload = {
            'email': 'newvisitor@tirunelveli.local',
            'name': 'Visitor Palayamkottai',
            'picture': 'https://example.com/avatar.jpg'
        }
        response = self.client.post(reverse('auth-google'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['display_name'], 'Visitor Palayamkottai')

        # Verify user created in database
        self.assertTrue(User.objects.filter(email='newvisitor@tirunelveli.local').exists())

    def test_account_deletion_anonymization(self):
        token = generate_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.delete(reverse('auth-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertEqual(self.user.display_name, 'Deactivated Account')
        self.assertTrue('deleted_' in self.user.email)
