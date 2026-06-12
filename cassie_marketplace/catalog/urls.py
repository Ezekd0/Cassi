from django.urls import path
from . import views

urlpatterns = [
    path('api/listings/', views.api_catalog_home, name='catalog_home'),
    path('api/listings/sold/', views.api_sold_showcase, name='sold_showcase'),
    path('api/listings/<slug:slug>/', views.api_listing_detail, name='listing_detail'),
    path('api/listings/<slug:slug>/approve/', views.api_approve_listing, name='approve_listing'),
    path('api/listings/<slug:slug>/delete/', views.api_delete_listing, name='delete_listing'),
    path('api/listings/<slug:slug>/change-category/', views.api_change_category, name='change_category'),
    path('api/listings/<slug:slug>/reviews/', views.api_submit_review, name='submit_review'),
    path('api/reviews/<int:review_id>/delete/', views.api_delete_review, name='delete_review'),
    path('api/auth/login/', views.api_login, name='api_login'),
    path('api/auth/logout/', views.api_logout, name='api_logout'),
    path('api/auth/me/', views.api_me, name='api_me'),
    path('api/subscribe/', views.api_subscribe, name='api_subscribe'),
]

