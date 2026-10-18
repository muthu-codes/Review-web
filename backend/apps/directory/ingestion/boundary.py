"""
Tirunelveli District Boundary Validator.
Uses ray-casting point-in-polygon algorithm against the official Tirunelveli District OSM boundary GeoJSON.
"""
import os
import json
from pathlib import Path

_BOUNDARY_DATA = None
_BBOX = None

def _load_boundary_geometry():
    global _BOUNDARY_DATA, _BBOX
    if _BOUNDARY_DATA is not None:
        return _BOUNDARY_DATA, _BBOX

    base_dir = Path(__file__).resolve().parent.parent
    geojson_path = base_dir / 'data' / 'tirunelveli_boundary.geojson'

    if not geojson_path.exists():
        raise FileNotFoundError(f"Boundary file not found at {geojson_path}")

    with open(geojson_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    geometry = data.get('geometry', data)
    geom_type = geometry.get('type')
    coordinates = geometry.get('coordinates', [])

    # Standardize to a list of polygons: [ [outer_ring, inner_ring1, ...], ... ]
    polygons = []
    if geom_type == 'Polygon':
        polygons.append(coordinates)
    elif geom_type == 'MultiPolygon':
        polygons = coordinates
    else:
        raise ValueError(f"Unsupported geometry type: {geom_type}")

    # Calculate overall bounding box for quick-rejection
    min_lon = float('inf')
    max_lon = float('-inf')
    min_lat = float('inf')
    max_lat = float('-inf')

    for poly in polygons:
        for ring in poly:
            for pt in ring:
                lon, lat = pt[0], pt[1]
                if lon < min_lon: min_lon = lon
                if lon > max_lon: max_lon = lon
                if lat < min_lat: min_lat = lat
                if lat > max_lat: max_lat = lat

    _BOUNDARY_DATA = polygons
    _BBOX = (min_lat, max_lat, min_lon, max_lon)
    return _BOUNDARY_DATA, _BBOX


def _point_in_ring(px, py, ring):
    """
    Ray-casting algorithm to test if point (px, py) is inside a 2D polygon ring.
    px = lon, py = lat.
    """
    inside = False
    n = len(ring)
    if n < 3:
        return False

    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]

        intersect = ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi)
        if intersect:
            inside = not inside
        j = i

    return inside


def is_point_in_tirunelveli(latitude, longitude):
    """
    Determines whether the given (latitude, longitude) coordinates fall inside Tirunelveli District.
    Returns True if inside, False otherwise.
    """
    if latitude is None or longitude is None:
        return False

    try:
        lat = float(latitude)
        lon = float(longitude)
    except (TypeError, ValueError):
        return False

    polygons, (min_lat, max_lat, min_lon, max_lon) = _load_boundary_geometry()

    # 1. Quick bounding box check
    if not (min_lat <= lat <= max_lat and min_lon <= lon <= max_lon):
        return False

    # 2. Detailed ray casting check against polygons
    for poly in polygons:
        if not poly:
            continue
        outer_ring = poly[0]
        if _point_in_ring(lon, lat, outer_ring):
            # Check inner rings (holes) if any
            in_hole = False
            for hole in poly[1:]:
                if _point_in_ring(lon, lat, hole):
                    in_hole = True
                    break
            if not in_hole:
                return True

    return False


def get_tirunelveli_bbox():
    """
    Returns (min_lat, max_lat, min_lon, max_lon) of Tirunelveli District.
    """
    _, bbox = _load_boundary_geometry()
    return bbox
