"""
Category Mapper for OpenStreetMap tags to Review Web Tirunelveli categories.
Maps OSM amenity, shop, tourism, leisure, healthcare, office, historic, and craft tags
to the 13 official Review Web categories.
"""

# Map (key, value) pairs directly to Category slugs
TAG_TO_CATEGORY_SLUG = {
    # 1. Hotels & Restaurants
    ('amenity', 'restaurant'): 'hotels-restaurants',
    ('amenity', 'cafe'): 'hotels-restaurants',
    ('amenity', 'fast_food'): 'hotels-restaurants',
    ('amenity', 'food_court'): 'hotels-restaurants',
    ('amenity', 'ice_cream'): 'hotels-restaurants',
    ('amenity', 'bar'): 'hotels-restaurants',
    ('amenity', 'pub'): 'hotels-restaurants',
    ('tourism', 'hotel'): 'hotels-restaurants',
    ('tourism', 'motel'): 'hotels-restaurants',
    ('tourism', 'guest_house'): 'hotels-restaurants',
    ('tourism', 'hostel'): 'hotels-restaurants',
    ('tourism', 'resort'): 'hotels-restaurants',
    ('shop', 'bakery'): 'hotels-restaurants',
    ('shop', 'confectionery'): 'hotels-restaurants',
    ('shop', 'pastry'): 'hotels-restaurants',
    ('shop', 'coffee'): 'hotels-restaurants',
    ('shop', 'tea'): 'hotels-restaurants',

    # 2. Schools
    ('amenity', 'school'): 'schools',
    ('amenity', 'kindergarten'): 'schools',
    ('amenity', 'prep_school'): 'schools',
    ('amenity', 'music_school'): 'schools',
    ('amenity', 'language_school'): 'schools',

    # 3. Colleges & Universities
    ('amenity', 'college'): 'colleges',
    ('amenity', 'university'): 'colleges',
    ('amenity', 'research_institute'): 'colleges',

    # 4. Hospitals & Clinics
    ('amenity', 'hospital'): 'hospitals',
    ('amenity', 'clinic'): 'hospitals',
    ('amenity', 'doctors'): 'hospitals',
    ('amenity', 'dentist'): 'hospitals',
    ('amenity', 'pharmacy'): 'hospitals',
    ('amenity', 'veterinary'): 'hospitals',
    ('healthcare', 'hospital'): 'hospitals',
    ('healthcare', 'clinic'): 'hospitals',
    ('healthcare', 'centre'): 'hospitals',
    ('healthcare', 'laboratory'): 'hospitals',
    ('healthcare', 'pharmacy'): 'hospitals',
    ('healthcare', 'dentist'): 'hospitals',
    ('healthcare', 'physiotherapist'): 'hospitals',
    ('shop', 'chemist'): 'hospitals',
    ('shop', 'medical_supply'): 'hospitals',

    # 5. Banks & Financial Services
    ('amenity', 'bank'): 'banks',
    ('amenity', 'atm'): 'banks',
    ('amenity', 'bureau_de_change'): 'banks',
    ('amenity', 'money_transfer'): 'banks',
    ('office', 'financial'): 'banks',
    ('office', 'insurance'): 'banks',

    # 6. Temples & Heritage Places
    ('amenity', 'place_of_worship'): 'temples',
    ('historic', 'monument'): 'temples',
    ('historic', 'memorial'): 'temples',
    ('historic', 'temple'): 'temples',
    ('historic', 'wayside_shrine'): 'temples',
    ('historic', 'archaeological_site'): 'temples',
    ('historic', 'fort'): 'temples',
    ('historic', 'castle'): 'temples',
    ('tourism', 'museum'): 'temples',
    ('tourism', 'attraction'): 'temples',

    # 7. Government Offices & Public Services
    ('amenity', 'police'): 'government-offices',
    ('amenity', 'fire_station'): 'government-offices',
    ('amenity', 'post_office'): 'government-offices',
    ('amenity', 'courthouse'): 'government-offices',
    ('amenity', 'townhall'): 'government-offices',
    ('amenity', 'register_office'): 'government-offices',
    ('office', 'government'): 'government-offices',
    ('office', 'administrative'): 'government-offices',
    ('office', 'ngo'): 'government-offices',

    # 8. Supermarkets
    ('shop', 'supermarket'): 'supermarkets',
    ('shop', 'convenience'): 'supermarkets',
    ('shop', 'department_store'): 'supermarkets',
    ('shop', 'general'): 'supermarkets',
    ('shop', 'wholesale'): 'supermarkets',

    # 9. Shopping Complexes & Malls
    ('shop', 'mall'): 'shopping-complexes',
    ('building', 'commercial'): 'shopping-complexes',
    ('building', 'retail'): 'shopping-complexes',

    # 10. Markets & Marketplaces
    ('amenity', 'marketplace'): 'markets',
    ('shop', 'greengrocer'): 'markets',
    ('shop', 'fruits'): 'markets',
    ('shop', 'vegetables'): 'markets',
    ('shop', 'fish'): 'markets',
    ('shop', 'seafood'): 'markets',
    ('shop', 'butcher'): 'markets',
    ('shop', 'meat'): 'markets',

    # 11. Public Places & Parks
    ('leisure', 'park'): 'public-places',
    ('leisure', 'garden'): 'public-places',
    ('leisure', 'playground'): 'public-places',
    ('leisure', 'pitch'): 'public-places',
    ('leisure', 'sports_centre'): 'public-places',
    ('leisure', 'stadium'): 'public-places',
    ('leisure', 'swimming_pool'): 'public-places',
    ('amenity', 'library'): 'public-places',
    ('amenity', 'community_centre'): 'public-places',
    ('tourism', 'viewpoint'): 'public-places',
    ('tourism', 'zoo'): 'public-places',

    # 12. Service Centres
    ('amenity', 'fuel'): 'service-centres',
    ('amenity', 'car_wash'): 'service-centres',
    ('amenity', 'vehicle_inspection'): 'service-centres',
    ('shop', 'car_repair'): 'service-centres',
    ('shop', 'motorcycle_repair'): 'service-centres',
    ('shop', 'tyres'): 'service-centres',
    ('craft', 'electrician'): 'service-centres',
    ('craft', 'electronics_repair'): 'service-centres',
    ('craft', 'plumber'): 'service-centres',
    ('craft', 'tailor'): 'service-centres',
    ('craft', 'carpenter'): 'service-centres',
    ('craft', 'shoemaker'): 'service-centres',
    ('craft', 'photographer'): 'service-centres',

    # 13. Shops & Retail Stores (General fallback for various retail shops)
    ('shop', 'clothes'): 'shops',
    ('shop', 'fabric'): 'shops',
    ('shop', 'shoes'): 'shops',
    ('shop', 'jewelry'): 'shops',
    ('shop', 'electronics'): 'shops',
    ('shop', 'mobile_phone'): 'shops',
    ('shop', 'computer'): 'shops',
    ('shop', 'hardware'): 'shops',
    ('shop', 'stationery'): 'shops',
    ('shop', 'books'): 'shops',
    ('shop', 'optician'): 'shops',
    ('shop', 'beauty'): 'shops',
    ('shop', 'hairdresser'): 'shops',
    ('shop', 'florist'): 'shops',
    ('shop', 'gift'): 'shops',
    ('shop', 'variety_store'): 'shops',
    ('shop', 'kiosk'): 'shops',
    ('shop', 'furniture'): 'shops',
    ('shop', 'paint'): 'shops',
    ('shop', 'beverages'): 'shops',
    ('shop', 'spices'): 'shops',
    ('shop', 'bicycle'): 'shops',
    ('shop', 'motorcycle'): 'shops',
    ('shop', 'car'): 'shops',
}

def map_osm_tags_to_category_slug(tags):
    """
    Given a dictionary of OSM tags, returns the matching Review Web category slug,
    or None if no match is found or if the feature is not an establishment.
    """
    if not tags or not isinstance(tags, dict):
        return None

    # 1. Exact priority key-value lookups
    priority_keys = ['amenity', 'shop', 'tourism', 'healthcare', 'office', 'historic', 'leisure', 'craft', 'building']
    for key in priority_keys:
        val = tags.get(key)
        if val:
            slug = TAG_TO_CATEGORY_SLUG.get((key, val.lower()))
            if slug:
                return slug

    # 2. Key-based fallbacks
    if 'shop' in tags:
        return 'shops'

    if 'healthcare' in tags:
        return 'hospitals'

    if tags.get('religion') or tags.get('place_of_worship'):
        return 'temples'

    if 'office' in tags:
        return 'government-offices'

    return None


def get_subcategory_name(tags):
    """
    Returns an appropriate subcategory name based on specific tags (e.g., 'Hindu Temple', 'Pharmacy').
    """
    if not tags:
        return ""

    if tags.get('amenity') == 'place_of_worship':
        religion = tags.get('religion', '').capitalize()
        denomination = tags.get('denomination', '').capitalize()
        if religion == 'Hindu':
            return 'Hindu Temple'
        elif religion == 'Christian':
            return f"Church ({denomination})" if denomination else 'Church'
        elif religion == 'Muslim':
            return 'Mosque'
        return f"{religion} Place of Worship" if religion else 'Place of Worship'

    for k in ['amenity', 'shop', 'healthcare', 'office', 'historic', 'leisure', 'craft']:
        v = tags.get(k)
        if v:
            return v.replace('_', ' ').title()

    return ""
