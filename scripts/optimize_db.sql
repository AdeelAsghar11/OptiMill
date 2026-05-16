-- OPTIMILL Performance Optimization: Indexing
-- Adding indexes for frequently queried foreign keys and RLS filters

-- Profiles & Shops
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_verified ON shops(verified) WHERE verified = TRUE;

-- CAD Files
CREATE INDEX IF NOT EXISTS idx_cad_files_client_id ON cad_files(client_id);
CREATE INDEX IF NOT EXISTS idx_cad_files_status ON cad_files(status);

-- Quote Requests
CREATE INDEX IF NOT EXISTS idx_quote_requests_cad_file_id ON quote_requests(cad_file_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_client_id ON quote_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_shop_id ON quote_requests(shop_id);

-- Quotes
CREATE INDEX IF NOT EXISTS idx_quotes_request_id ON quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_shop_id ON quotes(shop_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_cad_file_id ON orders(cad_file_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;

-- AI Classification & Materials
CREATE INDEX IF NOT EXISTS idx_design_classifications_cad_file_id ON design_classifications(cad_file_id);
CREATE INDEX IF NOT EXISTS idx_material_requirements_cad_file_id ON material_requirements(cad_file_id);
