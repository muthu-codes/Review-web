import csv
import io
import re
from difflib import SequenceMatcher
from .models import Establishment, Category, Town, Locality, District

def string_similarity(a, b):
    """Calculates Levenshtein-like similarity ratio between 0.0 and 1.0"""
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

def detect_potential_duplicates(name, town_id_or_obj, address=""):
    """
    Detects potential duplicate establishments within the same town or district.
    Returns list of {establishment: obj, confidence: str, reason: str}
    """
    clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', name).lower().strip()
    words = set(clean_name.split())

    # Filter by town if provided
    qs = Establishment.objects.all()
    if town_id_or_obj:
        if isinstance(town_id_or_obj, Town):
            qs = qs.filter(town=town_id_or_obj)
        else:
            try:
                import uuid
                uuid_obj = uuid.UUID(str(town_id_or_obj))
                qs = qs.filter(town_id=uuid_obj)
            except (ValueError, TypeError):
                qs = qs.filter(town__slug=str(town_id_or_obj))

    potential_matches = []
    for est in qs[:100]:
        est_clean = re.sub(r'[^a-zA-Z0-9\s]', '', est.name).lower().strip()
        sim = string_similarity(clean_name, est_clean)
        
        # Check if high similarity or word overlap
        est_words = set(est_clean.split())
        overlap = len(words.intersection(est_words))
        
        if sim >= 0.8:
            potential_matches.append({
                'establishment_id': str(est.id),
                'name': est.name,
                'town': est.town.name,
                'confidence': 'HIGH',
                'reason': f"Name is {int(sim*100)}% identical to existing listing.",
            })
        elif sim >= 0.6 or (len(words) >= 2 and overlap >= 2):
            potential_matches.append({
                'establishment_id': str(est.id),
                'name': est.name,
                'town': est.town.name,
                'confidence': 'MEDIUM',
                'reason': f"Contains overlapping words with existing listing ({est.name}).",
            })

    return potential_matches

def process_csv_import(csv_file, imported_by=None):
    """
    Validates and imports establishments from a CSV file.
    Does NOT mark imported records as verified; they default to 'pending_verification'.
    Returns a detailed summary report.
    """
    if hasattr(csv_file, 'read'):
        content = csv_file.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8-sig', errors='replace')
        stream = io.StringIO(content)
    else:
        stream = io.StringIO(csv_file)

    reader = csv.DictReader(stream)
    report = {
        'total_rows': 0,
        'successful_imports': 0,
        'duplicates_detected': [],
        'rejected_rows': [],
        'imported_records': [],
    }

    district, _ = District.objects.get_or_create(
        slug='tirunelveli',
        defaults={'name': 'Tirunelveli', 'tamil_name': 'திருநெல்வேலி', 'state': 'Tamil Nadu'}
    )

    for row_idx, row in enumerate(reader, start=2): # start at 2 accounting for header
        report['total_rows'] += 1
        name = row.get('name', '').strip()
        category_slug = row.get('category_slug', '').strip().lower()
        town_name = row.get('town_name', '').strip()
        address = row.get('address_line1', '').strip()

        # Validation
        if not name:
            report['rejected_rows'].append({'row': row_idx, 'error': "Establishment name is required."})
            continue
        if not category_slug:
            report['rejected_rows'].append({'row': row_idx, 'error': f"Category slug is required for '{name}'."})
            continue
        if not town_name:
            report['rejected_rows'].append({'row': row_idx, 'error': f"Town name is required for '{name}'."})
            continue
        if not address:
            report['rejected_rows'].append({'row': row_idx, 'error': f"Address line 1 is required for '{name}'."})
            continue

        category = Category.objects.filter(slug=category_slug).first()
        if not category:
            report['rejected_rows'].append({
                'row': row_idx,
                'error': f"Category slug '{category_slug}' does not exist in directory categories."
            })
            continue

        town = Town.objects.filter(name__iexact=town_name, district=district).first()
        if not town:
            # Auto-create or reject? Create town if under Tirunelveli
            slug = re.sub(r'[^a-z0-9]+', '-', town_name.lower()).strip('-')
            town = Town.objects.create(district=district, name=town_name, slug=slug)

        # Check duplicates
        dupes = detect_potential_duplicates(name, town, address)
        if dupes:
            report['duplicates_detected'].append({
                'row': row_idx,
                'proposed_name': name,
                'matches': dupes
            })

        # Locality handling if present
        locality_name = row.get('locality_name', '').strip()
        locality = None
        if locality_name:
            locality = Locality.objects.filter(name__iexact=locality_name, town=town).first()
            if not locality:
                locality = Locality.objects.create(town=town, name=locality_name)

        # Create unverified record
        est = Establishment.objects.create(
            name=name,
            tamil_name=row.get('tamil_name', '').strip(),
            category=category,
            district=district,
            town=town,
            locality=locality,
            address_line1=address,
            address_line2=row.get('address_line2', '').strip(),
            postal_code=row.get('postal_code', '').strip(),
            phone=row.get('phone', '').strip(),
            email=row.get('email', '').strip(),
            website=row.get('website', '').strip(),
            source_type='csv_import',
            source_reference=f"CSV row {row_idx}",
            status='pending_verification',
            verification_status='listed'
        )

        report['successful_imports'] += 1
        report['imported_records'].append({
            'id': str(est.id),
            'name': est.name,
            'town': town.name,
            'status': est.status
        })

    return report
