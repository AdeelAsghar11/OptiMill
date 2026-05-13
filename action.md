# OptiMill — Implementation Action Plan (v1.1)

> Stack: React (Vite) · FastAPI · Supabase · OpenAI · Stripe
> Architecture: Modular Marketplace with AI Analysis & Escrow Payments

## Workflow Rules
- **Commit & Push**: After completing each task (`tXX`), perform a `git add`, `git commit -m "task: description"`, and `git push`.
- **Validation**: Ensure the project builds and basic health checks pass before pushing.
- **Alignment**: Follow the PRD/TRD exactly for schema and feature specifications.

---

## Phase 0 — Project Bootstrap

- `t00` Initialize project structure (Frontend: Vite/React, Backend: FastAPI)
- `t01` Configure `.env` with Supabase, OpenAI, and Stripe keys
- `t02` Set up Supabase Client in `frontend/src/lib/supabase.js` and `backend/app/supabase.py`
- `t03` Update `requirements.txt` (Backend) and `package.json` (Frontend) with TRD dependencies
- `t04` Initialize Docker Compose with API, Redis, and Worker (for long-running AI tasks)

---

## Phase 1 — Database & Profiles

- `t05` Run [supabase_schema.sql](file:///f:/New%20folder%20%282%29/OptiMill/supabase_schema.sql) in Supabase SQL Editor
- `t06` Implement `handle_new_user` DB trigger for automatic profile creation
- `t07` Create `GET /profiles/me` and `PATCH /profiles/me` (Auth required)
- `t08` Implement Role-Based Access Control (RBAC) middleware for 'client', 'shop', and 'admin' roles

---

## Phase 2 — CAD Analysis Engine (AI-Powered)

- `t09` Create Supabase Storage bucket `cad-files` with appropriate security policies
- `t10` Implement CAD file upload with 3D preview using `@react-three/fiber`
- `t11` Create `POST /analyze` endpoint (or Supabase Edge Function) using OpenAI GPT-4o to analyze CAD metadata
- `t12` Parse AI response: `feasibility_score`, `complexity`, `cost_range`, `process_recommendation`
- `t13` Store analysis results in `cad_files` table and return to frontend

---

## Phase 3 — Shop Marketplace

- `t14` Create `POST /shops` for Shop Masters to set up their profile (capabilities, materials, rates)
- `t15` Implement Shop Discovery API: filter by capabilities, materials, and proximity (Mapbox)
- `t16` Build Shop Public Profile page with machine list and portfolio
- `t17` Implement rating and review logic (update `shops.rating` on new `reviews` entry)

---

## Phase 4 — Quoting & Order Workflow

- `t18` Create `POST /quotes/request` — client requests quote for a specific CAD file
- `t19` Create Shop Dashboard view for incoming quote requests
- `t20` Create `POST /quotes` — shop submits a formal quote with amount and delivery days
- `t21` Build Quote Comparison view for clients (side-by-side analysis)
- `t22` Implement Order state machine: `pending → paid → in_progress → qa → shipped → complete`

---

## Phase 5 — Communication & Scheduling

- `t23` Enable Supabase Realtime for `messages` table
- `t24` Build Live Chat component for order-specific threads
- `t25` Integrate Meeting Scheduler (Google Meet/Zoom) for client-shop consultations
- `t26` Implement `meetings` table logic: schedule, complete, or cancel meetings

---

## Phase 6 — Payments (Stripe Escrow)

- `t27` Integrate Stripe SDK for payment authorization (Escrow Hold)
- `t28` Implement `capture_method: manual` flow for holding funds until delivery confirmation
- `t29` Create webhook handler to update order status to `paid` on successful authorization
- `t30` Implement "Release Payment" logic: transfer funds to shop minus platform fee

---

## Phase 7 — Notifications & Admin

- `t31` Implement real-time notifications for: `quote_received`, `order_update`, `new_message`
- `t32` Build Admin Dashboard: user management, shop verification, and dispute resolution
- `t33` Implement automated email notifications via Resend.com

---

## Phase 8 — Deployment & PWA

- `t34` Configure PWA manifest and service worker for mobile installability
- `t35` Final integration testing: CAD upload to payment release flow
- `t36` Deploy frontend to Vercel/Netlify and backend to Railway/Supabase Functions
