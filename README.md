# Review Web — Tirunelveli District (திருநெல்வேலி மாவட்டம்)

**Review Web** is an authentic, production-minded public directory and community review platform focused specifically on Tirunelveli district, Tamil Nadu, India.

---

## 🏛️ Core Mission & Vision
- **Authentic Local Discovery:** Discover registered establishments and public services across Tirunelveli City, Palayamkottai, Ambasamudram, Cheranmahadevi, Nanguneri, Radhapuram, Valliyur, Kalakkad, and Sankarankovil.
- **Genuine Reviews:** Verified 5-star rating system with duplicate-review prevention (strictly one review per user per place).
- **Clear Separation of Reviews & Complaints:** Transparent distinction between subjective community experiences and formal legal/consumer grievance mechanisms.
- **Strict Anti-Fabrication Standard:** No invented business listings, reviews, ratings, or simulated records in the production database. Real empty states are rendered whenever data is not yet present.

---

## 🛠️ Technology Stack
- **Frontend:** React 19, Vite 6, JavaScript, React Router v7, Modern CSS with Milky-White Glassmorphism & subtle Indian tricolour accents, Framer Motion, Lucide Icons, Canvas Confetti.
- **Backend:** Python 3.12, Django 5.2, Django REST Framework, Django ORM & Migrations, PostgreSQL support via `dj-database-url` and `psycopg2-binary`.
- **Database & Cloud:** Supabase PostgreSQL (or standard PostgreSQL), Google OAuth 2.0 with backend token verification, JWT authentication (`HS256`).
- **API Documentation:** OpenAPI 3.0 & Swagger UI generated via `drf-spectacular`.

---

## 📁 Monorepo Structure

```
review-web/
├── frontend/
│   ├── src/
│   │   ├── api/            # API client connecting to Django backend
│   │   ├── components/     # StarRating, EstablishmentCard, Modals, 3D Tilt Card, Navbar, Footer
│   │   ├── context/        # AuthContext (Google OAuth & JWT sessions)
│   │   ├── layouts/        # RootLayout with Navbar and Footer
│   │   ├── pages/          # Dashboard (9 sections), Category Directory, Detail, Suggest, Login, Profile, Admin, Guidelines
│   │   ├── styles/         # Milky-white glassmorphism & tricolour design system
│   │   ├── App.jsx         # Client-side routing configuration
│   │   └── main.jsx        # Mount point
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json         # Vercel SPA rewrites
│   └── .env.example
├── backend/
│   ├── config/             # Django settings, WSGI, ASGI, and root URLs
│   ├── apps/
│   │   ├── accounts/       # Custom User model, JWT auth, Google ID token verification, profile management
│   │   ├── directory/      # District, Town, Locality, Category, Establishment, CSV import, duplicate detection
│   │   ├── reviews/        # 1-5 Star validation, one-review constraint, aggregate calculation signals, reporting
│   │   ├── complaints/     # Verified official grievance portals and helplines
│   │   └── moderation/     # AuditLog, moderation decision queue, dashboard metrics
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── docs/
│   ├── architecture.md      # System architecture and layer diagrams
│   ├── database-schema.md   # Complete relational database models
│   ├── api.md               # REST API endpoints & parameter specification
│   ├── deployment.md        # Step-by-step deployment to Vercel, Supabase, Render
│   ├── data-import.md       # Lawful CSV ingestion format & duplicate detection
│   ├── moderation-policy.md # Community standards and review vs complaint policy
│   └── sample_import_template.csv # Sample CSV format for verification imports
├── docker-compose.yml       # One-command full-stack container orchestration
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start: Running Locally

### Option 1: Using Local Python & Node.js

#### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (uses SQLite default locally if DATABASE_URL is not set)
python manage.py migrate

# Populate official Tirunelveli District reference taxonomies (categories, towns, localities)
python manage.py populate_reference_data

# Run Django development server
python manage.py runserver 8000
```
Backend API will be accessible at: `http://localhost:8000/api/v1/`  
Swagger UI documentation at: `http://localhost:8000/api/docs/`

#### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install --legacy-peer-deps

# Start Vite development server
npm run dev
```
Frontend will be accessible at: `http://localhost:3000/`

---

### Option 2: Using Docker Compose
```bash
docker-compose up --build
```
This launches PostgreSQL 16 on port 5432, Django backend on port 8000, and React Vite frontend on port 3000.

---

## 🧪 Automated Test Suite
To execute the comprehensive automated test suite across all Django apps:
```bash
cd backend
python manage.py test apps.accounts.tests apps.directory.tests apps.reviews.tests apps.complaints.tests
```

**Tests verified and passing:**
- Google authentication and Bearer JWT token verification
- Unauthenticated access denial on protected endpoints
- Listing retrieval, filtering by category and town, and pagination
- Strict alphabetical sorting (A to Z) and reverse alphabetical sorting (Z to A)
- Bilingual search (English and Tamil queries)
- Duplicate establishment detection
- Lawful CSV import validation and ensuring imported records default to unverified status
- Place suggestion submission by citizens and administrator approval
- Five-star rating range validation (rejection of scores < 1 or > 5)
- Enforcing one review per user per establishment constraint
- Review editing permissions (user can edit own review, forbidden from editing others')
- Recalculation of average rating and 1-5 star distributions strictly from published reviews
- Review reporting workflow
- Complaint-channel public visibility rules (strictly verified and active channels displayed, internal administrative notes hidden)

---

## 🔑 Authentication & Demo Modes
1. **Google OAuth 2.0:** Configure `VITE_GOOGLE_CLIENT_ID` in frontend and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in backend.
2. **Instant Sandbox Access:** If testing locally without Google Cloud Console credentials, the Login page provides immediate one-click test logins:
   - **Citizen Reviewer:** `citizen@tirunelveli.local` (Test review creation and editing)
   - **District Moderator:** `admin@tirunelveli.local` (Full access to Admin Portal, CSV Ingestion, and Moderation Queue)

---

## 🚀 Cloud Deployment Instructions
Detailed steps for deploying the production stack are provided in [docs/deployment.md](docs/deployment.md):
- **Database:** Supabase PostgreSQL (Free Tier: 500 MB)
- **Backend:** Render / Railway / Fly.io (Free / Starter Tier)
- **Frontend:** Vercel (Free Hobby Tier)
