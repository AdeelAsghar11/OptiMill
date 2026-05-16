-- OPTIMILL Security Hardening: RLS Policies
-- Ensuring all tables have proper security policies

-- 1. User Locations
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_locations' AND policyname = 'Users can manage own location') THEN
    CREATE POLICY "Users can manage own location" ON user_locations FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- 2. Meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meetings' AND policyname = 'Users can view relevant meetings') THEN
    CREATE POLICY "Users can view relevant meetings" ON meetings FOR SELECT USING (
      client_id = auth.uid() OR 
      shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()) OR
      host_id = auth.uid()
    );
  END IF;
END $$;

-- 3. Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews are public') THEN
    CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Clients can create reviews for their orders') THEN
    CREATE POLICY "Clients can create reviews for their orders" ON reviews FOR INSERT WITH CHECK (
      reviewer_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_id AND orders.client_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 4. Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;
