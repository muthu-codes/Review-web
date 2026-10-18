# Data Import & Verification Pipeline — Review Web Tirunelveli

## 1. Principles of Lawful Data Ingestion
1. **Zero Scraping of Prohibited Sources:** Review Web does not scrape private platforms (such as Google Maps or proprietary listings) or copy data against terms of service.
2. **Permitted Public Datasets & OpenStreetMap:** Real-place ingestion is conducted via:
   - **OpenStreetMap (OSM)** under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).
   - Administrator-approved CSV uploads.
   - Official public gazettes and government Open Data portals.
   - Citizen place suggestions verified by moderators.
3. **No Automatic Verification:** Imported records **never automatically become verified**. All imported listings are initiated in state:
   - `status`: `pending_verification`
   - `verification_status`: `listed`
4. **Three Distinct Trust Tiers:**
   - **Tier 1: Listed on Review Web:** Listing exists in the public directory based on public notice, OpenStreetMap import, or citizen suggestion.
   - **Tier 2: Information Checked by Review Web:** Contact, address, and category verified by our team.
   - **Tier 3: Official Registration Independently Verified:** Government/regulatory license, corporate registration, or official gazette verified.
5. **Preservation of User-Generated Data:** Ingestion updates never overwrite existing user ratings, review counts, reviews, rating distributions, or filed complaints.

---

## 2. Tirunelveli District Boundary Filtering
The ingestion engine applies an exact ray-casting point-in-polygon algorithm against the official OpenStreetMap boundary geometry for **Tirunelveli District** (OSM Relation ID `1818783`, `admin_level: 5`).

- Boundary file: `backend/apps/directory/data/tirunelveli_boundary.geojson`
- Bounding Box: Latitude `[8.14215, 8.95731]`, Longitude `[77.16970, 77.97842]`
- Ray-casting validator: `apps.directory.ingestion.boundary.is_point_in_tirunelveli(lat, lon)`
- Places located outside the Tirunelveli district boundary (e.g., Thoothukudi, Madurai, Kanyakumari, Tenkasi) are automatically rejected during validation.

---

## 3. Automated Ingestion Pipeline Architecture

```
OpenStreetMap / Seed Data (JSON / GeoJSON / API)
                       │
                       ▼
       ┌───────────────────────────────┐
       │     fetcher.py                │ Parses elements & extracts attributes
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │     category_mapper.py        │ Maps OSM tags to 13 Review Web categories
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │     normalizer.py             │ Normalizes names (EN + TA), phone, town
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │     validator.py              │ Strict boundary & operational check
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │     deduplication.py          │ Idempotency via (source_name, source_id)
       └───────────────┬───────────────┘ & proximity/name similarity
                       │
                       ▼
       ┌───────────────────────────────┐
       │     importer.py               │ Atomic database transaction upsert
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │     reporter.py               │ Formatted CLI and JSON report
       └───────────────────────────────┘
```

---

## 4. Running the Ingestion Management Command

The management command `import_tirunelveli_places` is used to run the ingestion pipeline from the command line:

```powershell
# Navigate to backend directory
cd backend

# Run dry run (test simulation without database changes)
venv\Scripts\python.exe manage.py import_tirunelveli_places --dry-run

# Run live import using the bundled seed dataset
venv\Scripts\python.exe manage.py import_tirunelveli_places

# Import from a specific external GeoJSON/OSM file
venv\Scripts\python.exe manage.py import_tirunelveli_places --input-file "path/to/places.geojson"

# Run with a record limit
venv\Scripts\python.exe manage.py import_tirunelveli_places --limit 50

# Skip updating existing records
venv\Scripts\python.exe manage.py import_tirunelveli_places --no-update
```

### Command Options:
| Flag | Type | Description |
| :--- | :--- | :--- |
| `--input-file` | `str` | Path to JSON, GeoJSON, or OSM file. Defaults to `apps/directory/data/tirunelveli_osm_places.json`. |
| `--source` | `str` | Source identifier (default: `osm`). |
| `--dry-run` | `flag` | Simulates validation and deduplication without writing to DB. |
| `--no-update` | `flag` | Does not update existing records when duplicates/matches are found. |
| `--limit` | `int` | Limits the number of records examined. |

---

## 5. Administrative Ingestion API Endpoints

Administrators can monitor and trigger imports directly via the REST API or the **Admin Portal** (`/admin-portal`):

- `GET /api/v1/admin/import-runs/`: Retrieves all past ingestion batch records (`DataImportRun`), including features examined, inserted count, updated count, rejected count, duration, and full summary.
- `POST /api/v1/admin/trigger-import/`: Triggers an import batch execution with options `{ dry_run: boolean, source: string, limit: number }`.
- `POST /api/v1/check-duplicates/`: Public endpoint for checking potential duplicate establishments prior to submission (used by `SuggestPlacePage`).

---

## 6. Documented CSV Import Format

The pipeline also accepts manual administrator-uploaded CSV files:

```csv
name,tamil_name,category_slug,town_name,locality_name,address_line1,address_line2,postal_code,phone,email,website
District Collectorate Tirunelveli,மாவட்ட ஆட்சியர் அலுவலகம் திருநெல்வேலி,government-offices,Tirunelveli City,Kokkirakulam,Kokkirakulam Road,Collectorate Complex,627009,04622500828,collr-tnv@nic.in,https://tirunelveli.nic.in
```

### Column Specifications
| Field | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `name` | **Yes** | Official or commonly used establishment name in English | Nellai Saravana Mess |
| `tamil_name` | No | Verified Tamil name | நெல்லை சரவணா மெஸ் |
| `category_slug` | **Yes** | Valid slug from directory categories | `hotels-restaurants` |
| `town_name` | **Yes** | Town name in Tirunelveli district | `Tirunelveli City` |
| `locality_name` | No | Locality or neighbourhood | `Town` |
| `address_line1` | **Yes** | Door number and street | Swamy Sannathi Street |
| `address_line2` | No | Landmark or building details | Near Car Street |
| `postal_code` | No | 6-digit Indian PIN code | 627006 |
| `phone` | No | Lawfully available public contact | 0462-233xxxx |
| `email` | No | Public institutional email | contact@domain.in |
| `website` | No | Verified official web address | https://domain.in |
