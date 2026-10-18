import io
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from .models import District, Town, Locality, Category, Establishment, EstablishmentSuggestion
from .services import detect_potential_duplicates, process_csv_import

class DirectoryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_user',
            email='admin@tirunelveli.local',
            password='adminpassword123'
        )
        self.user = User.objects.create_user(
            username='regular_user',
            email='user@tirunelveli.local',
            password='userpassword123'
        )

        self.district = District.objects.create(name='Tirunelveli', tamil_name='திருநெல்வேலி', slug='tirunelveli')
        self.town_city = Town.objects.create(district=self.district, name='Tirunelveli City', slug='tirunelveli-city')
        self.town_palay = Town.objects.create(district=self.district, name='Palayamkottai', slug='palayamkottai')

        self.locality_town = Locality.objects.create(town=self.town_city, name='Town', postal_code='627006')
        self.locality_high_ground = Locality.objects.create(town=self.town_palay, name='High Ground', postal_code='627002')

        self.cat_hospitals = Category.objects.create(name='Hospitals & Clinics', slug='hospitals', display_order=1)
        self.cat_schools = Category.objects.create(name='Schools', slug='schools', display_order=2)

        # Create sample establishments
        self.est_b = Establishment.objects.create(
            name='Bharath Hospital',
            tamil_name='பாரத் மருத்துவமனை',
            category=self.cat_hospitals,
            district=self.district,
            town=self.town_city,
            locality=self.locality_town,
            address_line1='North Car Street',
            status='verified',
            verification_status='official_verified',
            average_rating=4.5,
            review_count=10
        )

        self.est_a = Establishment.objects.create(
            name='Apex Higher Secondary School',
            tamil_name='அபெக்ஸ் மேல்நிலைப் பள்ளி',
            category=self.cat_schools,
            district=self.district,
            town=self.town_palay,
            locality=self.locality_high_ground,
            address_line1='College Road',
            status='verified',
            verification_status='checked',
            average_rating=4.2,
            review_count=5
        )

        self.est_c = Establishment.objects.create(
            name='City General Clinic',
            tamil_name='சிட்டி பொது கிளினிக்',
            category=self.cat_hospitals,
            district=self.district,
            town=self.town_city,
            address_line1='Junction Road',
            status='pending_verification',
            verification_status='listed',
            average_rating=0.0,
            review_count=0
        )

    def test_establishment_list_and_pagination(self):
        response = self.client.get(reverse('establishment-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results contain pagination results
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 3)

    def test_alphabetical_sorting_a_to_z(self):
        response = self.client.get(f"{reverse('establishment-list')}?sort=alpha_asc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        names = [r['name'] for r in results]
        # Should be strictly alphabetical: Apex -> Bharath -> City General Clinic
        self.assertEqual(names, ['Apex Higher Secondary School', 'Bharath Hospital', 'City General Clinic'])

    def test_reverse_alphabetical_sorting_z_to_a(self):
        response = self.client.get(f"{reverse('establishment-list')}?sort=alpha_desc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        names = [r['name'] for r in results]
        self.assertEqual(names, ['City General Clinic', 'Bharath Hospital', 'Apex Higher Secondary School'])

    def test_filter_by_category(self):
        response = self.client.get(f"{reverse('establishment-list')}?category=hospitals")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 2)
        for r in results:
            self.assertEqual(r['category_slug'], 'hospitals')

    def test_filter_by_town(self):
        response = self.client.get(f"{reverse('establishment-list')}?town=palayamkottai")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Apex Higher Secondary School')

    def test_search_by_english_and_tamil(self):
        # Search English
        resp_en = self.client.get(f"{reverse('establishment-list')}?search=Bharath")
        self.assertEqual(resp_en.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp_en.data['results']), 1)
        self.assertEqual(resp_en.data['results'][0]['name'], 'Bharath Hospital')

        # Search Tamil
        resp_ta = self.client.get(f"{reverse('establishment-list')}?search=பாரத்")
        self.assertEqual(resp_ta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp_ta.data['results']), 1)
        self.assertEqual(resp_ta.data['results'][0]['name'], 'Bharath Hospital')

    def test_duplicate_detection(self):
        dupes = detect_potential_duplicates('Bharath Hospital', self.town_city)
        self.assertTrue(len(dupes) > 0)
        self.assertEqual(dupes[0]['confidence'], 'HIGH')

    def test_csv_import_validation_and_unverified_status(self):
        csv_content = """name,tamil_name,category_slug,town_name,locality_name,address_line1,address_line2,postal_code,phone,email,website
St Johns Higher Secondary School,செயிண்ட் ஜான்ஸ் பள்ளி,schools,Palayamkottai,High Ground,Courtallam Road,,627002,04622572700,,https://stjohns.edu
"""
        csv_file = io.StringIO(csv_content)
        report = process_csv_import(csv_file, imported_by=self.admin)
        self.assertEqual(report['successful_imports'], 1)
        self.assertEqual(len(report['rejected_rows']), 0)

        imported = Establishment.objects.get(name='St Johns Higher Secondary School')
        # Crucial requirement: imported records MUST NOT automatically become verified!
        self.assertEqual(imported.status, 'pending_verification')
        self.assertEqual(imported.verification_status, 'listed')

    def test_suggest_missing_place_and_admin_approval(self):
        # Visitor submits suggestion
        payload = {
            'name': 'Tamirabarani Riverwalk Park',
            'tamil_name': 'தாமிரபரணி பூங்கா',
            'category': str(self.cat_schools.id), # just valid category
            'town': str(self.town_city.id),
            'locality_name': 'Kokkirakulam',
            'address': 'Near Sulochana Mudaliar Bridge, Kokkirakulam',
            'phone': '',
            'website': '',
            'notes': 'Scenic public garden recently opened.'
        }
        resp = self.client.post(reverse('establishment-suggestion'), payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        sug_id = resp.data['id']

        # Admin approves suggestion
        self.client.force_authenticate(user=self.admin)
        approve_resp = self.client.post(reverse('suggestion-approve', kwargs={'pk': sug_id}))
        self.assertEqual(approve_resp.status_code, status.HTTP_200_OK)

        # Check establishment was created
        created_est = Establishment.objects.get(name='Tamirabarani Riverwalk Park')
        self.assertEqual(created_est.status, 'pending_verification')
        self.assertEqual(created_est.source_type, 'user_suggestion')
