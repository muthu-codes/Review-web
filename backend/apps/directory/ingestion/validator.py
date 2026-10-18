"""
Record Validator for Review Web Ingestion Pipeline.
Ensures data authenticity, coordinate validity within Tirunelveli boundary,
and filters out non-establishments or abandoned structures.
"""
from .boundary import is_point_in_tirunelveli

DISALLOWED_NAMES = {
    'shop', 'unnamed', 'yes', 'no', 'store', 'building', 'commercial',
    'retail', 'office', 'house', 'temple', 'school', 'hospital', 'bank',
    'restaurant', 'hotel', 'null', 'none', 'unknown', 'n/a', '.'
}

def is_operational(tags):
    """
    Checks if the place is actively operational based on OSM lifecycle tags.
    """
    if not tags:
        return True

    lifecycle_prefixes = ['disused:', 'abandoned:', 'demolished:', 'was:', 'removed:']
    for k in tags.keys():
        if any(k.startswith(p) for p in lifecycle_prefixes):
            return False

    if tags.get('disused') == 'yes' or tags.get('abandoned') == 'yes':
        return False

    if tags.get('operational_status') in ['closed', 'abandoned', 'demolished']:
        return False

    if tags.get('end_date'):
        return False

    return True

def validate_place_record(record):
    """
    Validates an extracted place record dictionary.
    Required keys in record:
    - name: str
    - category_slug: str
    - latitude: float/decimal
    - longitude: float/decimal
    - tags: dict

    Returns (is_valid: bool, reason: str)
    """
    name = (record.get('name') or '').strip()
    if not name or len(name) < 2:
        return False, "Missing or too short establishment name"

    if name.lower() in DISALLOWED_NAMES:
        return False, f"Generic placeholder name: '{name}'"

    category_slug = record.get('category_slug')
    if not category_slug:
        return False, "No recognized establishment category found"

    lat = record.get('latitude')
    lon = record.get('longitude')
    if lat is None or lon is None:
        return False, "Missing geographic coordinates"

    try:
        lat = float(lat)
        lon = float(lon)
    except (TypeError, ValueError):
        return False, f"Invalid coordinate values: ({lat}, {lon})"

    tags = record.get('tags', {})
    if not is_operational(tags):
        return False, "Place tagged as abandoned, disused, or demolished"

    # Strict Tirunelveli district boundary validation
    if not is_point_in_tirunelveli(lat, lon):
        return False, f"Coordinates ({lat:.4f}, {lon:.4f}) lie outside Tirunelveli District boundary"

    return True, "Valid"
