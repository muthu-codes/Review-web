# Production Deployment Guide — Review Web (Tirunelveli District)

This guide documents the complete procedure for deploying Review Web using free-tier services.

---

## 1. Hosting Architecture
- **Frontend:** Vercel (Free Hobby tier)
- **Backend API:** Render / Railway / Fly.io (Free / Starter tier)
- **Database:** Supabase PostgreSQL (Free tier: 500MB storage, connection pooling, SSL)

---

## 2. Supabase PostgreSQL Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Set project name: `review-web-tirunelveli` and select region (e.g. `ap-south-1` Mumbai / India for low latency).
3. Under **Project Settings -> Database -> Connection string**, copy the URI under **Transaction Pooler (Port 6543)** or **Direct Connection**:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
4. Save this as `DATABASE_URL` in your backend environment.

---

## 3. Google OAuth 2.0 Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create project `Review Web Tirunelveli`.
3. Configure the **OAuth Consent Screen**:
   - App Name: `Review Web — Tirunelveli District`
   - User Support Email: your email
   - Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
4. Under **Credentials**, create an **OAuth 2.0 Client ID** (Web Application):
   - Authorized JavaScript Origins:
     - `https://your-app.vercel.app`
     - `http://localhost:3000` (for local development)
   - Authorized Redirect URIs:
     - `https://your-app.vercel.app`
5. Copy the **Client ID** and **Client Secret**.

---

## 4. Backend Deployment (Render / Railway / Docker)

### Option A: Render (Web Service)
1. Link your GitHub repository to Render.
2. Select root directory: `backend/`.
3. Environment: `Python 3`.
4. Build Command:
   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py populate_reference_data
   ```
5. Start Command:
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4
   ```
6. Set Environment Variables:
   - `DJANGO_SECRET_KEY`: `<Generate a 64-char random string>`
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `your-backend.onrender.com,localhost`
   - `DATABASE_URL`: `<Supabase Connection String>`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
   - `GOOGLE_CLIENT_ID`: `<Google OAuth Client ID>`
   - `GOOGLE_CLIENT_SECRET`: `<Google OAuth Client Secret>`
   - `GOOGLE_OAUTH_TEST_MODE`: `False` (Enforces verified Google signatures)
   - `JWT_SECRET`: `<Generate a random string>`

---

## 5. Frontend Deployment (Vercel)
1. Link your repository in Vercel.
2. Select root directory: `frontend/`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Set Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api/v1`
   - `VITE_GOOGLE_CLIENT_ID`: `<Google OAuth Client ID>`
7. Deploy!

---

## 6. Health Checks & Verification
1. Verify backend health endpoint:
   ```bash
   curl -i https://your-backend.onrender.com/api/v1/health/
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "Review Web Backend (Tirunelveli District)",
     "database": "ok",
     "version": "1.0.0"
   }
   ```
2. Verify API documentation:
   Open `https://your-backend.onrender.com/api/docs/` in your browser.

---

## 7. Free-Tier Limitations & Monitoring
- **Render Free Tier:** Spins down after 15 minutes of inactivity; first request may take ~30 seconds to wake up.
- **Supabase Free Tier:** Automatically pauses database after 7 days of inactivity; access the dashboard to keep active. Storage limit is 500 MB (sufficient for tens of thousands of text listings and reviews).
- **Vercel Free Tier:** 100GB bandwidth per month (plenty for high-traffic local directory browsing).
