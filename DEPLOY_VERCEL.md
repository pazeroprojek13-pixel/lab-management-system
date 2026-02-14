# Deploy to Vercel (Backend + Frontend)

## 1) Neon setup
1. Use a Neon database branch intended for production.
2. Copy pooled connection string (`...-pooler...`) for app runtime.
3. Ensure SSL mode is enabled (`sslmode=require`).
4. If old credentials were exposed, rotate DB password first.

## 2) Local pre-check
1. Ensure `.env` exists (see `.env.backend.vercel.example`).
2. Run:
```bash
npx prisma migrate deploy
npm run dev
```
3. Verify:
```bash
GET http://localhost:3000/health
```

## 3) Backend project on Vercel
1. Import this repository as a Vercel project.
2. Root Directory: repository root.
3. Install Command: `npm install`
4. Build Command: `echo "skip build"` (temporary until TS build is fully fixed)
5. Add Environment Variables (Production + Preview):
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CORS_ORIGIN`
   - `CRON_SECRET`
   - Optional SMTP/WhatsApp vars
6. Deploy.

## 4) Frontend project on Vercel
1. Create second Vercel project from the same repository.
2. Root Directory: `frontend`
3. Build Command: default Vite build.
4. Add env:
   - `VITE_API_URL=https://<backend-domain>.vercel.app/api`
5. Deploy.

## 5) CORS
Set backend `CORS_ORIGIN` to frontend domain:
```env
CORS_ORIGIN=https://<frontend-domain>.vercel.app
```
For multiple origins, comma-separated.

## 6) Cron
Cron is configured in `vercel.json`:
- `/api/cron/warranty`
- `/api/cron/incident-escalation`
- `/api/cron/maintenance-overdue`

Use `CRON_SECRET` and pass either:
- `x-cron-secret: <CRON_SECRET>`, or
- `Authorization: Bearer <CRON_SECRET>`

## 7) Post-deploy smoke test
1. Backend:
   - `/health`
   - `/api/auth/login`
   - `/api/reports/incidents-summary` (with auth token)
2. Frontend:
   - login flow
   - dashboard data load
