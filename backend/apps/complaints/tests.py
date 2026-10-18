from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.directory.models import District, Town, Category, Establishment
from .models import ComplaintChannel

class ComplaintChannelTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_officer',
            email='admin@tirunelveli.local',
            password='password123'
        )

        district = District.objects.create(name='Tirunelveli', slug='tirunelveli')
        town = Town.objects.create(district=district, name='Tirunelveli City', slug='tirunelveli-city')
        category = Category.objects.create(name='Government Offices', slug='government-offices')

        self.establishment = Establishment.objects.create(
            name='Tirunelveli Municipal Corporation Grievance Wing',
            category=category,
            district=district,
            town=town,
            address_line1='SN High Road, Tirunelveli',
            status='verified'
        )

        # 1. Verified & Available channel -> MUST be visible
        self.verified_channel = ComplaintChannel.objects.create(
            establishment=self.establishment,
            channel_type='portal',
            channel_name='Tirunelveli City Citizen Grievance Portal',
            receiving_organization='Tirunelveli City Municipal Corporation',
            official_url='https://tirunelvelicorporation.tn.gov.in/grievance',
            official_contact='0462-2329327',
            verified_source_url='https://cms.tn.gov.in/portal/tirunelveli',
            verification_status='verified',
            is_currently_available=True,
            instructions='Submit grievance with your ward number and photos if applicable.',
            administrative_notes='Verified against official municipal gazette notification.'
        )

        # 2. Unverified / Pending channel -> MUST be hidden from public
        self.pending_channel = ComplaintChannel.objects.create(
            establishment=self.establishment,
            channel_type='email',
            channel_name='Draft Support Email',
            receiving_organization='Tirunelveli City Municipal Corporation',
            official_contact='support@test.gov',
            verified_source_url='https://example.com/source',
            verification_status='pending',
            is_currently_available=True,
            instructions='Draft instructions.',
            administrative_notes='Pending verification with department.'
        )

        # 3. Disabled / Unavailable channel -> MUST be hidden from public
        self.disabled_channel = ComplaintChannel.objects.create(
            establishment=self.establishment,
            channel_type='helpline',
            channel_name='Temporary Toll-Free Helpline',
            receiving_organization='Tirunelveli City Municipal Corporation',
            official_contact='1800-425-0000',
            verified_source_url='https://cms.tn.gov.in',
            verification_status='verified',
            is_currently_available=False, # Disabled!
            instructions='Toll-free line.',
            administrative_notes='Temporarily out of service for maintenance.'
        )

    def test_public_endpoint_exposes_strictly_verified_and_available_channels(self):
        url = reverse('establishment-complaint-channels', kwargs={'establishment_id': self.establishment.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Must return EXACTLY 1 channel (the verified and available one)
        channels = response.data
        self.assertEqual(len(channels), 1)
        self.assertEqual(channels[0]['channel_name'], 'Tirunelveli City Citizen Grievance Portal')

        # Critical security & privacy check: administrative_notes must NOT be exposed
        self.assertNotIn('administrative_notes', channels[0])

    def test_establishment_indicator_reflects_verified_channel(self):
        # Listing endpoint should indicate has_verified_complaint_channel = True
        list_url = reverse('establishment-list')
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        est_data = [item for item in response.data['results'] if item['id'] == str(self.establishment.id)][0]
        self.assertTrue(est_data['has_verified_complaint_channel'])
