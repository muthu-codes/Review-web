# Data Import & Verification Pipeline — Review Web

## 1. Principles of Lawful Data Ingestion
1. **Zero Scraping of Prohibited Sources:** Review Web does not scrape private platforms or copy data against terms of service.
2. **Permitted Public Datasets:** Ingestion is conducted via administrator-approved CSV uploads, official public gazettes, Open Data portals, or approved community place submissions.
3. **No Automatic Verification:** Crucially, imported records **never automatically become verified**. All imported listings are initiated in state:
   - `status`: `pending_verification`
   - `verification_status`: `listed`
4. **Three Distinct Trust Tiers:**
   - **Tier 1: Listed on Review Web:** Listing exists in the public directory based on public notice or suggestion.
   - **Tier 2: Information Checked by Review Web:** Contact, address, and category verified by our team.
   - **Tier 3: Official Registration Independently Verified:** Government/regulatory license, corporate registration, or official gazette verified.

---

## 2. Documented CSV Import Format
The pipeline accepts standard UTF-8 CSV files formatted as follows:

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

---

## 3. Duplicate Detection Logic
During CSV ingestion or single additions, `apps.directory.services.detect_potential_duplicates` evaluates:
1. Exact lowercase alphanumeric match within the same town.
2. SequenceMatcher similarity ratio (>80% = HIGH confidence duplicate warning).
3. Significant multi-word token overlap (>60% = MEDIUM confidence duplicate warning).

When duplicates are detected:
- The system flags them in the import report for administrator review.
- Listings with high duplication are quarantined for manual resolution.
