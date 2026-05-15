# OptiMill — Extended Implementation Action Plan (v1.2)

> Stack: React (Vite) · FastAPI · Supabase · Gemini/Groq · Stripe
> Architecture: Modular Marketplace with AI Analysis, Intelligent Recommendations & Escrow Payments

## Workflow Rules
- **Commit & Push**: After completing each task (`tXX`), perform a `git add`, `git commit -m "task: description"`, and `git push`.
- **Validation**: Ensure the project builds and basic health checks pass before pushing.
- **Alignment**: Follow the PRD/TRD exactly for schema and feature specifications.

---

## Phase 0 — Project Bootstrap ✅ (Complete)

- `t00` Initialize project structure (Frontend: Vite/React, Backend: FastAPI)
- `t01` Configure `.env` with Supabase, Gemini, and Stripe keys
- `t02` Set up Supabase Client in `frontend/src/lib/supabase.js` and `backend/app/supabase.py`
- `t03` Update `requirements.txt` (Backend) and `package.json` (Frontend) with TRD dependencies
- `t04` Initialize Docker Compose with API, Redis, and Worker (for long-running AI tasks)

---

## Phase 1 — Database & Profiles ✅ (Complete)

- `t05` Run supabase_schema.sql in Supabase SQL Editor
- `t06` Implement `handle_new_user` DB trigger for automatic profile creation
- `t07` Create `GET /profiles/me` and `PATCH /profiles/me` (Auth required)
- `t08` Implement Role-Based Access Control (RBAC) middleware for 'client', 'shop', and 'admin' roles

---

## Phase 2 — CAD Analysis Engine (AI-Powered) ✅ (Complete)

- `t09` Create Supabase Storage bucket `cad-files` with appropriate security policies
- `t10` Implement CAD file upload with 3D preview using `@react-three/fiber`
- `t11` Create `POST /analyze` endpoint (or Supabase Edge Function) using Gemini 1.5 Flash to analyze CAD metadata
- `t12` Parse AI response: `feasibility_score`, `complexity`, `cost_range`, `process_recommendation`
- `t13` Store analysis results in `cad_files` table and return to frontend

---

## Phase 3 — Shop Marketplace ✅ (Complete)

- `t14` Create `POST /shops` for Shop Masters to set up their profile (capabilities, materials, rates)
- `t15` Implement Shop Discovery API: filter by capabilities, materials, and proximity (Mapbox)
- `t16` Build Shop Public Profile page with machine list and portfolio
- `t17` Implement rating and review logic (update `shops.rating` on new `reviews` entry)

---

## Phase 4 — Quoting & Order Workflow ✅ (Complete)

- `t18` Create `POST /quotes/request` — client requests quote for a specific CAD file
- `t19` Create Shop Dashboard view for incoming quote requests
- `t20` Create `POST /quotes` — shop submits a formal quote with amount and delivery days
- `t21` Build Quote Comparison view for clients (side-by-side analysis)
- `t22` Implement Order state machine: `pending → paid → in_progress → qa → shipped → complete`

---

## Phase 5 — Communication & Scheduling ✅ (Complete)

- `t23` Enable Supabase Realtime for `messages` table
- `t24` Build Live Chat component for order-specific threads
- `t25` Integrate Meeting Scheduler (Google Meet/Zoom) for client-shop consultations
- `t26` Implement `meetings` table logic: schedule, complete, or cancel meetings

---

## Phase 6 — Payments (Stripe Escrow) ✅ (Complete)

- `t27` Integrate Stripe SDK for payment authorization (Escrow Hold)
- `t28` Implement `capture_method: manual` flow for holding funds until delivery confirmation
- `t29` Create webhook handler to update order status to `paid` on successful authorization
- `t30` Implement "Release Payment" logic: transfer funds to shop minus platform fee

---

## Phase 7 — Notifications & Admin ✅ (Complete)

- `t31` Implement real-time notifications for: `quote_received`, `order_update`, `new_message`
- `t32` Build Admin Dashboard: user management, shop verification, and dispute resolution
- `t33` Implement automated email notifications via Resend.com

---

## Phase 8 — Design Classification & Material Detection ✅ (Complete)

**Objective:** Add intelligent design classification and material inference to enhance CAD analysis

**Database Schema Updates:**

```sql
-- Table 1: Design Classifications
CREATE TABLE design_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_file_id UUID NOT NULL UNIQUE REFERENCES cad_files(id) ON DELETE CASCADE,
  design_type VARCHAR(100),  -- sofa, table, bracket, cabinet, etc.
  design_category VARCHAR(50),  -- furniture, mechanical, structural, etc.
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  geometric_features JSONB,  -- { aspect_ratio, volume, symmetry, ... }
  vision_analysis JSONB,  -- AI Vision response
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Material Requirements
CREATE TABLE material_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_file_id UUID NOT NULL REFERENCES cad_files(id) ON DELETE CASCADE,
  material_name VARCHAR(100),  -- wood, foam, fabric, steel, etc.
  material_category VARCHAR(50),  -- structural, aesthetic, fastening, etc.
  estimated_quantity FLOAT,
  unit VARCHAR(20),  -- kg, meters, sheets, sq-ft
  priority VARCHAR(20),  -- primary, secondary, optional
  supplier_type VARCHAR(50),  -- timber_supplier, metal_supplier, etc.
  inference_confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Design-to-Material Knowledge Base
CREATE TABLE design_material_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_type VARCHAR(100),
  material_name VARCHAR(100),
  typical_quantity_range TEXT,  -- "10-50 kg" or "2-5 meters"
  use_case VARCHAR(200),  -- e.g., "frame", "upholstery", "fastening"
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_design_material_type ON design_material_mappings(design_type);
```

**Backend Tasks:**

- `t34` Create `DesignClassifier` module in `backend/app/models/design_classifier.py`
  - Implement STL geometry feature extraction (aspect ratio, volume, symmetry scoring)
  - Calculate bounding box and surface complexity metrics
  - Return geometric feature vector

- `t35` Extend `POST /analyze` endpoint to include design classification
  - Call Gemini Vision API on 3D preview image with prompt: "What type of product is this? (sofa, table, bracket, etc.)"
  - Parse confidence from AI response
  - Combine geometric + vision scores into final classification
  - Store in `design_classifications` table

- `t36` Create `MaterialExtractor` module in `backend/app/models/material_extractor.py`
  - Build design-to-material knowledge graph (populate `design_material_mappings`)
  - Implement semantic inference: given design type + geometry, infer materials
  - Call Gemini: "For a [design_type] design with these dimensions, what materials are typically needed?"
  - Parse AI response for material list with quantities
  - Store in `material_requirements` table

- `t37` Create `POST /cad/:id/materials` endpoint
  - Retrieve materials from `material_requirements` table
  - Organize by category: structural, aesthetic, fastening
  - Return with estimated quantities and supplier type hints

**Frontend Tasks:**

- `t38` Extend CAD Report UI to display design classification
  - Show design type with confidence badge
  - Display design category and key characteristics
  - Add visual icon representing design (sofa icon, table icon, etc.)

- `t39` Create Material List component
  - Display materials in organized sections: Structural, Aesthetic, Fastening
  - Show estimated quantities with units
  - Add "Find Supplier" CTA for each material (prepares for Phase 10)

- `t40` Build Material Inference Details modal
  - Show Gemini's reasoning: "Why these materials?"
  - Allow user to add/edit materials if needed
  - Persist user overrides to `material_requirements` table

**Admin Tasks:**

- `t41` Create Admin panel for Design-Material Knowledge Base
  - UI to view/edit `design_material_mappings`
  - Add/update design-material relationships
  - Manage material categories and supplier types

**Testing:**

- `t42` Unit tests for geometry feature extraction
- `t43` Integration tests for design classification pipeline (STL → features → Vision → classification)
- `t44` Material extraction tests with various design types

**Definition of Done:**
- ✅ CAD upload returns design type + materials
- ✅ Design classification confidence > 70%
- ✅ Material list generated automatically
- ✅ All tests passing
- ✅ PR reviewed and merged

---

## Phase 9 — Intelligent Shop Recommendations ✅ (Complete)

**Objective:** Recommend relevant shops based on design type, materials, location, and expertise

**Database Schema Updates:**

```sql
-- Table 1: Shop Specializations (extend existing shops table)
ALTER TABLE shops ADD COLUMN IF NOT EXISTS specializations TEXT[];  -- e.g., ['CNC', '3D Printing', 'Woodworking']
ALTER TABLE shops ADD COLUMN IF NOT EXISTS material_expertise JSONB;  -- e.g., { "wood": 0.9, "metal": 0.8, "plastic": 0.6 }
ALTER TABLE shops ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS longitude FLOAT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS turnaround_history JSONB;  -- e.g., { "avg_days": 7, "on_time_rate": 0.95 }

-- Table 2: Recommendation Scores (for analytics & debugging)
CREATE TABLE recommendation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_file_id UUID NOT NULL REFERENCES cad_files(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  capability_score FLOAT,  -- 0-100: does shop have required capabilities?
  material_expertise_score FLOAT,  -- 0-100: shop experience with required materials
  proximity_score FLOAT,  -- 0-100: distance from user location
  reputation_score FLOAT,  -- 0-100: shop rating + review quality
  availability_score FLOAT,  -- 0-100: current workload + capacity
  final_composite_score FLOAT,  -- weighted average
  risk_level VARCHAR(20),  -- LOW, MEDIUM, HIGH
  recommendation_rank INTEGER,  -- 1st, 2nd, 3rd, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recommendation_cad_file ON recommendation_scores(cad_file_id);
CREATE INDEX idx_recommendation_composite ON recommendation_scores(final_composite_score DESC);
```

**Backend Tasks:**

- `t45` Create `ShopRecommender` module in `backend/app/models/shop_recommender.py`
  - Implement multi-factor scoring algorithm
  - Function signatures:
    ```python
    calculate_capability_score(shop_specializations, design_type) -> float
    calculate_material_expertise_score(shop_materials, required_materials) -> float
    calculate_proximity_score(user_lat, user_lon, shop_lat, shop_lon) -> float
    calculate_reputation_score(shop_rating, reviews, on_time_rate) -> float
    calculate_availability_score(shop_workload, capacity, design_complexity) -> float
    calculate_composite_score(scores_dict, weights_dict) -> float
    ```

- `t46` Create `POST /recommendations/:cad_id` endpoint
  - Retrieve design classification + materials from Phase 8
  - Retrieve user location (from profile)
  - Query all shops from `shops` table
  - Calculate scores for each shop using ShopRecommender
  - Sort by composite score
  - Organize into sections: CNC Shops, 3D Print, Woodworking, Finishing, Regional Suppliers
  - Store scores in `recommendation_scores` table for analytics
  - Return ranked list with risk badges

- `t47` Create `GET /admin/recommendation-weights` and `PATCH /admin/recommendation-weights` endpoints
  - Allow admin to adjust scoring weights (capability: 0.30, material: 0.25, etc.)
  - Store in config table or env variables
  - Changes apply to next recommendations

**Frontend Tasks:**

- `t48` Build Recommendation Results page
  - Display shops organized by section (CNC, 3D Print, Woodworking, Finishing, Regional)
  - Show for each shop:
    - Shop name, profile image, rating
    - Specializations badges
    - Distance from user
    - Turnaround time estimate
    - Risk indicator (GREEN/YELLOW/RED)
    - "Request Quote" button
  - Filtering options: by service type, by distance, by rating

- `t49` Create Recommendation Details modal (click on shop card)
  - Shop profile overview
  - Why we recommended this shop: breakdown of scores (capability, material, proximity, reputation, availability)
  - Portfolio/past projects
  - Reviews and ratings
  - "Request Quote" CTA

- `t50` Add Admin panel for Recommendation Weight Configuration
  - Sliders for each scoring weight
  - Live preview of how weights affect rankings
  - Save and apply changes

**Testing:**

- `t51` Unit tests for individual scoring functions
  - Capability score: shop with matching specialization scores high
  - Material expertise: shop with required materials scores high
  - Proximity: distance calculation and scoring
  - Reputation: rating conversion to score
  - Availability: workload affects score

- `t52` Integration tests for full recommendation pipeline
  - CAD upload → classification → materials → recommendations
  - Test with multiple design types
  - Verify ranking correctness

**Definition of Done:**
- ✅ Recommendations API returns ranked shops
- ✅ Scoring algorithm weights configurable by admin
- ✅ Recommendations organized by service type
- ✅ Risk indicators displayed (low/medium/high)
- ✅ All tests passing
- ✅ PR reviewed and merged

---

## Phase 10 — Map Visualization & Geospatial Search ✅ (Complete)

**Objective:** Visualize recommended shops on interactive maps with geospatial proximity features

**Database Schema Updates:**

```sql
-- Create spatial index for faster geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE shops ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);
CREATE INDEX idx_shop_location ON shops USING GIST (location);

-- Store user location for recommendation context
CREATE TABLE user_locations (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100),
  last_updated TIMESTAMP DEFAULT NOW()
);
```

**Geospatial Algorithm:**

- `t53` Implement Haversine distance function in `backend/app/utils/geospatial.py`
  ```python
  def haversine_distance(lat1, lon1, lat2, lon2) -> float:
      """Calculate distance in kilometers between two points"""
  
  def ring_based_expansion(user_lat, user_lon, shops, min_results=5) -> list:
      """
      Expand search rings until min_results found:
      Ring 1: 5km, Ring 2: 15km, Ring 3: 50km, Ring 4: 100km, Ring 5: 250km
      """
  ```

**Backend Tasks:**

- `t54` Create `GET /shops/nearby?lat=X&lon=Y&radius=10` endpoint
  - Accept user location (lat/lon) and optional radius
  - Query shops within radius using Haversine distance
  - Sort by distance (nearest first)
  - Return shop list with distance for each

- `t55` Create ring-based expansion endpoint: `GET /shops/nearby-expanded?lat=X&lon=Y`
  - Implement ring-based geospatial search algorithm
  - Start with 5km ring, expand to 15km, 50km, 100km, 250km until 5+ results
  - Return results grouped by ring (for UI to show "Local" vs. "Regional")
  - Track expansion level for analytics

- `t56` Integrate Mapbox API (or Google Maps)
  - Set up Mapbox GL backend token
  - Create helper functions for:
    - Reverse geocoding (lat/lon → city/province)
    - Address autocomplete
    - Distance matrix queries

- `t57` Implement geolocation tracking
  - Frontend: request user's current location (browser geolocation API)
  - Store location in `user_locations` table
  - Create `POST /locations` endpoint to store user position
  - Use for proximity-based recommendations

**Frontend Tasks:**

- `t58` Build Interactive Map component
  - Integrate Mapbox GL JS (or Google Maps SDK)
  - Display shop markers with:
    - Shop name, rating
    - Distance from user
    - Click to expand shop details
  - Display user location marker (blue circle)
  - Add zoom controls, pan functionality
  - Responsive for mobile

- `t59` Create Map-based Shop Recommendations view
  - Show map with all recommended shops plotted
  - Color-code markers by service type (Red=CNC, Blue=3D Print, Green=Woodworking)
  - Show distance rings (5km, 15km, 50km) as visual feedback
  - Sidebar with shop list that syncs with map selection
  - Filter controls: by service type, by distance range, by rating

- `t60` Implement Location Permission flow
  - Request browser geolocation permission on first use
  - Show user's current location on map
  - Option to search from different location

- `t61` Add distance display to shop cards
  - Calculate distance from user to shop
  - Show "X km away" or "~X min drive" estimate
  - Add distance as filter/sort option

**Admin Tasks:**

- `t62` Admin panel for Geospatial Analytics
  - View shop distribution on map
  - Heatmap of user locations
  - Coverage analysis: are there gaps in specific regions?
  - Update shop locations (lat/lon) if missing

**Testing:**

- `t63` Unit tests for Haversine distance calculation
  - Test known coordinate pairs
  - Verify accuracy within acceptable tolerance

- `t64` Integration tests for ring-based expansion
  - Mock shop locations at various distances
  - Verify expansion algorithm terminates correctly
  - Check result ordering

- `t65` Map component tests
  - Verify markers render correctly
  - Test click-to-expand functionality
  - Mobile responsiveness tests

**Definition of Done:**
- ✅ Interactive map displays all recommended shops
- ✅ User location shown on map
- ✅ Distance calculated and displayed
- ✅ Ring-based expansion algorithm working
- ✅ Map responsive on mobile
- ✅ Location permission flow smooth
- ✅ All tests passing
- ✅ PR reviewed and merged

---

## Phase 11 — External Supplier Search (Optional) ✅ (Complete)

**Objective:** (Time-Permitting) Integrate external APIs to find material suppliers, expanding beyond internal shop database

**Scope:** Pakistan-focused only for MVP; expand to South Asia only if time permits

**Database Schema Updates:**

```sql
-- Table: External Suppliers (cached from API calls)
CREATE TABLE external_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255),  -- e.g., "google_places:abc123"
  supplier_name VARCHAR(255),
  supplier_type VARCHAR(100),  -- timber_supplier, metal_supplier, fabric_supplier, etc.
  address TEXT,
  latitude FLOAT,
  longitude FLOAT,
  phone VARCHAR(20),
  website VARCHAR(255),
  rating FLOAT,
  review_count INTEGER,
  api_source VARCHAR(50),  -- google_places, openstreetmap, etc.
  material_categories TEXT[],  -- ['wood', 'metal', 'fabric']
  last_cached TIMESTAMP,
  cache_ttl_hours INTEGER DEFAULT 24
);

CREATE INDEX idx_external_supplier_location ON external_suppliers(latitude, longitude);
CREATE INDEX idx_external_supplier_type ON external_suppliers(supplier_type);
```

**Backend Tasks:**

- `t66` Integrate Google Places API (or OpenStreetMap Overpass API)
  - Set up API credentials and rate limiting
  - Create `ExternalSupplierFinder` class in `backend/app/services/external_suppliers.py`
  - Implement search queries:
    ```python
    find_timber_suppliers(lat, lon, radius_km)
    find_metal_suppliers(lat, lon, radius_km)
    find_fabric_suppliers(lat, lon, radius_km)
    find_foam_suppliers(lat, lon, radius_km)
    ```

- `t67` Implement caching for external API results
  - Store supplier results in `external_suppliers` table
  - Cache TTL: 24 hours
  - Reduce API calls through intelligent caching
  - Background job to refresh stale cache

- `t68` Create `POST /external-suppliers/search` endpoint
  - Input: material type, user location (lat/lon)
  - Query external API + internal cache
  - Combine results, deduplicate by location
  - Return ranked by proximity
  - Track API usage for cost monitoring

- `t69` Create admin monitoring for API usage
  - Dashboard showing API calls per day
  - Cost estimation
  - Rate limit warnings

**Frontend Tasks:**

- `t70` Add "Material Suppliers" section to Recommendations page
  - Show external suppliers separately from internal shops
  - Label as "Nearby Suppliers (External)"
  - Include supplier name, address, distance, rating
  - Link to Google Maps/website for more info

- `t71` Build Material Supplier Details modal
  - Show supplier info (name, address, phone, website)
  - Distance and travel time estimate
  - Ratings and reviews from API
  - "Call" or "Visit Website" CTA

**Testing:**

- `t72` Integration tests for external supplier search
  - Mock API responses
  - Verify caching works correctly
  - Test fallback if API is down

**Definition of Done (for this optional phase):**
- ✅ External supplier search working for Pakistan
- ✅ Results cached and deduplicated
- ✅ API costs monitored
- ✅ All tests passing
- ✅ PR reviewed and merged

---

## Phase 12 — Deployment & PWA (FINAL) 🚀

**Objective:** Polish, test end-to-end, and deploy to production

**Frontend Tasks:**

- `t73` Configure PWA manifest and service worker for mobile installability
  - Add `manifest.json` to Vite public folder
  - Implement service worker for offline support
  - Icon set for app home screen
  - Splash screen configuration

- `t74` Mobile responsiveness audit
  - Test all new pages on mobile (iPhone, Android)
  - Fix layout issues in map component
  - Optimize images for mobile bandwidth

**Backend Tasks:**

- `t75` Performance optimization
  - Database query optimization (add indexes as needed)
  - API response time targets: < 500ms for recommendations
  - Caching strategy for frequently accessed data (Redis)

- `t76` Security hardening
  - SQL injection prevention (parameterized queries)
  - RLS verification on all Supabase tables
  - Input validation and sanitization
  - Rate limiting on public endpoints

**Testing Tasks (All Members):**

- `t77` End-to-end testing: CAD upload → classification → materials → recommendations → quote → payment
  - Test on both web and mobile
  - Test multiple design types
  - Test edge cases (unusual CAD files, missing location data, etc.)

- `t78` Load testing
  - Simulate concurrent users uploading CAD files
  - Test recommendation engine under load
  - Monitor API response times and database queries

- `t79` Security penetration testing
  - Test RLS bypasses
  - Test payment flow security
  - Test file upload vulnerabilities

**Deployment Tasks:**

- `t80` Deploy frontend to Vercel
  - Configure env variables
  - Set up custom domain
  - Enable analytics (PostHog)
  - Configure PWA settings

- `t81` Deploy backend to Railway (or Supabase Edge Functions)
  - Deploy FastAPI service
  - Configure environment variables
  - Set up database connection pooling
  - Enable monitoring (Sentry)

- `t82` Deploy Redis cache (if needed)
  - Set up Redis instance on Railway
  - Configure FastAPI to use Redis

- `t83` Final integration testing on production
  - Test full workflow on deployed app
  - Monitor for errors (Sentry)
  - Check performance (PostHog)
  - Verify payments work in production

- `t84` Create deployment runbook
  - Steps to deploy frontend
  - Steps to deploy backend
  - Database migration procedures
  - Rollback procedures

**Documentation Tasks:**

- `t85` Create user documentation
  - Client guide: how to upload CAD, request quotes, make payments
  - Shop guide: how to set up profile, respond to quotes, manage orders
  - Admin guide: managing users, shops, disputes

- `t86` Create API documentation
  - Swagger/OpenAPI spec
  - Authentication guide
  - Common error codes and responses

- `t87` Create developer guide
  - Local setup instructions
  - Project structure overview
  - How to extend recommendations algorithm
  - Testing and debugging guide

**Definition of Done:**
- ✅ All previous phases fully tested
- ✅ App deployed to production (Vercel + Railway)
- ✅ SSL/HTTPS enabled
- ✅ Performance metrics acceptable (API < 500ms, FCP < 2s)
- ✅ Security audit passed
- ✅ Monitoring and error tracking enabled
- ✅ Documentation complete
- ✅ Ready for user launch

---

## Task Summary by Phase

| Phase | Tasks | Status |
|-------|-------|--------|
| 0: Bootstrap | t00-t04 | Complete |
| 1: Database | t05-t08 | Complete |
| 2: CAD Analysis | t09-t13 | Complete |
| 3: Marketplace | t14-t17 | Complete |
| 4: Quoting | t18-t22 | Complete |
| 5: Communication | t23-t26 | Complete |
| 6: Payments | t27-t30 | Complete |
| 7: Notifications | t31-t33 | Complete |
| 8: Classification | t34-t44 | Complete |
| 9: Recommendations | t45-t52 | Complete |
| 10: Maps | t53-t65 | Complete |
| 11: External Search | t66-t72 | Complete |
| **12: Deployment** | **t73-t87** | **IN PROGRESS** |

---

## Key Milestones

- **After Phase 8:** CAD files automatically classified with materials detected
- **After Phase 9:** Smart shop recommendations based on design + materials + location
- **After Phase 10:** Beautiful map-based shop discovery experience
- **After Phase 11:** Complete supply chain visibility (material suppliers + manufacturers)
- **After Phase 12:** Production-ready, deployed app ready for users

---

## Workflow & Git Strategy

Each task (`tXX`) should result in a direct commit to main:

```bash
# ... work on t34 ...
git add .
git commit -m "feat: t34 - Design classifier from CAD geometry"
git push origin main
```

**Commit Checklist:**
- [ ] Code follows style guide
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No console.log/debug code left
- [ ] Project builds successfully

---

## Notes

- **Phases 0-7** are the MVP foundation (already done/in progress)
- **Phases 8-11** are the algorithmic enhancements (the "complex computing" components)
- **Phase 12** deployment moved to final as requested
- **Phase 11 is optional** — only if time permits after Phase 10
- Team should aim for **1 phase per week** for Phases 8-10
- Phase 11 can be quick (2-3 days) if using well-documented APIs
- Phase 12 should budget **1 full week** for thorough testing + deployment

---

**Last Updated:** 2026-05-15
**Next Review:** Weekly team standup
**Version:** 1.2 (Extended with Algorithmic Phases)
