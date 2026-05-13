# OptiMill — Product & Technical Requirements Document
**Version 1.0 | Cross-Platform CAD Marketplace**

---

## PART 1 — PRODUCT REQUIREMENTS DOCUMENT (PRD)

---

### 1. Product Overview

**OptiMill** is a cross-platform B2B/B2C marketplace where users upload CAD/3D design files, receive AI-powered cost analysis and feasibility reports, and are matched with nearby verified manufacturers, dealers, and machine shops — who can accept jobs, quote prices, conduct meetings, and process payments — all within one unified platform.

Think: **Alibaba × Upwork × Foodpanda**, purpose-built for the CNC, 3D printing, and fabrication industry.

---

### 2. Target Users

| Role | Description |
|---|---|
| **Client/User** | Engineers, designers, startups — upload CAD files, get quotes, hire shops |
| **Shop Master / Dealer** | CNC shops, 3D printing labs, fabricators — receive jobs, quote, transact |
| **Admin** | Platform operator — manages users, disputes, commissions, listings |

---

### 3. Core Features

#### 3.1 CAD File Analysis Engine
- Upload: `.stl`, `.step`, `.iges`, `.dxf`, `.obj`, `.3mf`, `.f3d`
- AI analysis outputs:
  - Material recommendations
  - Estimated machining/print time
  - Cost range (low / mid / high)
  - Feasibility score (0–100)
  - Complexity classification (simple / moderate / complex)
  - Suggested manufacturing process (CNC, FDM, SLA, laser cut, etc.)
- 3D viewer in-browser (Three.js based)

#### 3.2 Marketplace & Discovery
- Browse verified shops/dealers by:
  - Proximity (map view with radius filter)
  - Process capability (CNC, 3D print, welding, etc.)
  - Rating, price tier, turnaround time
  - Material specialization
- Each shop has a public profile page with:
  - Portfolio of past work
  - Machine list and capabilities
  - Verified badge, reviews, response rate
  - Pricing structure (per-hour / per-unit / quote-based)

#### 3.3 Shop Master Dashboard
- Incoming job requests queue
- Accept / Reject / Counter-quote workflow
- Client communication via live chat
- Order management (status: Received → In Progress → QA → Shipped)
- Invoice generation and payment collection
- Earnings analytics and payout history
- Meeting scheduler (calendar integration)

#### 3.4 Client Dashboard
- Upload history and analysis reports
- Active and past orders
- Quote comparison (side-by-side from multiple shops)
- Payment history and receipts
- Saved shops and favorites
- Dispute management

#### 3.5 Payments
- Escrow-based payment (funds held until job confirmed)
- Supported: Credit/Debit card, Bank transfer, JazzCash, EasyPaisa (for PK market)
- International: Stripe (cards), PayPal
- Platform commission: configurable % per transaction
- Automated invoicing and PDF receipt generation
- Refund and dispute workflow

#### 3.6 Communication Suite
- **Live Chat**: Real-time messaging per order thread
- **File sharing** in chat (design revisions, photos, documents)
- **Meeting Scheduler**: In-platform calendar, Google Meet/Zoom link generation
- **Email Notifications**: Triggered on quote received, payment, order status, meetings
- **Push Notifications**: Web and mobile

#### 3.7 Authentication & Security
- Email/password signup
- OAuth: Google, GitHub
- Role-based access control (Client / Shop / Admin)
- MFA (TOTP-based)
- JWT session tokens via Supabase Auth
- Row-Level Security (RLS) on all DB tables

---

### 4. User Flows

#### Client Flow
```
Register → Upload CAD File → View AI Analysis Report
→ Browse Matched Shops → Request Quotes
→ Compare Quotes → Accept Quote → Pay (Escrow)
→ Track Order → Confirm Delivery → Release Payment → Review Shop
```

#### Shop Master Flow
```
Register & Verify → Set Up Profile (machines, capabilities, pricing)
→ Receive Job Requests → Review CAD + Analysis
→ Submit Quote / Accept → Chat with Client
→ Schedule Meeting (if needed) → Complete Job
→ Upload Proof of Work → Get Paid → View Earnings
```

---

### 5. Screens / Pages

| Screen | Access |
|---|---|
| Landing Page | Public |
| Sign Up / Login | Public |
| CAD Upload + Analysis Result | Client |
| Shop Discovery Map + List | Public/Client |
| Shop Public Profile | Public |
| Request Quote Form | Client |
| Quote Comparison Dashboard | Client |
| Order Tracking | Client + Shop |
| Live Chat (per Order) | Client + Shop |
| Meeting Scheduler | Client + Shop |
| Client Dashboard | Client |
| Shop Master Dashboard | Shop |
| Admin Panel | Admin |
| Payment / Checkout | Client |
| Earnings & Payout | Shop |
| Notifications Center | All |

---

### 6. Platform Support
- **Web**: React (Vite) — works on all browsers, all OS
- **Mobile**: Responsive PWA (installable on iOS & Android)
- **No native app required** — PWA covers cross-platform with offline support

---

## PART 2 — TECHNICAL REQUIREMENTS DOCUMENT (TRD)

---

### 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, TailwindCSS, shadcn/ui |
| 3D Viewer | Three.js + @react-three/fiber |
| Backend / API | Supabase (PostgreSQL + Edge Functions) |
| Auth | Supabase Auth (JWT + RLS) |
| File Storage | Supabase Storage (CAD files, images, docs) |
| AI Analysis | OpenAI API (GPT-4o) or Claude API |
| Real-time Chat | Supabase Realtime (WebSockets) |
| Payments | Stripe (international) + optional local gateway |
| Emails | Resend.com (transactional email) |
| Maps | Mapbox GL JS or Google Maps API |
| Scheduling | Cal.com embed or custom calendar |
| Hosting | Replit (dev) → Vercel / Railway (prod) |

---

### 2. Supabase Configuration

#### Connection Details
```
Host:     aws-1-ap-northeast-1.pooler.supabase.com
Port:     6543 (Transaction Pooler — IPv4 compatible)
Database: postgres
User:     postgres.zdjfyentspwnpuajgjzl
Pool Mode: Transaction (for serverless/edge functions)
```

#### Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=https://zdjfyentspwnpuajgjzl.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DATABASE_URL=postgresql://postgres.zdjfyentspwnpuajgjzl:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres

STRIPE_SECRET_KEY=<sk_live_...>
VITE_STRIPE_PUBLIC_KEY=<pk_live_...>

OPENAI_API_KEY=<your-openai-key>

RESEND_API_KEY=<your-resend-key>
FROM_EMAIL=noreply@optimill.io

VITE_MAPBOX_TOKEN=<your-mapbox-token>
```

#### Supabase Client Setup (`src/lib/supabase.js`)
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 }
    }
  }
)
```

---

### 3. Database Schema

```sql
-- USERS (extended Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('client', 'shop', 'admin')) NOT NULL DEFAULT 'client',
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHOP PROFILES
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  capabilities TEXT[],            -- ['cnc', '3d_print', 'laser_cut', ...]
  materials TEXT[],               -- ['aluminum', 'pla', 'steel', ...]
  hourly_rate NUMERIC,
  min_order NUMERIC,
  turnaround_days INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAD FILE UPLOADS + ANALYSIS
CREATE TABLE cad_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  analysis JSONB,                 -- AI-generated analysis result
  feasibility_score INTEGER,
  estimated_cost_low NUMERIC,
  estimated_cost_high NUMERIC,
  process_recommendation TEXT,
  status TEXT DEFAULT 'pending',  -- pending | analyzed | quoted | ordered
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTE REQUESTS
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id),
  shop_id UUID REFERENCES shops(id),
  message TEXT,
  quantity INTEGER DEFAULT 1,
  deadline DATE,
  status TEXT DEFAULT 'pending',  -- pending | quoted | accepted | rejected | expired
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTES (shop response)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES quote_requests(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id),
  client_id UUID REFERENCES profiles(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  delivery_days INTEGER,
  valid_until DATE,
  status TEXT DEFAULT 'pending',  -- pending | accepted | rejected | expired
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  client_id UUID REFERENCES profiles(id),
  shop_id UUID REFERENCES shops(id),
  cad_file_id UUID REFERENCES cad_files(id),
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC,
  status TEXT DEFAULT 'pending',  -- pending | paid | in_progress | qa | shipped | complete | disputed
  payment_intent_id TEXT,         -- Stripe PaymentIntent ID
  escrow_released BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- LIVE CHAT MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  file_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEETINGS
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  host_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES profiles(id),
  shop_id UUID REFERENCES shops(id),
  title TEXT,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 30,
  meet_link TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled | completed | cancelled
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  shop_id UUID REFERENCES shops(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (order_id, reviewer_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,       -- quote_received | order_placed | message | meeting | payment
  title TEXT,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Row-Level Security Policies
```sql
-- Profiles: users see own, shops are public-readable
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile edit" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Messages: only order participants
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order participants only" ON messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = messages.order_id
      AND (o.client_id = auth.uid() OR o.shop_id IN (
        SELECT id FROM shops WHERE owner_id = auth.uid()
      ))
    )
  );

-- CAD files: owner only
ALTER TABLE cad_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner only" ON cad_files FOR ALL USING (client_id = auth.uid());

-- Orders: client + shop
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order parties" ON orders FOR ALL
  USING (
    client_id = auth.uid() OR
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );
```

---

### 4. Authentication Setup

```javascript
// Register with role
const signUp = async (email, password, role) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { role }           // stored in auth.users.raw_user_meta_data
    }
  })
  // Profile auto-created via DB trigger
}

// DB trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### 5. CAD Analysis — Edge Function

```javascript
// supabase/functions/analyze-cad/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import OpenAI from 'npm:openai'

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

serve(async (req) => {
  const { fileUrl, fileName, fileType } = await req.json()

  const prompt = `
    You are a manufacturing cost estimator. Analyze this CAD file metadata:
    File: ${fileName}, Type: ${fileType}
    
    Respond ONLY in JSON:
    {
      "feasibility_score": 0-100,
      "complexity": "simple|moderate|complex",
      "recommended_process": "CNC|3D_FDM|3D_SLA|laser_cut|injection_mold",
      "materials": ["aluminum", "pla"],
      "estimated_cost_usd": { "low": 0, "mid": 0, "high": 0 },
      "estimated_hours": 0,
      "notes": "...",
      "warnings": []
    }
  `

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  })

  const analysis = JSON.parse(response.choices[0].message.content)
  return new Response(JSON.stringify(analysis), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### 6. Payments — Stripe Escrow Flow

```
Client pays → Stripe PaymentIntent created (capture_method: manual)
→ Funds authorized (held) → Order created in DB
→ Job completed → Client confirms → Platform calls stripe.paymentIntents.capture()
→ Platform fee deducted → Shop receives payout via Stripe Connect
```

```javascript
// Edge Function: create-payment-intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(totalAmount * 100),  // in cents
  currency: 'usd',
  capture_method: 'manual',              // escrow hold
  application_fee_amount: Math.round(platformFee * 100),
  transfer_data: { destination: shop.stripe_account_id },
  metadata: { order_id: orderId }
})
```

---

### 7. Real-time Chat

```javascript
// Subscribe to order messages
const channel = supabase
  .channel(`order:${orderId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `order_id=eq.${orderId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()

// Send message
const sendMessage = async (content) => {
  await supabase.from('messages').insert({
    order_id: orderId,
    sender_id: user.id,
    content
  })
}
```

---

### 8. Email Notifications (Resend)

```javascript
// Edge Function: send-email
import { Resend } from 'npm:resend'
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const emailTemplates = {
  quote_received: (data) => ({
    subject: `New Quote for Your Project — ${data.shopName}`,
    html: `<h2>You received a quote of $${data.amount}</h2>...`
  }),
  order_placed: (data) => ({
    subject: `Order Confirmed — #${data.orderId}`,
    html: `<h2>Your order is confirmed!</h2>...`
  }),
  payment_released: (data) => ({
    subject: `Payment Released — $${data.amount}`,
    html: `<h2>Your payment has been released.</h2>...`
  })
}

// Trigger from DB webhook or edge function
await resend.emails.send({
  from: 'OptiMill <noreply@optimill.io>',
  to: recipientEmail,
  ...emailTemplates[type](data)
})
```

---

### 9. File Structure

```
optimill/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Register, MFA
│   │   ├── cad/            # Uploader, Viewer, AnalysisReport
│   │   ├── marketplace/    # ShopCard, ShopMap, FilterBar
│   │   ├── chat/           # ChatWindow, MessageBubble, FileAttach
│   │   ├── payments/       # CheckoutForm, EscrowStatus
│   │   ├── dashboard/      # ClientDash, ShopDash, AdminPanel
│   │   └── meetings/       # Scheduler, MeetingCard
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Auth.jsx
│   │   ├── Upload.jsx
│   │   ├── Marketplace.jsx
│   │   ├── ShopProfile.jsx
│   │   ├── Order.jsx
│   │   ├── Dashboard.jsx
│   │   └── Admin.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── stripe.js
│   │   └── api.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useChat.js
│   │   └── useOrders.js
│   └── stores/             # Zustand global state
├── supabase/
│   ├── functions/
│   │   ├── analyze-cad/
│   │   ├── create-payment/
│   │   ├── release-payment/
│   │   └── send-email/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
├── .env
├── vite.config.js
└── package.json
```

---

### 10. Replit Prompt (Ready to Paste)

> **Paste this verbatim into Replit Agent:**

---

```
Build a cross-platform web marketplace called OptiMill using React + Vite + TailwindCSS + Supabase.

PROJECT PURPOSE:
OptiMill is a B2B/B2C marketplace where clients upload CAD/3D design files (.stl, .step, .dxf, .obj), receive AI-powered cost analysis and feasibility reports, then get matched with nearby verified manufacturers and machine shops. Shops receive job requests, submit quotes, chat with clients, schedule meetings, and get paid via escrow.

SUPABASE CONFIG:
- URL: https://zdjfyentspwnpuajgjzl.supabase.co
- Use anon key from Supabase dashboard
- DB connection: aws-1-ap-northeast-1.pooler.supabase.com:6543 (Transaction Pooler)
- Enable Row-Level Security on all tables
- Auth: email/password + Google OAuth, with role field (client / shop / admin)

DATABASE TABLES TO CREATE:
profiles, shops, cad_files, quote_requests, quotes, orders, messages, meetings, reviews, notifications
(Schema as defined in TRD v1.0)

PAGES TO BUILD:
1. Landing Page — hero, how it works, featured shops
2. Auth Page — signup/login with role selection (client or shop)
3. Upload Page — drag-drop CAD file upload, 3D preview (Three.js), AI analysis result card
4. Marketplace Page — shop listings with map (Mapbox), filters by process/material/rating/distance
5. Shop Profile Page — portfolio, capabilities, reviews, request quote button
6. Quote Dashboard — client sees all quotes side-by-side, accept/reject
7. Order Page — status tracker, live chat panel, meeting scheduler, file sharing
8. Client Dashboard — uploads, orders, payments, notifications
9. Shop Dashboard — incoming requests, active orders, earnings, calendar, payout
10. Admin Panel — users, shops, disputes, commission settings

KEY FEATURES:
- Real-time chat using Supabase Realtime on each order thread
- Stripe escrow payments (manual capture, release on delivery confirmation)
- Email notifications via Resend on every key event
- Google Meet link generation for meetings
- PWA manifest for mobile installability
- Role-based routing (client/shop/admin see different dashboards)
- Notification bell with unread count

TECH CHOICES:
- React 18 + Vite (NOT Next.js — Replit compatibility)
- TailwindCSS + shadcn/ui components
- Three.js via @react-three/fiber for 3D preview
- Supabase JS SDK v2
- Stripe.js for payments
- Zustand for global state
- React Router v6 for routing
- Mapbox GL JS for shop map

START BY:
1. Setting up Vite + React project with TailwindCSS
2. Installing: @supabase/supabase-js, stripe, @stripe/react-stripe-js, three, @react-three/fiber, zustand, react-router-dom, mapbox-gl, lucide-react
3. Creating supabase.js client config
4. Creating DB migration SQL file with full schema
5. Building Auth page with Supabase Auth
6. Then build each page in order listed above

All pages must be mobile-responsive. Use a clean, professional dark-accent design (slate + indigo color palette).
```

---

### 11. Execution Checklist

- [ ] Create Replit project (React + Vite template)
- [ ] Paste prompt into Replit Agent
- [ ] Add all `.env` variables in Replit Secrets tab
- [ ] Run Supabase migration SQL in Supabase SQL Editor
- [ ] Enable Google OAuth in Supabase Auth Providers
- [ ] Set up Stripe account + Connect for shop payouts
- [ ] Set up Resend account, verify sender domain
- [ ] Deploy Supabase Edge Functions (`supabase functions deploy`)
- [ ] Test CAD upload → analysis → quote → payment flow end-to-end
- [ ] Configure Supabase Storage bucket policies (public read for shop avatars, private for CAD files)
- [ ] Add PWA manifest and service worker for mobile install

---

*OptiMill PRD + TRD v1.0 — Ready for Replit Execution*
