# Database Schema Documentation — Review Web

## 1. Overview
The database uses UUIDs as primary keys for stability, non-enumerable endpoints, and simplified multi-database replication.

---

## 2. Entity Relational Details

### 2.1 `accounts_user`
- `id` (UUID, Primary Key)
- `email` (VARCHAR 254, Unique, Indexed)
- `username` (VARCHAR 150, Unique)
- `display_name` (VARCHAR 150)
- `profile_picture_url` (VARCHAR 1000, Nullable)
- `google_sub` (VARCHAR 255, Unique, Nullable)
- `is_staff` (BOOLEAN, Default: False)
- `is_moderator` (BOOLEAN, Default: False)
- `is_active` (BOOLEAN, Default: True)
- `date_joined` (DATETIME)
- `updated_at` (DATETIME)

### 2.2 `directory_district`
- `id` (UUID, Primary Key)
- `name` (VARCHAR 100, Unique, Default: 'Tirunelveli')
- `tamil_name` (VARCHAR 100, Default: 'திருநெல்வேலி')
- `state` (VARCHAR 100, Default: 'Tamil Nadu')
- `slug` (SLUG 100, Unique, Default: 'tirunelveli')

### 2.3 `directory_town`
- `id` (UUID, Primary Key)
- `district_id` (FK to `directory_district`)
- `name` (VARCHAR 100, e.g. 'Tirunelveli City', 'Palayamkottai', 'Ambasamudram')
- `tamil_name` (VARCHAR 100)
- `slug` (SLUG 100)

### 2.4 `directory_locality`
- `id` (UUID, Primary Key)
- `town_id` (FK to `directory_town`)
- `name` (VARCHAR 120, e.g. 'Town', 'Junction', 'Vannarpettai', 'High Ground')
- `tamil_name` (VARCHAR 120)
- `postal_code` (VARCHAR 10)

### 2.5 `directory_category`
- `id` (UUID, Primary Key)
- `name` (VARCHAR 100, Unique)
- `tamil_name` (VARCHAR 100)
- `slug` (SLUG 100, Unique)
- `icon` (VARCHAR 50)
- `description` (TEXT)
- `display_order` (INTEGER, Default: 0)

### 2.6 `directory_establishment`
- `id` (UUID, Primary Key)
- `name` (VARCHAR 255, Indexed)
- `tamil_name` (VARCHAR 255, Indexed)
- `normalized_name` (VARCHAR 255, Indexed)
- `category_id` (FK to `directory_category`, PROTECT)
- `subcategory_id` (FK to `directory_subcategory`, SET_NULL, Nullable)
- `district_id` (FK to `directory_district`, PROTECT)
- `town_id` (FK to `directory_town`, PROTECT)
- `locality_id` (FK to `directory_locality`, SET_NULL, Nullable)
- `address_line1` (VARCHAR 300)
- `address_line2` (VARCHAR 300)
- `postal_code` (VARCHAR 10)
- `latitude` (DECIMAL 9,6, Nullable)
- `longitude` (DECIMAL 9,6, Nullable)
- `phone` (VARCHAR 50)
- `email` (VARCHAR 254)
- `website` (VARCHAR 200)
- `business_hours` (JSON)
- `verification_status` (`listed`, `checked`, `official_verified`)
- `status` (`pending_verification`, `verified`, `needs_updating`, `rejected`, `archived`)
- `source_type` (`csv_import`, `admin_entry`, `user_suggestion`, `public_directory`)
- `source_reference` (VARCHAR 255)
- `average_rating` (FLOAT, Default: 0.0, Indexed)
- `review_count` (INTEGER, Default: 0, Indexed)
- `rating_distribution` (JSON: `{'1': count, '2': count, '3': count, '4': count, '5': count}`)
- `created_at` (DATETIME, Indexed)
- `updated_at` (DATETIME, Indexed)

### 2.7 `reviews_review`
- `id` (UUID, Primary Key)
- `establishment_id` (FK to `directory_establishment`, CASCADE)
- `user_id` (FK to `accounts_user`, CASCADE)
- `rating` (INTEGER, Validated 1 to 5)
- `title` (VARCHAR 200)
- `comment` (TEXT, Min: 10 chars, Max: 2000 chars)
- `visit_date` (DATE, Nullable)
- `review_category` (VARCHAR 100)
- `status` (`published`, `flagged`, `hidden`, `deleted`)
- `is_edited` (BOOLEAN, Default: False)
- `created_at` (DATETIME, Indexed)
- `updated_at` (DATETIME)
- **Constraint:** `unique_user_establishment_review` on `(establishment_id, user_id)`

### 2.8 `reviews_reviewreport`
- `id` (UUID, Primary Key)
- `review_id` (FK to `reviews_review`, CASCADE)
- `reported_by_id` (FK to `accounts_user`, CASCADE)
- `reason` (`offensive_language`, `defamatory`, `fake_review`, `privacy_violation`, `conflict_of_interest`, `other`)
- `details` (TEXT)
- `status` (`pending`, `reviewed`, `action_taken`, `dismissed`)
- `created_at` (DATETIME)
- `resolved_at` (DATETIME, Nullable)
- `resolved_by_id` (FK to `accounts_user`, SET_NULL, Nullable)

### 2.9 `complaints_complaintchannel`
- `id` (UUID, Primary Key)
- `establishment_id` (FK to `directory_establishment`, CASCADE)
- `channel_type` (`portal`, `form`, `email`, `helpline`, `support_page`)
- `channel_name` (VARCHAR 150)
- `receiving_organization` (VARCHAR 200)
- `official_url` (VARCHAR 200, Nullable)
- `official_contact` (VARCHAR 150)
- `verified_source_url` (VARCHAR 200)
- `verification_status` (`pending`, `verified`, `rejected`, `expired`, Indexed)
- `last_verified_at` (DATETIME, Nullable)
- `verified_by_id` (FK to `accounts_user`, SET_NULL, Nullable)
- `instructions` (TEXT)
- `is_currently_available` (BOOLEAN, Default: True, Indexed)
- `administrative_notes` (TEXT, Excluded from public endpoints)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 2.10 `moderation_auditlog`
- `id` (UUID, Primary Key)
- `user_id` (FK to `accounts_user`, SET_NULL, Nullable)
- `action` (`create`, `update`, `delete`, `verify`, `archive`, `csv_import`, `moderation_decision`)
- `entity_type` (VARCHAR 50)
- `entity_id` (VARCHAR 255)
- `details` (JSON)
- `ip_address` (GENERIC_IP, Nullable)
- `timestamp` (DATETIME, Indexed)
