# Architecture Overview — Review Web (Tirunelveli District)

## 1. System Vision & Architecture Principles
Review Web is a production-minded, responsive public directory and authentic community review platform specifically designed for Tirunelveli District, Tamil Nadu, India.

### Core Architectural Tenets
1. **Separation of Concerns:** Clear demarcation between React (frontend client), Django REST API (business logic & security), and PostgreSQL (relational database).
2. **Review vs. Complaint Separation:** Strict segregation between subjective community reviews and formal legal/official grievance channels.
3. **Data Integrity & Zero Fabrication:** No fake or simulated business records or reviews in production. High-standard validation, duplicate detection, and moderation pipelines.
4. **Cloud-Native & Free-Tier Friendly:** Architected to run on Supabase (PostgreSQL), Vercel (Frontend), and Python container hosts (Render, Railway, or Fly.io) within free-tier quotas.

---

## 2. Architecture Diagram

```
+--------------------------------------------------------------------------+
|                        Client Layer (Browsers)                          |
|             Android / iOS / Tablets / Desktop Browsers                    |
+------------------------------------+-------------------------------------+
                                     |
                                     | HTTPS / WSS
                                     v
+------------------------------------+-------------------------------------+
|                      Frontend Layer (Vercel)                             |
|  - React 19 + Vite 6 + React Router v7                                    |
|  - Framer Motion UI animations                                           |
|  - Milky-White Translucent Glassmorphism Design System                   |
|  - Interactive 3D Tilt Card (Login)                                      |
|  - Reduced-Motion Accessibility & Screen Reader Support                  |
+------------------------------------+-------------------------------------+
                                     |
                                     | REST JSON APIs (Bearer JWT)
                                     v
+------------------------------------+-------------------------------------+
|                Backend API Layer (Django / Gunicorn)                     |
|  - Django 5.2 + Django REST Framework                                    |
|  - JWT Authentication & Google OAuth Token Verification                  |
|  - apps.accounts: Custom User, JWT token generator, profile deletion     |
|  - apps.directory: Categories, Towns, Localities, Establishments         |
|  - apps.reviews: 1-5 Star validation, aggregate calculations, reporting   |
|  - apps.complaints: Strictly verified official complaint channels        |
|  - apps.moderation: Audit logs, flagged review queue, duplicate detection|
|  - drf-spectacular: OpenAPI 3.0 & Swagger UI documentation               |
+------------------------------------+-------------------------------------+
                                     |
                                     | Connection Pool (SSL)
                                     v
+------------------------------------+-------------------------------------+
|                      Data Layer (PostgreSQL)                             |
|  - Supabase PostgreSQL / Cloud PostgreSQL                                |
|  - Local SQLite fallback for testing                                     |
|  - Database Indexes on (status, category), (status, town), rating        |
|  - Unique Constraints (one review per user per establishment)            |
+--------------------------------------------------------------------------+
```

---

## 3. Security Architecture
- **Google OAuth Verification:** Verified on backend using `google.auth.transport.requests` and `google.oauth2.id_token.verify_oauth2_token`.
- **JWT Authorization:** Signed with `HS256`, 30-day expiry, transmitted in `Authorization: Bearer <token>` headers.
- **Cross-Site Scripting (XSS) Prevention:** Output escaping via Django ORM and React JSX virtual DOM sanitization.
- **Privacy Protection:** Public endpoints expose only display names and profile pictures; user email addresses and auth identifiers are strictly excluded from public serializers.
- **Administrative Access Control:** Enforced via `permissions.IsAdminUser` on backend endpoints and Django permissions system.
