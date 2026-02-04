-- Execute this in Supabase SQL Editor to DISABLE RLS for testing
-- This fixes "Infinite Loading" if the cause is permission denied on empty tables

ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE click_logs DISABLE ROW LEVEL SECURITY;
