import os
import sys
import django
import glob
from django.core.files import File

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from catalog.models import Listing

def seed():
    print("Starting database seeding...")
    
    # 1. Create Superuser (Lead Admin)
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@cassiehub.com', 'adminpass123')
        print("Superuser created successfully: admin / adminpass123")
    else:
        print("Superuser 'admin' already exists.")

    # 2. Create Staff User (Cassie)
    if not User.objects.filter(username='cassie').exists():
        cassie_user = User.objects.create_user('cassie', 'cassie@cassiehub.com', 'cassiepass123', is_staff=True)
        print("Staff user created successfully: cassie / cassiepass123")
    else:
        cassie_user = User.objects.get(username='cassie')
        print("Staff user 'cassie' already exists.")

    # Assign permissions to Cassie to manage Listings in Admin Panel
    from django.contrib.contenttypes.models import ContentType
    from django.contrib.auth.models import Permission
    content_type = ContentType.objects.get_for_model(Listing)
    permissions = Permission.objects.filter(content_type=content_type)
    for perm in permissions:
        if perm.codename in ['view_listing', 'add_listing', 'change_listing']:
            cassie_user.user_permissions.add(perm)
            print(f"Granted permission '{perm.codename}' to Cassie.")

    # 3. Locate Generated Images
    brain_dir = '/home/victor/.gemini/antigravity/brain/193e96fd-0215-4337-9f79-c8cf6afc4d0f'
    house_files = glob.glob(os.path.join(brain_dir, 'luxury_house_uyo_*.png'))
    car_files = glob.glob(os.path.join(brain_dir, 'luxury_car_mercedes_*.png'))
    art_files = glob.glob(os.path.join(brain_dir, 'luxury_art_painting_*.png'))
    land_files = glob.glob(os.path.join(brain_dir, 'luxury_land_plot_*.png'))
    
    house_img_path = house_files[0] if house_files else None
    car_img_path = car_files[0] if car_files else None
    art_img_path = art_files[0] if art_files else None
    land_img_path = land_files[0] if land_files else None
    
    if not house_img_path or not car_img_path or not art_img_path or not land_img_path:
        print(f"Error: Mockup images not found in {brain_dir}. Cannot proceed with seeding.")
        return

    # Clear existing listings to avoid duplicates
    Listing.objects.all().delete()
    print("Cleared existing listings.")

    # 4. Create Listings
    listings_data = [
        {
            'title': 'Modern 4 Bedroom Villa with Pool',
            'category': 'property',
            'price': 120000000.00,
            'region': 'Uyo, Akwa Ibom',
            'google_map_url': 'https://maps.google.com/?q=Uyo+Akwa+Ibom',
            'description': 'A breathtaking luxury villa with state of the art finishes, a private pool, and pristine location in Uyo.\n\nFeaturing:\n- 4 Spacious Bedrooms (all en-suite)\n- Modern fully-fitted kitchen\n- High ceilings with premium lighting\n- Swimming pool with filtration system\n- 24/7 power backup and security',
            'is_verified': True,
            'is_approved': True,
            'status': 'available',
            'contact_phone': '2348148714875',
            'house_bedrooms': 4,
            'house_document': 'C of O',
            'house_condition_integrity': 'Pristine structural rating. Zero wall cracks, roof moisture scan negative, foundation settlement audit complete and passed.',
            'image_path': house_img_path
        },
        {
            'title': 'Mercedes Benz C300 (2021 AMG Sport)',
            'category': 'vehicle',
            'price': 45000000.00,
            'region': 'Ikeja, Lagos',
            'google_map_url': 'https://maps.google.com/?q=Ikeja+Lagos',
            'description': 'A clean Tokunbo 2021 Mercedes Benz C300 AMG Sport package. Sleek charcoal exterior, orange brake calipers, fully loaded with premium sound, panoramic roof, and low mileage.\n\nDetails:\n- Mercedes AMG Styling Package\n- 2.0L Turbocharged Engine\n- 9-Speed Automatic Transmission\n- Premium leather seats with heating/cooling\n- Android Auto and Apple CarPlay support',
            'is_verified': True,
            'is_approved': True,
            'status': 'available',
            'contact_phone': '2348148714875',
            'car_year': 2021,
            'car_transmission': 'automatic',
            'car_cracks_faults': 'Windshield original and pristine with zero cracks. Small paint chip near driver-side door handles. Onboard computer diagnostics scanned: zero active check engine fault codes.',
            'image_path': car_img_path
        },
        {
            'title': 'Sunset Symphony Abstract Canvas',
            'category': 'soaked',
            'price': 85000.00,
            'region': 'Lekki, Lagos',
            'google_map_url': 'https://maps.google.com/?q=Lekki+Lagos',
            'description': 'An original, modern abstract oil painting featuring warm sunset shades and deep charcoal highlights. Framed in a premium black wood float frame.\n\nSpecifications:\n- Dimensions: 40 x 40 inches\n- Medium: Oil on canvas texture\n- Signed by artist on front and reverse\n- Hand-delivered within Lagos with gallery certificate of authenticity',
            'is_verified': True,
            'is_approved': True,
            'status': 'available',
            'contact_phone': '2348148714875',
            'art_medium': 'Oil on Canvas',
            'image_path': art_img_path
        },
        {
            'title': '2 Plots of Commercial Land in Osongama',
            'category': 'property',
            'price': 35000000.00,
            'region': 'Osongama, Uyo',
            'google_map_url': 'https://maps.google.com/?q=Osongama+Uyo',
            'description': 'Premium dry land located in the high-density commercial district of Osongama, Uyo. Perfect for hotels, shopping plazas, corporate offices, or premium residential blocks.\n\nFeatures:\n- 2 Full Plots (approximately 120ft x 120ft)\n- 100% dry and level table land\n- Located directly along tarred access road\n- Fast-appreciating prime investment layout',
            'is_verified': True,
            'is_approved': True,
            'status': 'available',
            'contact_phone': '2348148714875',
            'land_size': '2 Full Plots (120ft x 120ft)',
            'house_document': 'Registered Survey & Deed',
            'image_path': land_img_path
        },
        {
            'title': 'Bespoke Charcoal 3-Piece Italian Wool Suit',
            'category': 'suits',
            'price': 250000.00,
            'region': 'Ikeja, Lagos',
            'google_map_url': 'https://maps.google.com/?q=Ikeja+Lagos',
            'description': 'A masterfully tailored 3-piece bespoke suit made from ultra-premium Italian Super 150s virgin wool. Perfect for corporate leadership, executive boardrooms, and high-end formal events.\n\nTailoring Details:\n- Custom slim-fit silhouette\n- Breathable silk lining\n- Hand-stitched lapel detailing\n- Includes jacket, vest, and trousers',
            'is_verified': True,
            'is_approved': True,
            'status': 'available',
            'contact_phone': '2348148714875',
            'suit_size': '42R Jacket / 34W Trousers',
            'suit_material': 'Italian Super 150s Virgin Wool',
            'suit_style': 'Bespoke Executive 3-Piece',
            'image_path': art_img_path
        },
        {
            'title': 'Semi-Detached 5 Bedroom Duplex',
            'category': 'property',
            'price': 150000000.00,
            'region': 'Ikeja, Lagos',
            'google_map_url': 'https://maps.google.com/?q=Ikeja+Lagos',
            'description': 'Beautiful duplex with a spacious compound and modern kitchen. Vetted and sold to a premium buyer.\n\nThis listing serves as social proof for Cassie\'s marketing network.',
            'is_verified': True,
            'is_approved': True,
            'status': 'sold',
            'contact_phone': '2348148714875',
            'house_bedrooms': 5,
            'house_document': "Governor's Consent",
            'house_condition_integrity': 'Solid foundation rating. Minor wear on external paint surfaces. Renovated bathrooms completed in 2025.',
            'image_path': house_img_path
        },
        {
            'title': 'Toyota Camry 2015 XLE',
            'category': 'vehicle',
            'price': 12500000.00,
            'region': 'Uyo, Akwa Ibom',
            'google_map_url': 'https://maps.google.com/?q=Uyo+Akwa+Ibom',
            'description': 'A highly reliable 2015 Toyota Camry XLE in excellent condition. Leather seats, backup camera, sound engine. Fully verified and ready to drive.',
            'is_verified': True,
            'is_approved': True,
            'status': 'available',
            'contact_phone': '2348148714875',
            'car_year': 2015,
            'car_transmission': 'automatic',
            'car_cracks_faults': 'Locally used. Front bumper scuffed slightly; windshield replaced in 2024. Engine and transmission run perfectly.',
            'image_path': car_img_path
        },
        {
            'title': 'Lekki Premium Waterfront Land (Draft / Unapproved)',
            'category': 'property',
            'price': 250000000.00,
            'region': 'Lekki, Lagos',
            'google_map_url': 'https://maps.google.com/?q=Lekki+Lagos',
            'description': 'Waterfront land in Lekki. Uploaded by Cassie, pending admin approval to go live on the public feed.',
            'is_verified': True,
            'is_approved': False,
            'status': 'available',
            'contact_phone': '2348148714875',
            'house_bedrooms': None,
            'house_document': 'Deed of Assignment',
            'image_path': house_img_path
        }
    ]

    for item in listings_data:
        image_path = item.pop('image_path')
        listing = Listing(**item)
        
        # Save image through the file system to trigger Pillow processing
        with open(image_path, 'rb') as f:
            listing.main_image.save(os.path.basename(image_path), File(f), save=False)
        
        listing.save()
        print(f"Added listing: {listing.title} ({'Live' if listing.is_approved else 'Draft'})")

    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed()
