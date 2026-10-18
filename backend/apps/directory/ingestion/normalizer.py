"""
Data Normalizer for Review Web Tirunelveli.
Cleans names, addresses, phones, websites, and accurately resolves Town and Locality.
"""
import re
import math

TOWN_CENTROIDS = {
    'tirunelveli-city': (8.7280, 77.7080, 'Tirunelveli City'),
    'palayamkottai': (8.7190, 77.7470, 'Palayamkottai'),
    'ambasamudram': (8.7060, 77.4570, 'Ambasamudram'),
    'cheranmahadevi': (8.6850, 77.5680, 'Cheranmahadevi'),
    'nanguneri': (8.4900, 77.6530, 'Nanguneri'),
    'radhapuram': (8.2610, 77.6890, 'Radhapuram'),
    'valliyur': (8.3780, 77.6140, 'Valliyur'),
    'kalakkad': (8.5170, 77.5500, 'Kalakkad'),
    'sankarankovil': (9.1720, 77.5330, 'Sankarankovil'),
}

def haversine_distance_km(lat1, lon1, lat2, lon2):
    """
    Great-circle distance between two points in km.
    """
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def is_tamil_text(text):
    """
    Returns True if string contains Tamil Unicode block characters (U+0B80 - U+0BFF).
    """
    if not text:
        return False
    return any('\u0B80' <= char <= '\u0BFF' for char in text)

def normalize_name_and_tamil(tags):
    """
    Extracts (english_name, tamil_name) from OSM tags.
    """
    raw_name = (tags.get('name') or tags.get('brand') or tags.get('operator') or '').strip()
    name_en = tags.get('name:en', '').strip()
    name_ta = tags.get('name:ta', '').strip()

    # If raw_name is empty, check brand or operator
    if not raw_name:
        if tags.get('brand'):
            raw_name = tags['brand'].strip()
        elif tags.get('operator'):
            raw_name = tags['operator'].strip()

    # Determine primary and Tamil name
    if is_tamil_text(raw_name) and not name_ta:
        name_ta = raw_name

    primary_name = name_en if name_en else raw_name
    if not primary_name and name_ta:
        primary_name = name_ta

    # Fallback for ATMs or brand branches
    if primary_name.lower() in ['atm', 'bank', 'hospital', 'clinic', 'school', 'temple']:
        operator = tags.get('operator') or tags.get('brand')
        if operator:
            primary_name = f"{operator} ({primary_name.upper()})"

    return primary_name.strip(), name_ta.strip()

def normalize_address(tags, town_name, locality_name=""):
    """
    Constructs clean address_line1, address_line2, and postal_code.
    """
    house_num = tags.get('addr:housenumber', '').strip()
    street = tags.get('addr:street', '').strip()
    suburb = tags.get('addr:suburb', '').strip() or tags.get('addr:neighbourhood', '').strip()
    postcode = tags.get('addr:postcode', '').strip()

    # Clean postcode: must be 6 digits for Indian PIN codes
    if postcode and not re.match(r'^\d{6}$', postcode):
        postcode = ""

    # Build address line 1
    addr_parts = []
    if house_num:
        addr_parts.append(house_num)
    if street:
        addr_parts.append(street)

    if addr_parts:
        line1 = ", ".join(addr_parts)
    elif suburb:
        line1 = suburb
    elif locality_name:
        line1 = locality_name
    else:
        line1 = f"Main Road, {town_name}"

    line2 = ""
    if suburb and suburb not in line1:
        line2 = suburb

    return line1, line2, postcode

def normalize_phone(phone_str):
    """
    Cleans phone numbers into a standard format.
    """
    if not phone_str:
        return ""
    # Remove unwanted noise
    cleaned = re.sub(r'[^\d+,\s/]', '', phone_str).strip()
    # If multiple numbers separated by slash or comma, take the first standard one
    first_part = re.split(r'[,/]', cleaned)[0].strip()
    return first_part[:50]

def normalize_website(web_str):
    """
    Ensures website starts with http/https.
    """
    if not web_str:
        return ""
    web = web_str.strip()
    if not web.startswith('http://') and not web.startswith('https://'):
        web = f"https://{web}"
    return web[:200]

def find_nearest_town_slug(latitude, longitude, tags=None):
    """
    Finds the best matching Town slug for given coordinates or tags.
    """
    if tags:
        city_hint = (tags.get('addr:city', '') + ' ' + tags.get('addr:town', '') + ' ' + tags.get('addr:suburb', '')).lower()
        if 'palayamkottai' in city_hint or 'palay' in city_hint:
            return 'palayamkottai'
        if 'ambasamudram' in city_hint or 'ambai' in city_hint:
            return 'ambasamudram'
        if 'cheranmahadevi' in city_hint or 'cheran' in city_hint:
            return 'cheranmahadevi'
        if 'nanguneri' in city_hint:
            return 'nanguneri'
        if 'radhapuram' in city_hint:
            return 'radhapuram'
        if 'valliyur' in city_hint or 'vallioor' in city_hint:
            return 'valliyur'
        if 'kalakkad' in city_hint or 'kalakad' in city_hint:
            return 'kalakkad'
        if 'sankarankovil' in city_hint:
            return 'sankarankovil'
        if 'tirunelveli' in city_hint or 'nellai' in city_hint:
            return 'tirunelveli-city'

    # Fallback to shortest distance to known town centroids
    if latitude is not None and longitude is not None:
        try:
            lat = float(latitude)
            lon = float(longitude)
            best_slug = 'tirunelveli-city'
            min_dist = float('inf')
            for slug, (tlat, tlon, _) in TOWN_CENTROIDS.items():
                d = haversine_distance_km(lat, lon, tlat, tlon)
                if d < min_dist:
                    min_dist = d
                    best_slug = slug
            return best_slug
        except (ValueError, TypeError):
            pass

    return 'tirunelveli-city'
