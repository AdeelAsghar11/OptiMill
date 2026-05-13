-- OPTIMILL DATABASE SCHEMA v1.0 (Aligned with PRD/TRD)

-- 1. PROFILES (Extends Supabase auth.users)
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

-- 2. SHOP PROFILES
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

-- 3. CAD FILE UPLOADS + ANALYSIS
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

-- 4. QUOTE REQUESTS
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

-- 5. QUOTES (shop response)
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

-- 6. ORDERS
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

-- 7. LIVE CHAT MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  file_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MEETINGS
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

-- 9. REVIEWS
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

-- 10. NOTIFICATIONS
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

-- Row-Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile edit" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shops are public" ON shops FOR SELECT USING (true);
CREATE POLICY "Owners can manage shops" ON shops FOR ALL USING (owner_id = auth.uid());

ALTER TABLE cad_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own files" ON cad_files FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Clients can upload own files" ON cad_files FOR INSERT WITH CHECK (client_id = auth.uid());

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
