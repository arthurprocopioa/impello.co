-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create specific ENUM types for better data integrity
CREATE TYPE contact_source AS ENUM ('META', 'GOOGLE', 'DIRECT');
CREATE TYPE funnel_status AS ENUM ('PENDING', 'OPEN', 'RESOLVED');
CREATE TYPE message_direction AS ENUM ('IN', 'OUT');
CREATE TYPE message_status AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- Function to handle updated_at timestamps automatically
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. TENANTS TABLE
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  business_hours JSONB DEFAULT '{}'::JSONB, -- e.g. {"mon": ["09:00", "18:00"]}
  evolution_config JSONB DEFAULT '{}'::JSONB, -- API keys, Instance ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_tenants_slug ON tenants(slug);

-- 2. CONTACTS TABLE (Leads/Customers)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  phone TEXT NOT NULL,
  name TEXT,
  profile_pic TEXT,
  
  -- Attribution Data
  last_source contact_source DEFAULT 'DIRECT',
  latest_fbclid TEXT,
  latest_gclid TEXT,
  last_click_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- CRM Status
  funnel_status funnel_status DEFAULT 'PENDING',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique contact per tenant
  UNIQUE(tenant_id, phone)
);
CREATE INDEX idx_contacts_tenant_phone ON contacts(tenant_id, phone);
CREATE INDEX idx_contacts_tenant_updated ON contacts(tenant_id, updated_at DESC);

-- 3. MESSAGES TABLE
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  direction message_direction NOT NULL,
  content TEXT,
  status message_status DEFAULT 'SENT',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- High frequency query index: fetching chat history
CREATE INDEX idx_messages_contact_created ON messages(contact_id, created_at ASC);

-- 4. ORDERS TABLE ("The Pulse" conversions)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  
  amount DECIMAL(10, 2) NOT NULL,
  platform_source contact_source, -- Copied from contact at moment of sale
  
  -- Sync Status
  sent_to_capi BOOLEAN DEFAULT FALSE,
  sent_to_google BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_orders_tenant_created ON orders(tenant_id, created_at DESC);

-- 5. CLICK LOGS (Deep Attribution tracking)
CREATE TABLE click_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  ip TEXT,
  user_agent TEXT,
  fbclid TEXT,
  gclid TEXT,
  url_params JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_click_logs_tenant_ip ON click_logs(tenant_id, ip);

-- 6. AUTOMATION (Follow-ups)
CREATE TABLE followup_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE followup_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES followup_sequences(id) ON DELETE CASCADE NOT NULL,
  delay_minutes INTEGER NOT NULL, -- Delay after previous step/trigger
  message_content TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRIGGERS FOR UPDATED_AT
CREATE TRIGGER set_timestamp_tenants BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_contacts BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_messages BEFORE UPDATE ON messages FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_logs BEFORE UPDATE ON click_logs FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- RLS (ROW LEVEL SECURITY) SETUP
-- We enable RLS on all tables. 
-- For MVP, we presume there's a mechanism to link auth.uid() to a tenant.
-- Below is a generic template assuming a future 'profiles' table or similar logic.

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_logs ENABLE ROW LEVEL SECURITY;

-- EXAMPLE POLICY (Commented out until Auth linkage is implemented)
-- CREATE POLICY "Users can view their own tenant data" ON contacts
-- FOR ALL
-- USING (tenant_id IN (
--   SELECT tenant_id FROM public.users_tenants WHERE user_id = auth.uid()
-- ));
