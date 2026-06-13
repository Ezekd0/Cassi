import json
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseForbidden, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from .models import Listing, Review, Subscription, TrafficCounter, PageView
from django.utils import timezone

def serialize_listing(listing):
    return {
        'id': listing.id,
        'title': listing.title,
        'slug': listing.slug,
        'category': listing.category,
        'price': float(listing.price),
        'region': listing.region,
        'google_map_url': listing.google_map_url,
        'description': listing.description,
        'main_image': listing.main_image.url if listing.main_image else None,
        'video_url': listing.video_url,
        'is_verified': listing.is_verified,
        'is_approved': listing.is_approved,
        'status': listing.status,
        'contact_phone': listing.contact_phone,
        'created_at': listing.created_at.isoformat(),
        'car_year': listing.car_year,
        'car_transmission': listing.car_transmission,
        'car_cracks_faults': listing.car_cracks_faults,
        'house_bedrooms': listing.house_bedrooms,
        'house_condition_integrity': listing.house_condition_integrity,
        'house_document': listing.house_document,
        'art_medium': listing.art_medium,
        'land_size': listing.land_size,
        'suit_size': listing.suit_size,
        'suit_material': listing.suit_material,
        'suit_style': listing.suit_style,
        'average_rating': listing.average_rating,
        'review_count': listing.reviews.count(),
        'view_count': listing.view_count
    }


def record_page_view(request):
    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key

    # Record current view activity
    PageView.objects.update_or_create(
        session_key=session_key,
        defaults={'timestamp': timezone.now()}
    )

    # Increment global views counter
    counter, _ = TrafficCounter.objects.get_or_create(id=1)
    counter.total_views += 1
    counter.save()


def api_catalog_home(request):
    record_page_view(request)
    if request.user.is_authenticated and request.user.is_staff:
        # Admins/Managers see both approved and draft available listings
        listings = Listing.objects.filter(status='available')
    else:
        listings = Listing.objects.filter(status='available', is_approved=True)
        
    category_filter = request.GET.get('category')
    if category_filter:
        listings = listings.filter(category=category_filter)
        
    listings_data = [serialize_listing(listing) for listing in listings]
    return JsonResponse({'listings': listings_data})

def api_sold_showcase(request):
    if request.user.is_authenticated and request.user.is_staff:
        listings = Listing.objects.filter(status='sold')
    else:
        listings = Listing.objects.filter(status='sold', is_approved=True)
        
    category_filter = request.GET.get('category')
    if category_filter:
        listings = listings.filter(category=category_filter)
        
    listings_data = [serialize_listing(listing) for listing in listings]
    return JsonResponse({'listings': listings_data})

def api_listing_detail(request, slug):
    if request.user.is_authenticated and request.user.is_staff:
        listing = get_object_or_404(Listing, slug=slug)
    else:
        listing = get_object_or_404(Listing, slug=slug, is_approved=True)
        
    record_page_view(request)
    listing.view_count += 1
    listing.save()

        
    # Discover More section: Mixed feed of other currently available listings
    similar_deals = Listing.objects.filter(status='available', is_approved=True).exclude(id=listing.id).order_by('?')[:6]
    similar_serialized = [serialize_listing(d) for d in similar_deals]
    
    reviews = [{
        'id': r.id,
        'reviewer_name': r.reviewer_name,
        'rating': r.rating,
        'comment': r.comment,
        'created_at': r.created_at.isoformat()
    } for r in listing.reviews.all()]
    
    return JsonResponse({
        'listing': serialize_listing(listing),
        'reviews': reviews,
        'similar_deals': similar_serialized
    })

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            role = 'superuser' if user.is_superuser else 'manager' if user.is_staff else 'visitor'
            return JsonResponse({
                'success': True,
                'user': {
                    'username': user.username,
                    'role': role
                }
            })
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_logout(request):
    logout(request)
    return JsonResponse({'success': True})

def api_me(request):
    if request.user.is_authenticated:
        user = request.user
        role = 'superuser' if user.is_superuser else 'manager' if user.is_staff else 'visitor'
        return JsonResponse({
            'isAuthenticated': True,
            'user': {
                'username': user.username,
                'role': role
            }
        })
    return JsonResponse({
        'isAuthenticated': False,
        'user': {
            'role': 'visitor'
        }
    })

@csrf_exempt
def api_approve_listing(request, slug):
    if not (request.user.is_authenticated and request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    listing = get_object_or_404(Listing, slug=slug)
    listing.is_approved = True
    listing.save()
    return JsonResponse({'success': True, 'listing': serialize_listing(listing)})

@csrf_exempt
def api_delete_listing(request, slug):
    if not (request.user.is_authenticated and request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    listing = get_object_or_404(Listing, slug=slug)
    listing.delete()
    return JsonResponse({'success': True})

@csrf_exempt
def api_change_category(request, slug):
    if not (request.user.is_authenticated and request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    listing = get_object_or_404(Listing, slug=slug)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_category = data.get('category')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        if new_category in dict(Listing.CATEGORY_CHOICES):
            listing.category = new_category
            listing.save()
            return JsonResponse({'success': True, 'listing': serialize_listing(listing)})
        return JsonResponse({'error': 'Invalid category choice'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_submit_review(request, slug):
    if request.method == 'POST':
        listing = get_object_or_404(Listing, slug=slug, status='sold')
        try:
            data = json.loads(request.body)
            reviewer_name = data.get('reviewer_name', 'Anonymous')
            rating = data.get('rating')
            comment = data.get('comment')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        if rating and comment:
            review = Review.objects.create(
                listing=listing,
                reviewer_name=reviewer_name or "Anonymous",
                rating=int(rating),
                comment=comment
            )
            return JsonResponse({
                'success': True,
                'review': {
                    'id': review.id,
                    'reviewer_name': review.reviewer_name,
                    'rating': review.rating,
                    'comment': review.comment,
                    'created_at': review.created_at.isoformat()
                }
            })
        return JsonResponse({'error': 'Rating and comment fields are required'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_delete_review(request, review_id):
    if not (request.user.is_authenticated and request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    review = get_object_or_404(Review, id=review_id)
    review.delete()
    return JsonResponse({'success': True})


@csrf_exempt
def api_subscribe(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            contact_info = data.get('contact_info')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)

        if contact_info:
            subscription = Subscription.objects.create(contact_info=contact_info)
            return JsonResponse({
                'success': True,
                'subscription': {
                    'id': subscription.id,
                    'contact_info': subscription.contact_info,
                    'created_at': subscription.created_at.isoformat()
                }
            })
        return JsonResponse({'error': 'Contact info is required'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


def api_analytics(request):
    if not (request.user.is_authenticated and request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    # Total Views
    counter, _ = TrafficCounter.objects.get_or_create(id=1)
    total_views = counter.total_views

    # Active Browsers (unique session keys in last 15 minutes)
    fifteen_minutes_ago = timezone.now() - timezone.timedelta(minutes=15)
    active_browsers = PageView.objects.filter(timestamp__gte=fifteen_minutes_ago).values('session_key').distinct().count()

    # Popular Listings (most viewed first)
    popular_listings = Listing.objects.all().order_by('-view_count')[:10]
    popular_data = [{
        'id': item.id,
        'title': item.title,
        'slug': item.slug,
        'category': item.category,
        'price': float(item.price),
        'status': item.status,
        'view_count': item.view_count,
        'is_approved': item.is_approved
    } for item in popular_listings]

    # All Listings (for control panel list)
    all_listings = Listing.objects.all().order_by('-created_at')
    all_listings_data = [serialize_listing(item) for item in all_listings]

    # All Reviews (for moderation panel)
    all_reviews = Review.objects.all().order_by('-created_at')
    all_reviews_data = [{
        'id': r.id,
        'listing_title': r.listing.title,
        'listing_slug': r.listing.slug,
        'reviewer_name': r.reviewer_name,
        'rating': r.rating,
        'comment': r.comment,
        'created_at': r.created_at.isoformat()
    } for r in all_reviews]

    # Subscriptions (leads)
    all_subscriptions = Subscription.objects.all().order_by('-created_at')
    all_subs_data = [{
        'id': s.id,
        'contact_info': s.contact_info,
        'created_at': s.created_at.isoformat()
    } for s in all_subscriptions]

    return JsonResponse({
        'total_views': total_views,
        'active_browsers': active_browsers,
        'popular_listings': popular_data,
        'all_listings': all_listings_data,
        'all_reviews': all_reviews_data,
        'all_subscriptions': all_subs_data
    })


@csrf_exempt
def api_toggle_status(request, slug):
    if not (request.user.is_authenticated and request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    listing = get_object_or_404(Listing, slug=slug)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_status = data.get('status')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)

        if new_status in ['available', 'sold']:
            listing.status = new_status
            listing.save()
            return JsonResponse({'success': True, 'listing': serialize_listing(listing)})
        return JsonResponse({'error': 'Invalid status choice'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


