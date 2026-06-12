import os
from django.db import models
from django.utils.text import slugify
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

class Listing(models.Model):
    CATEGORY_CHOICES = [
        ('suits', 'Suits'),
        ('soaked', 'Soaked'),
        ('property', 'Houses'),
        ('vehicle', 'Cars'),
    ]
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
    ]
    TRANSMISSION_CHOICES = [
        ('automatic', 'Automatic'),
        ('manual', 'Manual'),
    ]

    # Core Identifiers
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=275, unique=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='property')
    price = models.DecimalField(max_digits=15, decimal_places=2)
    region = models.CharField(max_length=100, help_text="e.g., Osongama, Uyo or Lekki, Lagos")
    google_map_url = models.URLField(blank=True, null=True)
    
    # Content & Media
    description = models.TextField()
    main_image = models.ImageField(upload_to='listings/main/')
    video_url = models.URLField(blank=True, null=True)
    
    # State Parameters
    is_verified = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='available')
    contact_phone = models.CharField(max_length=20, default="2348148714875")
    created_at = models.DateTimeField(auto_now_add=True)
    view_count = models.IntegerField(default=0)

    # 🚗 Vehicles Exclusive
    car_year = models.IntegerField(blank=True, null=True)
    car_transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, blank=True, null=True)
    car_cracks_faults = models.TextField(blank=True, null=True, verbose_name="Vehicle Damage & Body Cracks Report")

    # 🏠 Real Estate Exclusive
    house_bedrooms = models.IntegerField(blank=True, null=True)
    house_condition_integrity = models.TextField(blank=True, null=True, verbose_name="Structural Integrity & Wall Cracks Assessment")

    # 🪵 Shared/Other Attributes
    house_document = models.CharField(max_length=100, blank=True, null=True, verbose_name="Legal Title Documentation")
    art_medium = models.CharField(max_length=100, blank=True, null=True)
    land_size = models.CharField(max_length=100, blank=True, null=True)

    # 👔 Suits Exclusive
    suit_size = models.CharField(max_length=50, blank=True, null=True, verbose_name="Suit Size")
    suit_material = models.CharField(max_length=100, blank=True, null=True, verbose_name="Suit Material")
    suit_style = models.CharField(max_length=100, blank=True, null=True, verbose_name="Suit Style")

    class Meta:
        ordering = ['-status', '-created_at']

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            total = sum(r.rating for r in reviews)
            return round(total / reviews.count(), 1)
        return 0.0

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.title}-{self.region}")
        
        # Automated Mobile Upload Image Processing Pipeline
        is_new_image = False
        if self.main_image:
            if not self.pk:
                is_new_image = True
            else:
                try:
                    orig = Listing.objects.get(pk=self.pk)
                    if orig.main_image != self.main_image:
                        is_new_image = True
                except Listing.DoesNotExist:
                    is_new_image = True

        if is_new_image and self.main_image:
            img = Image.open(self.main_image)
            if img.mode in ("RGBA", "P"): img = img.convert("RGB")
            output = BytesIO()
            img.thumbnail((1200, 1200))
            img.save(output, format='JPEG', quality=75)
            output.seek(0)
            name = os.path.splitext(self.main_image.name)[0]
            self.main_image = ContentFile(output.read(), name=f"{name}.jpg")
        super().save(*args, **kwargs)


class Review(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='reviews')
    reviewer_name = models.CharField(max_length=100, default="Anonymous")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review ({self.rating}*) by {self.reviewer_name} on {self.listing.title}"


class Subscription(models.Model):
    contact_info = models.CharField(max_length=255, help_text="Email or WhatsApp number")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Subscription: {self.contact_info}"


class TrafficCounter(models.Model):
    total_views = models.IntegerField(default=0)

    def __str__(self):
        return f"Global Views: {self.total_views}"


class PageView(models.Model):
    session_key = models.CharField(max_length=40, db_index=True)
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"PageView by {self.session_key} at {self.timestamp}"


