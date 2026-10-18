"""
Core Ingestion Engine for Review Web Tirunelveli.
Executes batch imports with atomic safety, idempotent upserting,
and strict preservation of user-generated reviews, ratings, and complaints.
"""
import time
from django.db import transaction
from django.utils import timezone
from apps.directory.models import (
    District, Town, Locality, Category, SubCategory,
    Establishment, DataImportRun
)
from .validator import validate_place_record
from .deduplication import find_existing_establishment

def execute_place_import(records, source_name='osm', dry_run=False, update_existing=True, limit=None, user=None):
    """
    Executes place ingestion from normalized record dictionaries.
    """
    start_time = time.time()
    now = timezone.now()

    import_run = DataImportRun.objects.create(
        source_name=source_name,
        is_dry_run=dry_run,
        status='running',
        initiated_by=user if user and user.is_authenticated else None
    )

    district = District.objects.filter(slug='tirunelveli').first()
    if not district:
        district, _ = District.objects.get_or_create(
            name='Tirunelveli',
            defaults={'tamil_name': 'திருநெல்வேலி', 'slug': 'tirunelveli'}
        )

    # Pre-cache Categories and Towns
    categories = {c.slug: c for c in Category.objects.all()}
    towns = {t.slug: t for t in Town.objects.filter(district=district)}

    default_town = towns.get('tirunelveli-city') or list(towns.values())[0]

    features_examined = 0
    records_inserted = 0
    records_updated = 0
    records_skipped = 0
    records_rejected = 0
    rejection_reasons = {}
    category_counts = {}
    town_counts = {}
    error_log = []

    if limit and limit > 0:
        records = records[:limit]

    with transaction.atomic():
        for rec in records:
            features_examined += 1

            # 1. Validate
            is_valid, reason = validate_place_record(rec)
            if not is_valid:
                records_rejected += 1
                rejection_reasons[reason] = rejection_reasons.get(reason, 0) + 1
                continue

            # Resolve Category
            cat_slug = rec.get('category_slug')
            category = categories.get(cat_slug)
            if not category:
                records_rejected += 1
                r_key = f"Category '{cat_slug}' not found in database taxonomy"
                rejection_reasons[r_key] = rejection_reasons.get(r_key, 0) + 1
                continue

            # Resolve Town
            town_slug = rec.get('town_slug')
            town = towns.get(town_slug, default_town)

            # 2. Check for duplicate / existing establishment
            existing, match_type = find_existing_establishment(
                source_name=rec.get('source_name', source_name),
                source_id=rec.get('source_id', ''),
                name=rec.get('name', ''),
                town=town,
                latitude=rec.get('latitude'),
                longitude=rec.get('longitude')
            )

            if existing:
                if update_existing:
                    if not dry_run:
                        # Safe non-destructive update: NEVER alter rating, review count, or verification status
                        if rec.get('phone') and not existing.phone:
                            existing.phone = rec['phone']
                        if rec.get('website') and not existing.website:
                            existing.website = rec['website']
                        if rec.get('email') and not existing.email:
                            existing.email = rec['email']
                        if rec.get('business_hours'):
                            existing.business_hours = rec['business_hours']
                        if rec.get('tamil_name') and not existing.tamil_name:
                            existing.tamil_name = rec['tamil_name']
                        if rec.get('latitude') and not existing.latitude:
                            existing.latitude = rec['latitude']
                            existing.longitude = rec['longitude']
                        if rec.get('source_url'):
                            existing.source_url = rec['source_url']
                        existing.last_imported_at = now
                        existing.save()
                    records_updated += 1
                else:
                    records_skipped += 1
                continue

            # 3. New record insertion
            if not dry_run:
                # Resolve Locality if provided
                locality = None
                loc_name = rec.get('locality_name', '').strip()
                if loc_name:
                    locality, _ = Locality.objects.get_or_create(
                        town=town,
                        name=loc_name,
                        defaults={'postal_code': rec.get('postal_code', '')}
                    )

                # Resolve Subcategory if provided
                subcategory = None
                subcat_name = rec.get('subcategory_name', '').strip()
                if subcat_name:
                    sub_slug = subcat_name.lower().replace(' ', '-').replace('&', 'and')[:100]
                    subcategory, _ = SubCategory.objects.get_or_create(
                        category=category,
                        slug=sub_slug,
                        defaults={'name': subcat_name}
                    )

                Establishment.objects.create(
                    name=rec['name'],
                    tamil_name=rec.get('tamil_name', ''),
                    category=category,
                    subcategory=subcategory,
                    district=district,
                    town=town,
                    locality=locality,
                    address_line1=rec.get('address_line1', f"Main Road, {town.name}"),
                    address_line2=rec.get('address_line2', ''),
                    postal_code=rec.get('postal_code', ''),
                    latitude=rec.get('latitude'),
                    longitude=rec.get('longitude'),
                    phone=rec.get('phone', ''),
                    email=rec.get('email', ''),
                    website=rec.get('website', ''),
                    business_hours=rec.get('business_hours', {}),
                    source_type='osm_import',
                    source_name=rec.get('source_name', source_name),
                    source_id=rec.get('source_id', ''),
                    source_url=rec.get('source_url', ''),
                    source_attribution=rec.get('source_attribution', '© OpenStreetMap contributors, ODbL'),
                    first_imported_at=now,
                    last_imported_at=now,
                    operational_status='active',
                    verification_status='listed',
                    status='pending_verification',
                )

            records_inserted += 1
            cat_name = category.name
            category_counts[cat_name] = category_counts.get(cat_name, 0) + 1
            t_name = town.name
            town_counts[t_name] = town_counts.get(t_name, 0) + 1

        if dry_run:
            # Rollback database changes in dry run
            transaction.set_rollback(True)

    elapsed_seconds = round(time.time() - start_time, 2)

    summary = {
        'source_name': source_name,
        'dry_run': dry_run,
        'features_examined': features_examined,
        'records_inserted': records_inserted,
        'records_updated': records_updated,
        'records_skipped': records_skipped,
        'records_rejected': records_rejected,
        'rejection_reasons': rejection_reasons,
        'category_counts': category_counts,
        'town_counts': town_counts,
        'duration_seconds': elapsed_seconds,
    }

    # Record run result in non-rolled-back transaction
    import_run.completed_at = timezone.now()
    import_run.status = 'success'
    import_run.features_examined = features_examined
    import_run.records_inserted = records_inserted
    import_run.records_updated = records_updated
    import_run.records_skipped = records_skipped
    import_run.records_rejected = records_rejected
    import_run.duration_seconds = elapsed_seconds
    import_run.report_summary = summary
    if error_log:
        import_run.errors = "\n".join(error_log)
    import_run.save()

    return import_run, summary
