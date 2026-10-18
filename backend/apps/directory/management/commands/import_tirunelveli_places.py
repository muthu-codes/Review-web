"""
Management command to import real establishments into Tirunelveli district directory.
"""
from django.core.management.base import BaseCommand
from apps.directory.ingestion import (
    fetch_from_file,
    get_default_seed_file_path,
    execute_place_import,
    generate_cli_report,
)

class Command(BaseCommand):
    help = 'Imports authentic establishments across Tirunelveli District from OpenStreetMap and verified datasets'

    def add_arguments(self, parser):
        parser.add_argument(
            '--input-file',
            type=str,
            default=None,
            help='Path to OSM JSON, GeoJSON, or pre-extracted places file. Defaults to bundled seed data.'
        )
        parser.add_argument(
            '--source',
            type=str,
            default='osm',
            help='Source identifier (e.g. osm, official_dataset).'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate ingestion without writing any changes to the database.'
        )
        parser.add_argument(
            '--no-update',
            action='store_true',
            help='Do not update existing records when duplicates or matches are found.'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit the number of records to import.'
        )

    def handle(self, *args, **options):
        input_file = options.get('input_file') or get_default_seed_file_path()
        source_name = options.get('source')
        dry_run = options.get('dry_run')
        update_existing = not options.get('no_update')
        limit = options.get('limit')

        self.stdout.write(self.style.NOTICE(f"Loading data from: {input_file}"))
        try:
            records = fetch_from_file(input_file)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Failed to load input file: {e}"))
            return

        self.stdout.write(f"Loaded {len(records)} records from source. Executing pipeline...")

        import_run, summary = execute_place_import(
            records=records,
            source_name=source_name,
            dry_run=dry_run,
            update_existing=update_existing,
            limit=limit
        )

        report_text = generate_cli_report(summary)
        self.stdout.write(report_text)

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry run finished. No records were committed to database."))
        else:
            self.stdout.write(self.style.SUCCESS(
                f"Import complete! {summary['records_inserted']} new places inserted, {summary['records_updated']} places updated."
            ))
