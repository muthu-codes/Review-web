"""
Review Web Directory Ingestion Package
"""
from .boundary import is_point_in_tirunelveli, get_tirunelveli_bbox
from .category_mapper import map_osm_tags_to_category_slug
from .normalizer import normalize_name_and_tamil, normalize_address, find_nearest_town_slug
from .deduplication import find_existing_establishment
from .validator import validate_place_record
from .fetcher import fetch_from_file, get_default_seed_file_path
from .importer import execute_place_import
from .reporter import generate_cli_report

__all__ = [
    'is_point_in_tirunelveli',
    'get_tirunelveli_bbox',
    'map_osm_tags_to_category_slug',
    'normalize_name_and_tamil',
    'normalize_address',
    'find_nearest_town_slug',
    'find_existing_establishment',
    'validate_place_record',
    'fetch_from_file',
    'get_default_seed_file_path',
    'execute_place_import',
    'generate_cli_report',
]
