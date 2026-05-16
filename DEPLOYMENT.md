# OptiMill Deployment Runbook (v1.0)

This document outlines the steps to deploy the OptiMill application to production.

## 1. Database Setup (Supabase)
1. Ensure `supabase_schema.sql` has been run in the Supabase SQL Editor.
2. Run `scripts/optimize_db.sql` to add performance indexes.
3. Run `scripts/security_hardening.sql` to apply final RLS policies.
4. Enable **Supabase Storage** and create a bucket named `cad-files` with Public access (managed by RLS).

## 2. Backend Deployment (Railway)
1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Add a **Redis** service from the Railway dashboard.
3. Configure the following environment variables for the FastAPI service:
   - `DATABASE_URL`: Your Supabase Postgres connection string.
   - `SUPABASE_URL`: Your Supabase project URL.
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key.
   - `GEMINI_API_KEY`: Google AI API key.
   - `STRIPE_SECRET_KEY`: Stripe secret key.
   - `REDIS_URL`: Link to the Railway Redis service.
4. Deployment will trigger automatically on push to `main`.

## 3. Frontend Deployment (Vercel)
1. Connect your repository to [Vercel](https://vercel.com/).
2. Set the root directory to `frontend`.
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key.
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key.
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (from Railway).
4. Vercel will handle the build and PWA manifest generation.

## 4. Post-Deployment Checks
1. Verify PWA installability on mobile (check for the "Add to Home Screen" prompt).
2. Run `backend/tests/e2e_workflow.py` pointing to the production URL.
3. Monitor logs in Railway and Vercel for any runtime errors.

## 5. Security & Maintenance
- **Rate Limiting**: Currently set to 5 uploads per minute per IP. Adjust in `backend/app/api/v1/cad.py` if needed.
- **SSL**: Automatically handled by Railway and Vercel.
- **Backups**: Supabase handles automatic daily backups.
