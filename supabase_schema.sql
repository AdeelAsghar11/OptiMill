-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'workshop', 'admin');
CREATE TYPE machine_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE order_status AS ENUM (
    'draft', 'submitted', 'under_analysis', 'rejected', 'quoted', 
    'accepted', 'expired', 'scheduled', 'in_production', 
    'quality_check', 'completed', 'delivered'
);

-- Users table (Extends Supabase Auth users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workshops table
CREATE TABLE workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    city TEXT NOT NULL,
    rating FLOAT DEFAULT 0,
    reliability_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machines table
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    machine_type TEXT NOT NULL,
    max_dim_x FLOAT NOT NULL,
    max_dim_y FLOAT NOT NULL,
    max_dim_z FLOAT NOT NULL,
    precision_mm FLOAT NOT NULL,
    hourly_rate FLOAT NOT NULL,
    status machine_status DEFAULT 'active'
);

-- Materials table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    unit_cost FLOAT NOT NULL,
    availability BOOLEAN DEFAULT TRUE
);

-- Workshop Materials (Join table)
CREATE TABLE workshop_materials (
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    PRIMARY KEY (workshop_id, material_id)
);

-- Product Requests (Orders)
CREATE TABLE product_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id),
    quantity INTEGER NOT NULL,
    material TEXT NOT NULL,
    process_type TEXT NOT NULL,
    dim_x FLOAT NOT NULL,
    dim_y FLOAT NOT NULL,
    dim_z FLOAT NOT NULL,
    tolerance_mm FLOAT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    urgency urgency_level DEFAULT 'medium',
    status order_status DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manufacturability Reports
CREATE TABLE manufacturability_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES product_requests(id) ON DELETE CASCADE,
    is_manufacturable BOOLEAN NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb
);

-- Quotations
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES product_requests(id) ON DELETE CASCADE,
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    material_cost FLOAT NOT NULL,
    machine_cost FLOAT NOT NULL,
    labor_cost FLOAT NOT NULL,
    urgency_multiplier FLOAT NOT NULL,
    risk_buffer FLOAT NOT NULL,
    logistics_cost FLOAT NOT NULL,
    platform_margin FLOAT NOT NULL,
    total_cost FLOAT NOT NULL,
    estimated_days INTEGER NOT NULL
);

-- Match Scores
CREATE TABLE match_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES product_requests(id) ON DELETE CASCADE,
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    capability_score FLOAT NOT NULL,
    capacity_score FLOAT NOT NULL,
    cost_score FLOAT NOT NULL,
    deadline_score FLOAT NOT NULL,
    quality_score FLOAT NOT NULL,
    location_score FLOAT NOT NULL,
    final_score FLOAT NOT NULL
);

-- Schedules
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES product_requests(id) ON DELETE CASCADE,
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'reserved'
);

-- Quality History
CREATE TABLE quality_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    defect_rate FLOAT DEFAULT 0,
    on_time_rate FLOAT DEFAULT 0,
    quality_score FLOAT DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Basic example)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);

-- Indexes for performance
CREATE INDEX idx_machines_workshop ON machines(workshop_id);
CREATE INDEX idx_orders_customer ON product_requests(customer_id);
CREATE INDEX idx_quotations_order ON quotations(request_id);
