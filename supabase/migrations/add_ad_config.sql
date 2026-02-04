-- Migration to add ad_config column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS ad_config JSONB DEFAULT '{}'::jsonb;
