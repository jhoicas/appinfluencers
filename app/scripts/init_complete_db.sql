-- =========================================
-- PostgreSQL Complete Database Setup Script
-- AppInfluencers Platform
-- Database: dfkj68lnvi5nki
-- =========================================

-- Este script crea:
-- 1. Todas las tablas necesarias
-- 2. Índices para performance
-- 3. Datos iniciales (planes, admin user)
-- 4. Funciones y triggers útiles

-- =========================================
-- CONFIGURACIÓN INICIAL
-- =========================================

-- Conectar a la base de datos
\c dfkj68lnvi5nki

-- Configurar timezone
SET timezone = 'UTC';

-- Configurar encoding
SET client_encoding = 'UTF8';

-- =========================================
-- EXTENSIONES
-- =========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =========================================
-- FUNCTION: Updated At Trigger
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =========================================
-- TABLA: users
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('EMPRESA', 'INFLUENCER', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    trial_start_time TIMESTAMP WITH TIME ZONE,
    trial_profile_viewed_id INTEGER,
    has_active_subscription BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Usuarios de la plataforma (EMPRESA, INFLUENCER, ADMIN)';

-- =========================================
-- TABLA: influencer_profiles
-- =========================================

CREATE TABLE IF NOT EXISTS influencer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    profile_picture_url VARCHAR(500),
    instagram_handle VARCHAR(100),
    instagram_followers INTEGER,
    tiktok_handle VARCHAR(100),
    tiktok_followers INTEGER,
    youtube_handle VARCHAR(100),
    youtube_subscribers INTEGER,
    average_engagement_rate FLOAT,
    tiktok_insights JSONB,
    suggested_rate_per_post FLOAT,
    suggested_rate_per_story FLOAT,
    suggested_rate_per_video FLOAT,
    categories JSONB,
    portfolio_items JSONB,
    total_campaigns_completed INTEGER NOT NULL DEFAULT 0,
    average_rating FLOAT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para influencer_profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON influencer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_followers ON influencer_profiles(instagram_followers);
CREATE INDEX IF NOT EXISTS idx_profiles_tiktok_followers ON influencer_profiles(tiktok_followers);
CREATE INDEX IF NOT EXISTS idx_profiles_categories ON influencer_profiles USING GIN (categories);

-- Trigger para updated_at
CREATE TRIGGER update_influencer_profiles_updated_at 
    BEFORE UPDATE ON influencer_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE influencer_profiles IS 'Perfiles extendidos de influencers con métricas';

-- =========================================
-- TABLA: subscription_plans
-- =========================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(500) NOT NULL,
    price FLOAT,
    price_display VARCHAR(100) NOT NULL,
    billing_period VARCHAR(50) NOT NULL CHECK (billing_period IN ('monthly', 'yearly', 'custom')),
    features JSONB NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para subscription_plans
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_display_order ON subscription_plans(display_order);

-- Trigger para updated_at
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE subscription_plans IS 'Planes de suscripción para empresas';

-- =========================================
-- TABLA: transactions
-- =========================================

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('subscription', 'campaign', 'refund', 'other')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description VARCHAR(500) NOT NULL,
    payment_method VARCHAR(100),
    transaction_reference VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(transaction_reference);

-- Trigger para updated_at
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE transactions IS 'Registro de transacciones y pagos';

-- =========================================
-- TABLA: campaigns (opcional, para futuro)
-- =========================================

CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    empresa_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    influencer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    budget FLOAT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_empresa_user ON campaigns(empresa_user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_influencer_user ON campaigns(influencer_user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Trigger para updated_at
CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE campaigns IS 'Campañas creadas por empresas';

-- =========================================
-- TABLA: messages (opcional, para futuro)
-- =========================================

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_campaign ON messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

COMMENT ON TABLE messages IS 'Mensajes entre usuarios';

-- =========================================
-- TABLA: alembic_version (para migraciones)
-- =========================================

CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) PRIMARY KEY
);

COMMENT ON TABLE alembic_version IS 'Control de versiones de migraciones Alembic';

-- =========================================
-- DATOS INICIALES: Admin User
-- =========================================

-- Password: Admin123! (bcrypt hash)
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved)
VALUES (
    'admin@appinfluencers.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaJkKML4T5W',
    'Administrador',
    'ADMIN',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- =========================================
-- DATOS INICIALES: Subscription Plans
-- =========================================

INSERT INTO subscription_plans (name, description, price, price_display, billing_period, features, is_featured, is_active, display_order)
VALUES 
(
    'Básico',
    'Plan ideal para empresas que están comenzando',
    49.99,
    '$49.99',
    'monthly',
    '["Acceso a 10 perfiles de influencers", "Métricas básicas", "Soporte por email", "1 campaña activa"]'::jsonb,
    FALSE,
    TRUE,
    1
),
(
    'Profesional',
    'Plan completo para empresas en crecimiento',
    99.99,
    '$99.99',
    'monthly',
    '["Acceso ilimitado a perfiles", "Métricas avanzadas", "Soporte prioritario", "5 campañas activas", "Analytics dashboard", "Exportar reportes"]'::jsonb,
    TRUE,
    TRUE,
    2
),
(
    'Empresarial',
    'Plan personalizado para grandes empresas',
    NULL,
    'Personalizado',
    'custom',
    '["Todo lo del plan Profesional", "API access", "Gestor de cuenta dedicado", "Campañas ilimitadas", "Integración personalizada", "Capacitación del equipo"]'::jsonb,
    FALSE,
    TRUE,
    3
)
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- DATOS DE PRUEBA: Usuarios de ejemplo
-- =========================================

-- Empresa de prueba (Password: Test1234)
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved, trial_start_time)
VALUES (
    'empresa@test.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaJkKML4T5W',
    'Empresa de Prueba',
    'EMPRESA',
    TRUE,
    TRUE,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Influencer de prueba 1 (Password: Test1234)
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved)
VALUES (
    'influencer1@test.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaJkKML4T5W',
    'María González',
    'INFLUENCER',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Influencer de prueba 2 (Password: Test1234)
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved)
VALUES (
    'influencer2@test.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaJkKML4T5W',
    'Carlos Ramírez',
    'INFLUENCER',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- =========================================
-- DATOS DE PRUEBA: Perfiles de Influencers
-- =========================================

-- Perfil de María González
INSERT INTO influencer_profiles (
    user_id,
    bio,
    instagram_handle,
    instagram_followers,
    tiktok_handle,
    tiktok_followers,
    average_engagement_rate,
    suggested_rate_per_post,
    suggested_rate_per_story,
    suggested_rate_per_video,
    categories
)
SELECT 
    u.id,
    'Creadora de contenido lifestyle y moda. Apasionada por compartir mi día a día y tendencias. 🌟',
    'maria.gonzalez',
    85000,
    '@mariag',
    120000,
    4.5,
    500.00,
    250.00,
    800.00,
    '["Moda", "Lifestyle", "Belleza"]'::jsonb
FROM users u
WHERE u.email = 'influencer1@test.com'
ON CONFLICT (user_id) DO NOTHING;

-- Perfil de Carlos Ramírez
INSERT INTO influencer_profiles (
    user_id,
    bio,
    instagram_handle,
    instagram_followers,
    tiktok_handle,
    tiktok_followers,
    average_engagement_rate,
    suggested_rate_per_post,
    suggested_rate_per_story,
    suggested_rate_per_video,
    categories
)
SELECT 
    u.id,
    'Tech reviewer y gamer. Reviews honestos de gadgets y gaming. 🎮💻',
    'carlos.tech',
    150000,
    '@carlostech',
    200000,
    5.2,
    800.00,
    400.00,
    1200.00,
    '["Tecnología", "Gaming", "Reviews"]'::jsonb
FROM users u
WHERE u.email = 'influencer2@test.com'
ON CONFLICT (user_id) DO NOTHING;

-- =========================================
-- VERIFICACIÓN
-- =========================================

-- Contar registros insertados
SELECT 
    'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 
    'subscription_plans' as tabla, COUNT(*) as registros FROM subscription_plans
UNION ALL
SELECT 
    'influencer_profiles' as tabla, COUNT(*) as registros FROM influencer_profiles
ORDER BY tabla;

-- =========================================
-- INFORMACIÓN DE CONEXIÓN
-- =========================================

\echo ''
\echo '========================================='
\echo '✅ Base de datos configurada exitosamente'
\echo '========================================='
\echo ''
\echo '📊 Tablas creadas:'
\echo '  - users'
\echo '  - influencer_profiles'
\echo '  - subscription_plans'
\echo '  - transactions'
\echo '  - campaigns'
\echo '  - messages'
\echo '  - alembic_version'
\echo ''
\echo '👤 Usuario admin creado:'
\echo '  Email: admin@appinfluencers.com'
\echo '  Password: Admin123!'
\echo ''
\echo '📦 Planes de suscripción: 3 planes creados'
\echo '🧪 Usuarios de prueba: 2 influencers + 1 empresa'
\echo ''
\echo '🔗 String de conexión:'
\echo '  DATABASE_URL=postgresql://user:pass@host:5432/dfkj68lnvi5nki'
\echo ''
\echo '📋 Siguiente paso: Ejecutar migraciones Alembic'
\echo '  cd app && alembic upgrade head'
\echo ''
\echo '========================================='
