from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.directory.models import District, Town, Category, Establishment
from .models import Review, ReviewReport

class ReviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='user_one',
            email='user1@tirunelveli.local',
            password='password123',
            display_name='User One'
        )
        self.user2 = User.objects.create_user(
            username='user_two',
            email='user2@tirunelveli.local',
            password='password123',
            display_name='User Two'
        )

        district = District.objects.create(name='Tirunelveli', slug='tirunelveli')
        town = Town.objects.create(district=district, name='Tirunelveli City', slug='tirunelveli-city')
        category = Category.objects.create(name='Hotels & Restaurants', slug='hotels-restaurants')

        self.establishment = Establishment.objects.create(
            name='Nellai Saravana Mess',
            tamil_name='நெல்லை சரவணா மெஸ்',
            category=category,
            district=district,
            town=town,
            address_line1='Swamy Sannathi Street, Town',
            status='verified'
        )

    def test_unauthenticated_user_cannot_submit_review(self):
        payload = {
            'rating': 5,
            'title': 'Outstanding Taste',
            'comment': 'Authentic traditional meals with fresh sambar and rasam.'
        }
        url = reverse('establishment-reviews', kwargs={'establishment_id': self.establishment.id})
        response = self.client.post(url, payload, format='json')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_rating_range_validation(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('establishment-reviews', kwargs={'establishment_id': self.establishment.id})

        # Test rating < 1
        resp_low = self.client.post(url, {'rating': 0, 'comment': 'Detailed comment here.'}, format='json')
        self.assertEqual(resp_low.status_code, status.HTTP_400_BAD_REQUEST)

        # Test rating > 5
        resp_high = self.client.post(url, {'rating': 6, 'comment': 'Detailed comment here.'}, format='json')
        self.assertEqual(resp_high.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_valid_review_and_aggregate_calculation(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('establishment-reviews', kwargs={'establishment_id': self.establishment.id})
        payload = {
            'rating': 5,
            'title': 'Top quality meals',
            'comment': 'Exceptional hot vegetarian meals served on plantain leaves with authentic Nellai flavor.',
            'review_category': 'Food Quality'
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.establishment.refresh_from_db()
        self.assertEqual(self.establishment.review_count, 1)
        self.assertEqual(self.establishment.average_rating, 5.0)
        self.assertEqual(self.establishment.rating_distribution['5'], 1)

    def test_duplicate_review_prevention(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('establishment-reviews', kwargs={'establishment_id': self.establishment.id})
        payload = {
            'rating': 5,
            'comment': 'First review submitted by user one.'
        }
        resp1 = self.client.post(url, payload, format='json')
        self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)

        # Second attempt should be rejected with 400
        payload_dup = {
            'rating': 4,
            'comment': 'Attempting second review for the same establishment.'
        }
        resp2 = self.client.post(url, payload_dup, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already reviewed', resp2.data['error'])

    def test_user_can_edit_own_review_but_not_others(self):
        # Create review by user 1
        review = Review.objects.create(
            establishment=self.establishment,
            user=self.user1,
            rating=4,
            comment='Good food and service overall in Tirunelveli.'
        )

        detail_url = reverse('review-detail', kwargs={'id': review.id})

        # User 2 tries to edit User 1's review -> 403 Forbidden
        self.client.force_authenticate(user=self.user2)
        resp_forbidden = self.client.patch(detail_url, {'rating': 2}, format='json')
        self.assertEqual(resp_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # User 1 edits own review -> 200 OK
        self.client.force_authenticate(user=self.user1)
        resp_ok = self.client.patch(detail_url, {'rating': 5, 'comment': 'Updated review with even higher satisfaction.'}, format='json')
        self.assertEqual(resp_ok.status_code, status.HTTP_200_OK)

        review.refresh_from_db()
        self.assertEqual(review.rating, 5)
        self.assertTrue(review.is_edited)

        # Recalculates establishment aggregate
        self.establishment.refresh_from_db()
        self.assertEqual(self.establishment.average_rating, 5.0)

    def test_multiple_reviews_average_and_distribution(self):
        # User 1 rates 5
        Review.objects.create(
            establishment=self.establishment,
            user=self.user1,
            rating=5,
            comment='5 star review by user one.'
        )
        # User 2 rates 3
        Review.objects.create(
            establishment=self.establishment,
            user=self.user2,
            rating=3,
            comment='3 star review by user two.'
        )

        self.establishment.refresh_from_db()
        self.assertEqual(self.establishment.review_count, 2)
        # (5 + 3) / 2 = 4.0
        self.assertEqual(self.establishment.average_rating, 4.0)
        self.assertEqual(self.establishment.rating_distribution['5'], 1)
        self.assertEqual(self.establishment.rating_distribution['3'], 1)
        self.assertEqual(self.establishment.rating_distribution['1'], 0)

    def test_review_reporting(self):
        review = Review.objects.create(
            establishment=self.establishment,
            user=self.user1,
            rating=1,
            comment='Review with questionable allegations.'
        )

        self.client.force_authenticate(user=self.user2)
        report_url = reverse('review-report', kwargs={'id': review.id})
        payload = {
            'reason': 'offensive_language',
            'details': 'This review contains inappropriate personal remarks.'
        }
        resp = self.client.post(report_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        # Verify report created
        self.assertTrue(ReviewReport.objects.filter(review=review, reported_by=self.user2).exists())
