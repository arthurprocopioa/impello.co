-- CLEANUP (Optional: remove previous data to avoid duplicates if run multiple times)
-- TRUNCATE TABLE messages, contacts, tenants CASCADE;

-- 1. INSERT TENANT
-- We use a fixed UUID so we can reference it easily below
INSERT INTO tenants (id, name, slug, business_hours, evolution_config)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Impello Demo Store',
    'demo-store',
    '{"business_hours": "09:00-18:00"}',
    '{"phone": "5511999999999"}'
)
ON CONFLICT (id) DO NOTHING; -- Avoid errors on re-run

-- 2. INSERT CONTACTS

-- Contact A: META Buyer (Joana Meta)
INSERT INTO contacts (id, tenant_id, phone, name, last_source, latest_fbclid, funnel_status, last_click_at)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Tenant ID
    '5511988881111',
    'Joana Meta',
    'META',
    'fb.1.123456789.abcdef',
    'OPEN',
    NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Contact B: GOOGLE Buyer (Carlos Google)
INSERT INTO contacts (id, tenant_id, phone, name, last_source, latest_gclid, funnel_status, last_click_at)
VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '5511988882222',
    'Carlos Google',
    'GOOGLE',
    'Cj0KEQjwkNcBRCur...',
    'PENDING',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Contact C: Direct/Null (Pedro Curioso)
INSERT INTO contacts (id, tenant_id, phone, name, last_source, funnel_status, last_click_at)
VALUES (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '5511988883333',
    'Pedro Curioso',
    'DIRECT',
    'PENDING',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;


-- 3. INSERT MESSAGES

-- Conversation for Joana Meta (Contact A) - 5 Messages
INSERT INTO messages (tenant_id, contact_id, direction, content, status, created_at)
VALUES
    -- Msg 1 (Inbound)
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'IN', 'Olá, vi o anúncio no Instagram!', 'READ', NOW() - INTERVAL '2 hours' + INTERVAL '1 minute'),
    
    -- Msg 2 (Outbound)
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'OUT', 'Olá Joana! Tudo bem? Temos uma promoção hoje.', 'READ', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),

    -- Msg 3 (Inbound)
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'IN', 'Quanto custa o serviço completo?', 'READ', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes'),

    -- Msg 4 (Outbound)
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'OUT', 'Sai por R$ 150,00 no Pix.', 'DELIVERED', NOW() - INTERVAL '2 hours' + INTERVAL '6 minutes'),

    -- Msg 5 (Inbound)
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'IN', 'Vou querer! Pode agendar.', 'SENT', NOW() - INTERVAL '2 hours' + INTERVAL '10 minutes');


-- Conversation for Carlos Google (Contact B) - 1 Recent Message
INSERT INTO messages (tenant_id, contact_id, direction, content, status, created_at)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'IN', 'Vocês abrem aos sábados? Achei no Google.', 'SENT', NOW() - INTERVAL '10 minutes');

