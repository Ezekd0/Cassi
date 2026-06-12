import tempfile
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from io import BytesIO
from .models import Listing, Review, Subscription
from .admin import ListingAdmin
from django.contrib.admin.sites import AdminSite

class ListingTestCase(TestCase):
    def setUp(self):
        # Create a mock image for uploads
        img_io = BytesIO()
        image = Image.new('RGB', (1600, 1600), color='red')
        image.save(img_io, format='JPEG')
        img_io.seek(0)
        self.mock_image = SimpleUploadedFile(
            "test_image.jpg",
            img_io.read(),
            content_type="image/jpeg"
        )
        
        # Create users
        self.superuser = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='testpassword'
        )
        self.staff_user = User.objects.create_user(
            username='cassie_test',
            email='cassie@test.com',
            password='testpassword',
            is_staff=True
        )
        
        # Create listings
        self.approved_listing = Listing.objects.create(
            title="Approved Villa",
            category="property",
            price=100000.00,
            region="Uyo",
            description="Nice approved villa",
            is_approved=True,
            house_bedrooms=4,
            house_document="C of O",
            house_condition_integrity="Pristine structural condition log.",
            main_image=self.mock_image
        )
        
        # Reset mock image seek for reuse
        img_io.seek(0)
        self.mock_image_2 = SimpleUploadedFile(
            "test_image_2.jpg",
            img_io.read(),
            content_type="image/jpeg"
        )
        self.draft_listing = Listing.objects.create(
            title="Draft Car",
            category="vehicle",
            price=50000.00,
            region="Lagos",
            description="Draft car description",
            is_approved=False,
            car_year=2018,
            car_transmission="automatic",
            car_cracks_faults="Windshield crack detected.",
            main_image=self.mock_image_2
        )

        # Create a fine art listing (category: soaked)
        img_io.seek(0)
        self.mock_image_3 = SimpleUploadedFile(
            "test_image_3.jpg",
            img_io.read(),
            content_type="image/jpeg"
        )
        self.art_listing = Listing.objects.create(
            title="Symphony Painting",
            category="soaked",
            price=75000.00,
            region="Lekki",
            description="Beautiful original painting",
            is_approved=True,
            art_medium="Oil on Canvas",
            main_image=self.mock_image_3
        )

        # Create a land listing under property (category: property)
        img_io.seek(0)
        self.mock_image_4 = SimpleUploadedFile(
            "test_image_4.jpg",
            img_io.read(),
            content_type="image/jpeg"
        )
        self.land_listing = Listing.objects.create(
            title="Osongama Plot",
            category="property",
            price=350000.00,
            region="Uyo",
            description="Premium commercial plot",
            is_approved=True,
            land_size="1 Full Plot",
            house_document="C of O",
            main_image=self.mock_image_4
        )

        # Create a sold listing
        img_io.seek(0)
        self.mock_image_5 = SimpleUploadedFile(
            "test_image_5.jpg",
            img_io.read(),
            content_type="image/jpeg"
        )
        self.sold_listing = Listing.objects.create(
            title="Bespoke Suit Solid",
            category="suits",
            price=120000.00,
            region="Lagos",
            description="Premium bespoke suit",
            is_approved=True,
            status="sold",
            suit_size="40R",
            main_image=self.mock_image_5
        )
        
        self.client = Client()

    def test_slug_generation_and_image_compression(self):
        # Verify slug is generated automatically based on title + region
        self.assertEqual(self.approved_listing.slug, "approved-villa-uyo")
        self.assertEqual(self.art_listing.slug, "symphony-painting-lekki")
        self.assertEqual(self.land_listing.slug, "osongama-plot-uyo")
        
        # Verify image was compressed and converted
        img = Image.open(self.approved_listing.main_image.path)
        self.assertEqual(img.format, 'JPEG')
        # Check size constraints
        self.assertTrue(img.size[0] <= 1200)
        self.assertTrue(img.size[1] <= 1200)

    def test_catalog_views_visibility_and_diagnostics(self):
        # Home view loads fine
        response = self.client.get(reverse('catalog_home'))
        self.assertEqual(response.status_code, 200)
        
        # Home view should contain approved listing, art, and land, but NOT draft or sold
        self.assertContains(response, self.approved_listing.title)
        self.assertContains(response, self.art_listing.title)
        self.assertContains(response, self.land_listing.title)
        self.assertNotContains(response, self.draft_listing.title)
        self.assertNotContains(response, self.sold_listing.title)

        # Detail view for approved villa loads fine and displays integrity log
        response = self.client.get(reverse('listing_detail', kwargs={'slug': self.approved_listing.slug}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Pristine structural condition log.")
        self.assertContains(response, "C of O")

        # Detail view for art listing loads fine
        response = self.client.get(reverse('listing_detail', kwargs={'slug': self.art_listing.slug}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Oil on Canvas")

    def test_sold_showcase_and_ratings(self):
        # Sold showcase page loads fine
        response = self.client.get(reverse('sold_showcase'))
        self.assertEqual(response.status_code, 200)
        # Should contain sold listing, but NOT active listings
        self.assertContains(response, self.sold_listing.title)
        self.assertNotContains(response, self.approved_listing.title)

        # Post a review to the sold listing using JSON content type
        import json
        review_data = {
            'reviewer_name': 'Chief John',
            'rating': '5',
            'comment': 'Perfect tailored fit, excellent service!'
        }
        submit_url = reverse('submit_review', kwargs={'slug': self.sold_listing.slug})
        response = self.client.post(submit_url, json.dumps(review_data), content_type='application/json')
        # Should return success JSON status
        self.assertEqual(response.status_code, 200)
        
        # Check review is in database and updates average rating
        self.assertEqual(self.sold_listing.reviews.count(), 1)
        self.assertEqual(self.sold_listing.average_rating, 5.0)

        # Detail page displays review details in JSON payload
        detail_url = reverse('listing_detail', kwargs={'slug': self.sold_listing.slug})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Chief John")
        self.assertContains(response, "Perfect tailored fit, excellent service!")

    def test_admin_permissions_fields(self):
        from django.test import RequestFactory
        factory = RequestFactory()
        site = AdminSite()
        admin_instance = ListingAdmin(Listing, site)
        
        super_req = factory.get('/admin/catalog/listing/')
        super_req.user = self.superuser
        
        staff_req = factory.get('/admin/catalog/listing/')
        staff_req.user = self.staff_user
        
        # Superuser should be able to see all fields, including is_approved
        super_fields = admin_instance.get_fields(super_req)
        self.assertIn('is_approved', super_fields)
        
        # Staff user should also see the is_approved field as manager (upgraded permission)
        staff_fields = admin_instance.get_fields(staff_req)
        self.assertIn('is_approved', staff_fields)

    def test_admin_permissions_actions_and_deletes(self):
        from django.test import RequestFactory
        factory = RequestFactory()
        site = AdminSite()
        admin_instance = ListingAdmin(Listing, site)
        
        super_req = factory.get('/admin/catalog/listing/')
        super_req.user = self.superuser
        
        staff_req = factory.get('/admin/catalog/listing/')
        staff_req.user = self.staff_user

        # Superuser should have 'approve_listings' and 'archive_listings' actions
        super_actions = admin_instance.get_actions(super_req)
        self.assertIn('approve_listings', super_actions)
        self.assertIn('archive_listings', super_actions)

        # Staff user should also have 'approve_listings' action as manager
        staff_actions = admin_instance.get_actions(staff_req)
        self.assertIn('approve_listings', staff_actions)

        # Superuser and Staff user should both have delete permissions
        self.assertTrue(admin_instance.has_delete_permission(super_req))
        self.assertTrue(admin_instance.has_delete_permission(staff_req))

    def test_frontend_quick_actions(self):
        # Visitor cannot approve, edit, or delete items via direct URL routes
        approve_url = reverse('approve_listing', kwargs={'slug': self.draft_listing.slug})
        delete_url = reverse('delete_listing', kwargs={'slug': self.draft_listing.slug})
        
        response = self.client.get(approve_url)
        # Should return 403 Forbidden for JSON API
        self.assertEqual(response.status_code, 403)

        # Log in as Manager (staff)
        self.client.login(username='cassie_test', password='testpassword')
        
        # Manager can approve draft items
        response = self.client.get(approve_url)
        self.assertEqual(response.status_code, 200)
        self.draft_listing.refresh_from_db()
        self.assertTrue(self.draft_listing.is_approved)

        # Manager can delete items
        response = self.client.get(delete_url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Listing.objects.filter(id=self.draft_listing.id).exists())

    def test_subscription(self):
        import json
        sub_data = {
            'contact_info': 'victor_test@cassi.com'
        }
        response = self.client.post(
            reverse('api_subscribe'),
            json.dumps(sub_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Subscription.objects.count(), 1)
        self.assertEqual(Subscription.objects.first().contact_info, 'victor_test@cassi.com')

        # Test invalid subscription payload
        response = self.client.post(
            reverse('api_subscribe'),
            json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

