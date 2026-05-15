-- OPTIMILL DATABASE SCHEMA v1.0 (Aligned with PRD/TRD)

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('client', 'shop', 'admin')) NOT NULL DEFAULT 'client',
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHOP PROFILES
CREATE TABLE IF NOT EXISTS shops (
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

-- ADDED FOR PHASE 10: GEOSPATIAL SUPPORT
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);
CREATE INDEX IF NOT EXISTS idx_shop_location ON shops USING GIST (location);

-- Store user location for recommendation context
CREATE TABLE IF NOT EXISTS user_locations (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- 3. CAD FILE UPLOADS + ANALYSIS
CREATE TABLE IF NOT EXISTS cad_files (
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

-- 4. QUOTE REQUESTS
CREATE TABLE IF NOT EXISTS quote_requests (
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

-- 5. QUOTES (shop response)
CREATE TABLE IF NOT EXISTS quotes (
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

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
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

-- 7. LIVE CHAT MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  file_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MEETINGS
CREATE TABLE IF NOT EXISTS meetings (
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

-- 9. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  shop_id UUID REFERENCES shops(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (order_id, reviewer_id)
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,       -- quote_received | order_placed | message | meeting | payment
  title TEXT,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles') THEN
    CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Own profile edit') THEN
    CREATE POLICY "Own profile edit" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shops' AND policyname = 'Shops are public') THEN
    CREATE POLICY "Shops are public" ON shops FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shops' AND policyname = 'Owners can manage shops') THEN
    CREATE POLICY "Owners can manage shops" ON shops FOR ALL USING (owner_id = auth.uid());
  END IF;
END $$;

ALTER TABLE cad_files ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cad_files' AND policyname = 'Clients can view own files') THEN
    CREATE POLICY "Clients can view own files" ON cad_files FOR SELECT USING (client_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cad_files' AND policyname = 'Clients can upload own files') THEN
    CREATE POLICY "Clients can upload own files" ON cad_files FOR INSERT WITH CHECK (client_id = auth.uid());
  END IF;
END $$;

-- DB trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 11. DESIGN CLASSIFICATIONS (Extended analysis)
CREATE TABLE IF NOT EXISTS design_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
  design_type TEXT,
  design_category TEXT,
  confidence_score NUMERIC,
  geometric_features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MATERIAL REQUIREMENTS (AI-inferred for a specific design)
CREATE TABLE IF NOT EXISTS material_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
  material_name TEXT,
  material_category TEXT,
  estimated_quantity NUMERIC,
  unit TEXT,
  priority TEXT,
  supplier_type TEXT,
  inference_confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. DESIGN MATERIAL MAPPINGS (Knowledge base)
CREATE TABLE IF NOT EXISTS design_material_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_type TEXT,
  material_name TEXT,
  typical_quantity_range TEXT,
  use_case TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (design_type, material_name)
);

-- 14. RECOMMENDATION SCORES
CREATE TABLE IF NOT EXISTS recommendation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  total_score NUMERIC,
  match_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cad_file_id, shop_id)
);

-- Row-Level Security for new tables
ALTER TABLE design_classifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'design_classifications' AND policyname = 'Public classifications') THEN
    CREATE POLICY "Public classifications" ON design_classifications FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE material_requirements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'material_requirements' AND policyname = 'Public materials') THEN
    CREATE POLICY "Public materials" ON material_requirements FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE design_material_mappings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'design_material_mappings' AND policyname = 'Public mappings') THEN
    CREATE POLICY "Public mappings" ON design_material_mappings FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE recommendation_scores ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recommendation_scores' AND policyname = 'Public scores') THEN
    CREATE POLICY "Public scores" ON recommendation_scores FOR SELECT USING (true);
  END IF;
END $$;

-- 15. EXTERNAL SUPPLIERS (Cached from external APIs)
CREATE TABLE IF NOT EXISTS external_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE,  -- e.g., "osm:12345"
  supplier_name VARCHAR(255),
  supplier_type VARCHAR(100),       -- timber_supplier, metal_supplier, etc.
  address TEXT,
  latitude FLOAT,
  longitude FLOAT,
  phone VARCHAR(20),
  website VARCHAR(255),
  rating FLOAT DEFAULT 4.0,
  review_count INTEGER DEFAULT 0,
  api_source VARCHAR(50),           -- openstreetmap, google_places, etc.
  material_categories TEXT[],       -- ['wood', 'metal', 'fabric']
  last_cached TIMESTAMP DEFAULT NOW()
);

ALTER TABLE external_suppliers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'external_suppliers' AND policyname = 'Public external suppliers') THEN
    CREATE POLICY "Public external suppliers" ON external_suppliers FOR SELECT USING (true);
  END IF;
END $$;
