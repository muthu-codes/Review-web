# REST API Reference — Review Web

Base URL: `/api/v1`  
OpenAPI Documentation: `/api/docs/` (Swagger UI)  
Schema: `/api/schema/`

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/google/`
Authenticates a user via Google ID Token or sandbox credential.
- **Request Body:**
  ```json
  {
    "credential": "<Google ID Token>",
    "email": "user@example.com", // (Optional in test mode)
    "name": "Citizen Reviewer"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "<Signed JWT Token>",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "Citizen Reviewer",
      "profile_picture_url": "https://...",
      "is_staff": false,
      "is_moderator": false,
      "date_joined": "2026-10-18T...",
      "reviews_count": 0,
      "reviews_edited_count": 0
    }
  }
  ```

### `GET /api/v1/auth/me/`
Returns the currently authenticated user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User profile object.

### `PATCH /api/v1/auth/me/`
Updates user profile settings (e.g. `display_name`).

### `DELETE /api/v1/auth/me/`
Deactivates user account and anonymizes reviews in accordance with retention policy.

---

## 2. Directory Endpoints

### `GET /api/v1/categories/`
Lists all categories with active place counts.

### `GET /api/v1/towns/`
Lists all municipal and revenue towns across Tirunelveli District.

### `GET /api/v1/localities/?town=<slug>`
Lists localities within a specific town.

### `GET /api/v1/establishments/`
Search and list directory establishments.
- **Query Parameters:**
  - `search`: Name in English or Tamil, street, or locality.
  - `category`: Category slug (e.g. `hospitals`, `schools`, `temples`).
  - `town`: Town slug (e.g. `tirunelveli-city`, `palayamkottai`).
  - `locality`: Locality UUID.
  - `verification_status`: `official_verified`, `checked`, `listed`.
  - `sort`: `alpha_asc` (A-Z), `alpha_desc` (Z-A), `rating_desc`, `rating_asc`, `reviews_desc`, `newest`.
  - `page`: Page number (default: 1).
  - `page_size`: Results per page (default: 12).

### `GET /api/v1/establishments/{id}/`
Returns full establishment details, map link, contact info, and rating distribution.

### `POST /api/v1/establishment-suggestions/`
Submits a public suggestion for a missing place.

---

## 3. Reviews & Ratings Endpoints

### `GET /api/v1/establishments/{id}/reviews/`
Lists published reviews for an establishment.
- **Query Parameters:** `sort=newest|rating_desc|rating_asc`, `page=1`.

### `POST /api/v1/establishments/{id}/reviews/`
Submits a 1-5 star review.
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "rating": 5,
    "title": "Excellent Service",
    "comment": "Fast and helpful staff with clean facilities.",
    "visit_date": "2026-10-15",
    "review_category": "Customer Service"
  }
  ```
- **Rules:** Enforces one active review per user per establishment. Rating must be 1 to 5. Comment must be at least 10 characters.

### `PATCH /api/v1/reviews/{id}/`
Updates user's own review. Marks `is_edited=true`.

### `DELETE /api/v1/reviews/{id}/`
Deletes user's own review. Recalculates establishment aggregate score.

### `POST /api/v1/reviews/{id}/report/`
Reports an abusive, fraudulent, or guideline-violating review.
- **Body:**
  ```json
  {
    "reason": "offensive_language",
    "details": "Explanation of violation..."
  }
  ```

---

## 4. Verified Complaint Channels Endpoints

### `GET /api/v1/establishments/{id}/complaint-channels/`
Public endpoint returning strictly verified, currently available official grievance channels.
- **Note:** Unverified channels and internal administrative notes are never exposed.

---

## 5. Administrative Endpoints

### `GET /api/v1/admin/dashboard/overview/`
Returns summary metrics and recent audit log entries. Requires staff authorization.

### `GET /api/v1/admin/moderation/reports/`
Returns queue of pending review reports for moderation.

### `POST /api/v1/admin/moderation/reports/{id}/decision/`
Action report: `decision: "uphold_and_hide"` or `"dismiss"`.

### `POST /api/v1/admin/establishments/csv-import/`
Uploads a CSV file of establishment records with validation and duplicate detection reports.

### `POST /api/v1/admin/check-duplicates/`
Checks for potential duplicates against existing listings.
