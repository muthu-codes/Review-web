"""
Data Fetcher for OpenStreetMap and Seed Datasets.
Supports offline seed JSON files, external input files, and live OSM Overpass/0.6 API queries.
"""
import os
import json
import time
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path
from .category_mapper import map_osm_tags_to_category_slug, get_subcategory_name
from .normalizer import (
    normalize_name_and_tamil,
    normalize_address,
    normalize_phone,
    normalize_website,
    find_nearest_town_slug
)

USER_AGENT = "ReviewWeb-Tirunelveli/1.0 (+https://github.com/review-web/tirunelveli; mailto:contact@reviewweb.tn)"

def parse_osm_element_to_record(element, node_coords_map=None):
    """
    Parses a single raw OSM element (node, way, or relation) into a standardized place record dict.
    Returns None if element has no relevant establishment tags or coordinates.
    """
    tags = element.get('tags')
    if not tags or not isinstance(tags, dict):
        return None

    cat_slug = map_osm_tags_to_category_slug(tags)
    if not cat_slug:
        return None

    elem_type = element.get('type', 'node')
    elem_id = element.get('id')
    source_id = f"{elem_type}/{elem_id}"

    # Extract coordinates
    lat = element.get('lat')
    lon = element.get('lon')

    if (lat is None or lon is None) and 'center' in element:
        lat = element['center'].get('lat')
        lon = element['center'].get('lon')

    if (lat is None or lon is None) and elem_type == 'way' and node_coords_map:
        # Calculate centroid from way nodes
        nodes = element.get('nodes', [])
        valid_coords = [node_coords_map[nid] for nid in nodes if nid in node_coords_map]
        if valid_coords:
            lat = sum(c[0] for c in valid_coords) / len(valid_coords)
            lon = sum(c[1] for c in valid_coords) / len(valid_coords)

    if lat is None or lon is None:
        return None

    name, tamil_name = normalize_name_and_tamil(tags)
    if not name:
        return None

    town_slug = find_nearest_town_slug(lat, lon, tags)
    locality_hint = tags.get('addr:suburb', '') or tags.get('addr:neighbourhood', '')
    addr_line1, addr_line2, postcode = normalize_address(tags, town_slug.replace('-', ' ').title(), locality_hint)
    phone = normalize_phone(tags.get('phone') or tags.get('contact:phone') or '')
    website = normalize_website(tags.get('website') or tags.get('contact:website') or '')
    email = (tags.get('email') or tags.get('contact:email') or '').strip()[:100]

    hours = {}
    if tags.get('opening_hours'):
        hours = {'raw': tags['opening_hours']}

    return {
        'source_name': 'osm',
        'source_id': source_id,
        'source_url': f"https://www.openstreetmap.org/{source_id}",
        'source_attribution': '© OpenStreetMap contributors, ODbL',
        'name': name,
        'tamil_name': tamil_name,
        'category_slug': cat_slug,
        'subcategory_name': get_subcategory_name(tags),
        'town_slug': town_slug,
        'locality_name': locality_hint,
        'latitude': round(float(lat), 6),
        'longitude': round(float(lon), 6),
        'address_line1': addr_line1,
        'address_line2': addr_line2,
        'postal_code': postcode,
        'phone': phone,
        'email': email,
        'website': website,
        'business_hours': hours,
        'tags': tags,
    }

def fetch_from_file(file_path):
    """
    Loads raw OSM GeoJSON or JSON records from a local file.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Data file does not exist: {file_path}")

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    records = []

    # Format A: Already normalized place records list
    if isinstance(data, list) and data and 'category_slug' in data[0]:
        return data

    # Format B: OSM JSON output (elements: [node, way, ...])
    if isinstance(data, dict) and 'elements' in data:
        elements = data['elements']
        # Build node coordinate lookup for way geometries
        node_coords = {}
        for el in elements:
            if el.get('type') == 'node' and 'lat' in el and 'lon' in el:
                node_coords[el['id']] = (el['lat'], el['lon'])

        for el in elements:
            rec = parse_osm_element_to_record(el, node_coords)
            if rec:
                records.append(rec)
        return records

    # Format C: GeoJSON FeatureCollection
    if isinstance(data, dict) and data.get('type') == 'FeatureCollection':
        for feat in data.get('features', []):
            geom = feat.get('geometry', {})
            props = feat.get('properties', {})
            coords = geom.get('coordinates', [])
            if geom.get('type') == 'Point' and len(coords) >= 2:
                lon, lat = coords[0], coords[1]
                element = {
                    'type': 'node',
                    'id': props.get('@id') or props.get('id') or hash(props.get('name', '')),
                    'lat': lat,
                    'lon': lon,
                    'tags': props
                }
                rec = parse_osm_element_to_record(element)
                if rec:
                    records.append(rec)
        return records

    return records


def get_default_seed_file_path():
    """
    Returns the absolute path to the bundled seed dataset.
    """
    base_dir = Path(__file__).resolve().parent.parent
    return str(base_dir / 'data' / 'tirunelveli_osm_places.json')
