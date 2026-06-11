import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from catalog.models import Listing

print("--- Listing Database Verification ---")
listings = Listing.objects.all()
for l in listings:
    print(f"Title: {l.title}")
    print(f"  Slug: {l.slug}")
    print(f"  Category: {l.category}")
    print(f"  Approved: {l.is_approved}")
    print(f"  Image Field URL: {l.main_image.url if l.main_image else 'No Image'}")
    if l.main_image:
        print(f"  Image File Size on Disk: {l.main_image.size} bytes")
        # Check actual dimensions on disk using PIL
        from PIL import Image
        img = Image.open(l.main_image.path)
        print(f"  Image Format: {img.format}, Dimensions: {img.size}")
    print("-" * 40)
