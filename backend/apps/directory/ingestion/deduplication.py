"""
Deduplication and Idempotency Engine for Review Web.
Prevents duplicate listings using source IDs, geographic proximity, and normalized name similarity.
"""
from difflib import SequenceMatcher
from apps.directory.models import Establishment, normalize_text_for_search
from .normalizer import haversine_distance_km

def calculate_name_similarity(name1, name2):
    """
    Returns float similarity between 0.0 and 1.0 using normalized search strings.
    """
    s1 = normalize_text_for_search(name1)
    s2 = normalize_text_for_search(name2)
    if not s1 or not s2:
        return 0.0
    if s1 == s2:
        return 1.0
    return SequenceMatcher(None, s1, s2).ratio()

def find_existing_establishment(source_name, source_id, name, town, latitude=None, longitude=None):
    """
    Looks up whether an establishment already exists.
    1. First tries exact source match: (source_name, source_id).
    2. Then tries exact name in same town.
    3. Then tries proximity (< 150m) with high name similarity (> 0.75).

    Returns (Establishment or None, match_type: str or None)
    """
    # 1. Exact Source Match
    if source_name and source_id:
        match = Establishment.objects.filter(source_name=source_name, source_id=str(source_id)).first()
        if match:
            return match, 'source_id'

    norm_name = normalize_text_for_search(name)

    # 2. Exact normalized name in same town
    if town:
        exact_town_match = Establishment.objects.filter(town=town, normalized_name=norm_name).first()
        if exact_town_match:
            return exact_town_match, 'exact_name_same_town'

    # 3. Spatial proximity check if coordinates available
    if latitude is not None and longitude is not None:
        try:
            lat = float(latitude)
            lon = float(longitude)
            # Rough bounding box filter (~0.005 degrees is ~550m)
            delta = 0.005
            candidates = Establishment.objects.filter(
                latitude__gte=lat - delta,
                latitude__lte=lat + delta,
                longitude__gte=lon - delta,
                longitude__lte=lon + delta,
            )
            for cand in candidates:
                if cand.latitude and cand.longitude:
                    dist_km = haversine_distance_km(lat, lon, float(cand.latitude), float(cand.longitude))
                    if dist_km <= 0.15: # within 150 meters
                        sim = calculate_name_similarity(cand.name, name)
                        if sim >= 0.75:
                            return cand, 'spatial_proximity'
        except (ValueError, TypeError):
            pass

    return None, None
