# OptiMill: AI-Powered Manufacturing Orchestration

OptiMill is a high-fidelity Manufacturing-as-a-Service (MaaS) platform designed to bridge the gap between engineering designers and fabrication shops. It transforms complex CAD assets into actionable manufacturing intelligence through geometric analysis and deterministic cost modeling.

## 🚀 Project Perspective

### What is OptiMill?
OptiMill is a premium marketplace and orchestration engine for the manufacturing industry. It moves beyond simple directory listings by providing deep technical insights into 3D designs, allowing clients to understand the manufacturability of their parts before they even contact a supplier.

### What does it do?
- **Geometric Feature Extraction**: Analyzes uploaded 3D files (.stl, .step, .obj) to infer material categories, part volume, and geometric complexity.
- **Instant Feasibility Scoring**: Generates a 0-100 score indicating how "ready" a design is for specific fabrication processes (e.g., CNC Milling, 3D Printing).
- **Smart Cost Estimation**: Provides deterministic cost ranges based on inferred material requirements and regional fabrication standard rates.
- **Geospatial Discovery**: A dual-interface search (List & Map) that connects clients with verified nearby shops using Haversine-based distance calculations.
- **End-to-End Orchestration**: Manages the complete lifecycle from CAD analysis and quote comparison to production tracking and secure payment.

### How it Runs
OptiMill is built as a **Progressive Web App (PWA)**, ensuring a seamless experience across desktop and mobile devices.
- **Frontend**: Hosted on Vercel, leveraging Next.js App Router for high-performance server-side rendering and static generation.
- **Backend**: Hosted on Railway, utilizing FastAPI for high-throughput API endpoints and complex geometric calculations.
- **Realtime Updates**: Uses Supabase Realtime (WebSockets) to push instant notifications and order status changes to users without page refreshes.

### Tech Stack
- **Frontend**: Next.js 15+ (App Router), TypeScript, Framer Motion (Animations), Leaflet (Geospatial Maps), Lucide (Iconography).
- **Backend**: Python 3.10+, FastAPI, Pydantic, SlowAPI (Rate Limiting).
- **Infrastructure**: Supabase (PostgreSQL, RLS Security, Auth, Storage), Redis (Caching).
- **Styling**: Pro Max UI Design System (Custom Glassmorphism, Modern Typography).

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase Account

### Backend Setup
1. `cd backend`
2. `pip install -r requirements.txt`
3. Configure `.env` with Supabase and Redis credentials.
4. `python3.10 -m uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Configure `.env.local` with `NEXT_PUBLIC_API_URL` and Supabase keys.
4. `npm run dev`

## 👥 The Team
The OptiMill project is developed by a dedicated team of engineers focused on high-precision manufacturing workflows:
- **Project Lead**: System Architecture & Core Logic
- **UI/UX Designer**: Frontend Engineering & HCI Optimization
- **Backend Engineer**: API Development & Geometric Analysis
- **DevOps Engineer**: Database Security (RLS) & Infrastructure

---
*OptiMill: Precision in Every Pixel, Perfection in Every Part.*
