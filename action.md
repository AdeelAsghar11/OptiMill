# MicroFactory OS — Backend Action Plan

> Stack: FastAPI · Supabase · Redis · Celery · Docker
> Architecture: Modular Monolith · Supabase Integration

## Workflow Rules
- **Commit & Push**: After completing each task (`tXX`), perform a `git add`, `git commit -m "task: description"`, and `git push`.
- **Validation**: Ensure the project builds and basic health checks pass before pushing.

---

## Phase 0 — Project Bootstrap

- `t00` Initialize Git repository with `.gitignore` for Python, Docker, and `.env` files
- `t01` Scaffold FastAPI project with modular folder structure: `app/auth/`, `app/orders/`, `app/workshops/`, `app/manufacturability/`, `app/quotation/`, `app/matching/`, `app/scheduling/`, `app/risk/`, `app/notifications/`
- `t02` Create `docker-compose.yml` with services: `api` (FastAPI), `redis`, `worker` (Celery)
- `t03` Create `.env.example` with variables: `SUPABASE_URL`, `SUPABASE_KEY`, `REDIS_URL`, `PLATFORM_MARGIN`, `ENV`
- `t04` Set up `requirements.txt` with: `fastapi`, `uvicorn`, `supabase`, `pydantic-settings`, `redis`, `celery`, `python-dotenv`
- `t05` Create `main.py` that mounts all module routers and initializes the FastAPI app with CORS and exception handlers
- `t06` Write project `README.md` with setup steps, env config guide, and API overview

---

## Phase 1 — Supabase Database Setup

- `t07` Initialize Supabase client in `app/supabase.py` using `SUPABASE_URL` and `SUPABASE_KEY`
- `t08` Define SQL schema for Supabase Dashboard/SQL Editor including RLS policies
- `t09` Create `users` table — fields: `id` (uuid), `name`, `email`, `role` (enum: customer, workshop, admin), `created_at`
- `t10` Create `workshops` table — fields: `id` (uuid), `user_id` (FK), `company_name`, `city`, `rating`, `reliability_score`, `created_at`
- `t11` Create `machines` table — fields: `id` (uuid), `workshop_id` (FK), `machine_type`, `max_dim_x`, `max_dim_y`, `max_dim_z`, `precision_mm`, `hourly_rate`, `status` (enum: active, inactive, maintenance)
- `t12` Create `materials` table — fields: `id` (uuid), `name`, `unit_cost`, `availability` (bool)
- `t13` Create `workshop_materials` join table — fields: `workshop_id` (FK), `material_id` (FK)
- `t14` Create `product_requests` table — fields: `id` (uuid), `customer_id` (FK), `quantity`, `material`, `process_type`, `dim_x`, `dim_y`, `dim_z`, `tolerance_mm`, `deadline`, `urgency` (enum: low, medium, high), `status`, `created_at`
- `t15` Create `manufacturability_reports` table — fields: `id` (uuid), `request_id` (FK), `is_manufacturable` (bool), `reasons` (jsonb)
- `t16` Create `quotations` table — fields: `id` (uuid), `request_id` (FK), `workshop_id` (FK), `material_cost`, `machine_cost`, `labor_cost`, `urgency_multiplier`, `risk_buffer`, `logistics_cost`, `platform_margin`, `total_cost`, `estimated_days`
- `t17` Create `match_scores` table — fields: `id` (uuid), `request_id` (FK), `workshop_id` (FK), `capability_score`, `capacity_score`, `cost_score`, `deadline_score`, `quality_score`, `location_score`, `final_score`
- `t18` Create `schedules` table — fields: `id` (uuid), `request_id` (FK), `workshop_id` (FK), `machine_id` (FK), `start_time`, `end_time`, `status`
- `t19` Create `quality_history` table — fields: `id` (uuid), `workshop_id` (FK), `defect_rate`, `on_time_rate`, `quality_score`, `recorded_at`
- `t20` Set up database indexes for performance on foreign keys and search fields
- `t21` Write `seed.py` script — use Supabase client to insert 3 workshops, 6 machines, 4 materials, 3 product requests

---

## Phase 2 — Supabase Auth & RBAC

- `t22` Configure Supabase Auth settings in Dashboard (Email/Password, JWT expiry)
- `t23` Create `app/auth/utils.py` for JWT validation using Supabase secret or client
- `t24` Create `POST /auth/register` — use Supabase Auth SDK to sign up user, sync profile to `users` table
- `t25` Create `POST /auth/login` — use Supabase Auth SDK to sign in, return access token
- `t26` Create `GET /auth/me` — return current authenticated user profile from Supabase
- `t27` Write `get_current_user` dependency that validates Supabase JWT and loads user metadata
- `t28` Write `require_role(role)` dependency for endpoint-level role enforcement using `users` table data

---

## Phase 3 — Workshop & Inventory APIs

- `t29` Create `POST /workshops` — register a workshop profile (workshop role only)
- `t30` Create `GET /workshops/{id}` — return workshop profile with machines and materials
- `t31` Create `POST /workshops/{id}/machines` — add a machine to a workshop
- `t32` Create `POST /workshops/{id}/materials` — link a material to a workshop
- `t33` Create `GET /workshops/{id}/capacity` — return currently available machine slots

---

## Phase 4 — Order Management APIs

- `t34` Create `POST /orders` — submit a manufacturing request, set status to `submitted`
- `t35` Create `GET /orders/{id}` — return full order detail including status
- `t36` Create `GET /orders/my-orders` — return all orders for the authenticated customer
- `t37` Create `PATCH /orders/{id}/status` — manually update order status (admin only), validate allowed transitions
- `t38` Implement order status state machine — enforce valid transitions: `draft → submitted → under_analysis → rejected | quoted → accepted | expired → scheduled → in_production → quality_check → completed → delivered`

---

## Phase 5 — Manufacturability Service

- `t39` Create `app/manufacturability/engine.py` — implement constraint-checking logic
- `t40` Check process type support: reject if no workshop machine supports the requested process
- `t41` Check material availability: reject if requested material is not stocked by any compatible workshop
- `t42` Check dimension limits: reject if product dimensions exceed all available machine capacities
- `t43` Check tolerance support: reject if required precision is tighter than machine precision
- `t44` Check quantity feasibility: reject if quantity exceeds any single workshop's batch capacity
- `t45` Return structured result: `{ is_manufacturable: bool, reasons: [str], compatible_workshop_ids: [int] }`
- `t46` Create `POST /orders/{id}/analyze` — trigger manufacturability check, store report, update order status
- `t47` Create `GET /orders/{id}/manufacturability` — return stored manufacturability report

---

## Phase 6 — Quotation Service

- `t48` Create `app/quotation/engine.py` — implement cost model
- `t49` Implement material cost: `quantity × material.unit_cost`
- `t50` Implement machine cost: `estimated_machine_hours × machine.hourly_rate`
- `t51` Implement labor cost: flat rate per unit × quantity
- `t52` Implement urgency multiplier: `low=1.0`, `medium=1.15`, `high=1.35`
- `t53` Implement risk buffer: percentage add-on based on workshop quality score
- `t54` Implement logistics cost: flat distance-based estimate using city field
- `t55` Implement platform margin: configurable percentage from env (`PLATFORM_MARGIN`)
- `t56` Final formula: `total = (material + machine + labor) × urgency_multiplier + risk_buffer + logistics + platform_margin`
- `t57` Store full cost breakdown per workshop in `quotations` table
- `t58` Create `GET /orders/{id}/quotations` — return all quotes for an order ranked by total cost

---

## Phase 7 — Workshop Matching Service

- `t59` Create `app/matching/engine.py` — implement weighted scoring
- `t60` Implement capability score: does workshop support process + material + dimensions (0–1)
- `t61` Implement capacity score: ratio of available slots to required machine time (0–1)
- `t62` Implement cost score: inverse normalized total quote cost across candidates (0–1)
- `t63` Implement deadline score: binary or scaled — can workshop finish before deadline (0–1)
- `t64` Implement quality score: normalize workshop `quality_score` from `quality_history` (0–1)
- `t65` Implement location score: same-city = 1.0, same-country = 0.5, international = 0.2
- `t66` Compute final score: `0.30×capability + 0.20×capacity + 0.15×cost + 0.15×deadline + 0.10×quality + 0.10×location`
- `t67` Store all score components in `match_scores` table
- `t68` Create `GET /orders/{id}/matches` — return workshops ranked by `final_score` descending

---

## Phase 8 — Scheduling Service

- `t69` Create `app/scheduling/engine.py` — implement greedy earliest-deadline-first slot assignment
- `t70` Query existing `schedules` for a machine to detect time conflicts
- `t71` Find earliest available time window that fits `estimated_machine_hours` before `deadline`
- `t72` On conflict: skip to next available slot or next ranked workshop
- `t73` On successful slot found: insert row into `schedules` and lock the slot
- `t74` Create `POST /orders/{id}/schedule` — assign best available machine slot for top-ranked workshop
- `t75` Create `GET /orders/{id}/schedule` — return schedule details (machine, start time, end time)

---

## Phase 9 — Quality Risk Service

- `t76` Create `app/risk/engine.py` — implement rule-based risk scoring
- `t77` Factor 1 — Workshop defect rate: high `defect_rate` adds risk points
- `t78` Factor 2 — On-time rate: low `on_time_rate` adds risk points
- `t79` Factor 3 — Job complexity: tight tolerance + multi-step process adds risk points
- `t80` Factor 4 — Material difficulty: hard materials (e.g. titanium, carbon fibre) add risk points
- `t81` Factor 5 — Urgency: `high` urgency adds risk points
- `t82` Compute composite risk score (0–100), map to label: `0–30 = low`, `31–60 = medium`, `61–100 = high`
- `t83` Create `GET /orders/{id}/risk` — return risk score, label, and contributing factors breakdown

---

## Phase 10 — Full Pipeline Orchestration

- `t84` Wire `POST /orders/{id}/analyze` to auto-chain: manufacturability → filter workshops → generate quotes → rank matches → find schedule slot → compute risk
- `t85` After full pipeline: update order status to `quoted`, return final proposal (top quote + ETA + risk label)
- `t86` Create `PATCH /orders/{id}/accept` — customer accepts quote, status → `accepted`, trigger schedule reservation, status → `scheduled`
- `t87` Create `PATCH /orders/{id}/reject` — customer rejects quote, status → `expired`
- `t88` Create `PATCH /orders/{id}/complete` — workshop marks job done, write outcome to `quality_history`, status → `completed`
- `t89` Offload manufacturability and matching steps to Celery background worker via Redis queue

---

## Phase 11 — Admin Routes

- `t90` Create `GET /admin/orders` — paginated list of all orders with status filter
- `t91` Create `GET /admin/workshops` — list all workshops with machine count and reliability score
- `t92` Create `GET /admin/analytics` — return total orders, orders by status, average quote value, top workshops by match score

---

## Phase 12 — Testing & Verification

- `t93` Unit test manufacturability engine — 1 feasible request, 1 infeasible (dimension too large), 1 infeasible (material not supported)
- `t94` Unit test quotation engine — verify each cost component independently, verify urgency multiplier changes total
- `t95` Unit test matching engine — verify score weights sum to 1.0, verify ranking order is correct
- `t96` Unit test scheduling engine — verify conflict detection when two jobs overlap on the same machine
- `t97` Unit test risk engine — compare low-risk vs high-risk workshop output for identical request
- `t98` Integration test for happy path: submit → analyze → quote → match → schedule → risk → accept → complete
- `t99` Integration test for rejection path: submit → analyze → return rejection reasons with correct status
- `t100` Test all status transitions — verify invalid transitions are blocked with 422 error

---

## Phase 13 — Deployment & Demo

- `t101` Write `Dockerfile` for FastAPI app with multi-stage build
- `t102` Add health check endpoint `GET /health` returning service status and Supabase connectivity
- `t103` Configure environment variables in deployment environment (Docker/Cloud)
- `t104` Run seed script to populate demo data: 3 workshops, varied machines, materials, and 3 full order scenarios
- `t105` Verify demo scenario 1 — feasible request goes through full pipeline and reaches `accepted`
- `t106` Verify demo scenario 2 — infeasible request is rejected with specific reasons
- `t107` Verify demo scenario 3 — two conflicting jobs on same machine, scheduling resolves without conflict
- `t108` Export OpenAPI docs via `/docs` and `/redoc`, confirm all endpoints are documented
- `t109` Final review: all 5 algorithm modules produce correct and explainable outputs for demo dataset
