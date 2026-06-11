from django.contrib import admin
from .models import Listing, Review

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'price', 'status', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'status', 'category')
    search_fields = ('title', 'region')
    prepopulated_fields = {'slug': ('title', 'region')}
    actions = ['approve_listings', 'archive_listings']

    # Separate data input models into explicit fieldset containers
    fieldsets = (
        ('General Information', {
            'fields': ('title', 'slug', 'category', 'price', 'region', 'google_map_url', 'status', 'contact_phone')
        }),
        ('Media & Pitch Details', {
            'fields': ('main_image', 'video_url', 'description')
        }),
        ('Suit Specifications', {
            'classes': ('grp-suits-specs',),
            'fields': ('suit_size', 'suit_material', 'suit_style')
        }),
        ('Vehicle Specifications', {
            'classes': ('grp-vehicle-specs',),
            'fields': ('car_year', 'car_transmission', 'car_cracks_faults')
        }),
        ('Real Estate Specifications', {
            'classes': ('grp-property-specs',),
            'fields': ('house_bedrooms', 'house_condition_integrity', 'house_document')
        }),
        ('Land Specifications', {
            'classes': ('grp-land-specs',),
            'fields': ('land_size',)
        }),
        ('Fine Art Specifications', {
            'classes': ('grp-art-specs',),
            'fields': ('art_medium',)
        }),
    )

    def has_delete_permission(self, request, obj=None):
        # Master Admin & Managers hold delete privileges
        return request.user.is_superuser or request.user.is_staff

    def get_fieldsets(self, request, obj=None):
        # Prevent mutating class-level fieldsets configuration via deep copy
        import copy
        fieldsets = copy.deepcopy(super().get_fieldsets(request, obj))
        if request.user.is_superuser or request.user.is_staff:
            # Inject management approval field at the top for Superusers & Managers
            if 'is_approved' not in fieldsets[0][1]['fields']:
                fieldsets[0][1]['fields'] = ('is_approved',) + fieldsets[0][1]['fields']
        return fieldsets

    def get_fields(self, request, obj=None):
        fields = []
        for name, options in self.get_fieldsets(request, obj):
            fields.extend(options.get("fields", []))
        return fields

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not (request.user.is_superuser or request.user.is_staff):
            # Restrict approve/archive action from non-staff
            if 'approve_listings' in actions:
                del actions['approve_listings']
            if 'archive_listings' in actions:
                del actions['archive_listings']
        return actions

    @admin.action(description='🚀 Approve selected listings (Push Live)')
    def approve_listings(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, "Selected assets have successfully been pushed live.")

    @admin.action(description='🛑 Move selected listings back to drafts')
    def archive_listings(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, "Selected assets successfully hidden.")

    class Media:
        js = ('https://code.jquery.com/jquery-3.6.0.min.js',)

    # ⚡ CLIENT-SIDE ROUTER: Forces strict fieldset block transitions in real time
    def render_change_form(self, request, context, add=False, change=False, form_url='', obj=None):
        response = super().render_change_form(request, context, add, change, form_url, obj)
        
        # Ensure the response is rendered before modifying content
        response.render()
        
        custom_js = """
        <script type="text/javascript">
            $(document).ready(function() {
                function toggleFieldsets() {
                    var selectedCategory = $('#id_category').val();
                    
                    // Match class configurations set in the fieldset metadata wrappers
                    var suitsBlock = $('.grp-suits-specs');
                    var vehicleBlock = $('.grp-vehicle-specs');
                    var propertyBlock = $('.grp-property-specs');
                    var landBlock = $('.grp-land-specs');
                    var artBlock = $('.grp-art-specs');
                    
                    // Enforce absolute extraction visibility reset
                    suitsBlock.hide(); vehicleBlock.hide(); propertyBlock.hide(); landBlock.hide(); artBlock.hide();
                    
                    // Render the strict targeted group field configuration criteria exclusively
                    if (selectedCategory === 'suits') {
                        suitsBlock.show();
                    } else if (selectedCategory === 'vehicle') {
                        vehicleBlock.show();
                    } else if (selectedCategory === 'property') {
                        propertyBlock.show();
                    } else if (selectedCategory === 'soaked') {
                        artBlock.show();
                    }
                }
                $('#id_category').change(toggleFieldsets);
                toggleFieldsets(); // Run immediately on view load initialization
            });
        </script>
        """
        response.content = response.content + custom_js.encode('utf-8')
        return response


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer_name', 'listing', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('reviewer_name', 'comment', 'listing__title')
