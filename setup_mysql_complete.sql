-- ============================================================
-- SCRIPT COMPLETO DE INICIALIZACIÓN MYSQL
-- Plataforma de Influencers
-- Encoding: UTF-8 (utf8mb4)
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 1. CREAR BASE DE DATOS
-- ============================================================

DROP DATABASE IF EXISTS db_appinfluencers;
CREATE DATABASE db_appinfluencers 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE db_appinfluencers;

-- ============================================================
-- 2. CREAR TABLAS
-- ============================================================

-- Tabla: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('EMPRESA', 'INFLUENCER', 'ADMIN') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    trial_start_time DATETIME(6) NULL,
    trial_profile_viewed_id INT NULL,
    has_active_subscription BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: influencer_profiles
CREATE TABLE influencer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    bio TEXT NULL,
    profile_picture_url VARCHAR(500) NULL,
    tiktok_handle VARCHAR(100) NULL,
    tiktok_followers INT NULL,
    youtube_handle VARCHAR(100) NULL,
    youtube_subscribers INT NULL,
    average_engagement_rate FLOAT NULL,
    tiktok_insights JSON NULL,
    suggested_rate_per_post FLOAT NULL,
    suggested_rate_per_story FLOAT NULL,
    suggested_rate_per_video FLOAT NULL,
    categories JSON NULL,
    portfolio_items JSON NULL,
    total_campaigns_completed INT NOT NULL DEFAULT 0,
    average_rating FLOAT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: campaigns
CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    influencer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    briefing TEXT NULL,
    proposed_budget FLOAT NOT NULL,
    final_budget FLOAT NULL,
    status ENUM('PENDIENTE', 'ACTIVA', 'NEGOCIACION', 'RECHAZADA', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    deliverables TEXT NULL,
    start_date DATETIME(6) NULL,
    end_date DATETIME(6) NULL,
    empresa_rating INT NULL,
    empresa_review TEXT NULL,
    influencer_rating INT NULL,
    influencer_review TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (empresa_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (influencer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_empresa_id (empresa_id),
    INDEX idx_influencer_id (influencer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(50) NULL,
    related_entity_id INT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    read_at DATETIME(6) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: messages
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    attachment_url VARCHAR(500) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    read_at DATETIME(6) NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: subscription_plans
CREATE TABLE subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price FLOAT NULL,
    price_display VARCHAR(100) NOT NULL,
    billing_period VARCHAR(50) NOT NULL,
    features JSON NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: subscriptions
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    monthly_fee FLOAT NOT NULL,
    stripe_subscription_id VARCHAR(255) NULL,
    stripe_customer_id VARCHAR(255) NULL,
    status ENUM('ACTIVA', 'CANCELADA', 'VENCIDA', 'EN_PERIODO_PRUEBA') NOT NULL DEFAULT 'ACTIVA',
    current_period_start DATETIME(6) NOT NULL,
    current_period_end DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    cancelled_at DATETIME(6) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: transactions
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount FLOAT NOT NULL,
    type ENUM('SUBSCRIPTION_PAYMENT', 'CAMPAIGN_PAYMENT', 'PAYOUT', 'REFUND') NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    description TEXT NOT NULL,
    payment_method VARCHAR(100) NULL,
    transaction_reference VARCHAR(255) NULL UNIQUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_transaction_reference (transaction_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. INSERTAR DATOS DE PRUEBA
-- ============================================================

-- 3.1 USUARIOS (password para todos: admin123)
-- Hash bcrypt: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC

-- Administradores
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved, created_at, updated_at) VALUES
('admin@influencers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Administrador Principal', 'ADMIN', TRUE, TRUE, NOW(), NOW()),
('soporte@influencers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Equipo de Soporte', 'ADMIN', TRUE, TRUE, NOW(), NOW());

-- Empresas
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved, trial_start_time, has_active_subscription, created_at, updated_at) VALUES
('empresa@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Empresa de Tecnología SAS', 'EMPRESA', TRUE, TRUE, NOW(), FALSE, NOW(), NOW()),
('marketing@ejemplo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Agencia de Marketing Digital', 'EMPRESA', TRUE, TRUE, NOW(), FALSE, NOW(), NOW()),
('startup@innovacion.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Startup Innovación México', 'EMPRESA', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY), FALSE, NOW(), NOW()),
('comercio@ecommerce.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'E-commerce Perú', 'EMPRESA', TRUE, TRUE, NOW(), TRUE, NOW(), NOW());

-- Influencers
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved, created_at, updated_at) VALUES
('gaby@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Gabriela Martínez', 'INFLUENCER', TRUE, TRUE, NOW(), NOW()),
('carlos@influencer.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Carlos Rodríguez', 'INFLUENCER', TRUE, TRUE, NOW(), NOW()),
('maria@beauty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'María José López', 'INFLUENCER', TRUE, TRUE, NOW(), NOW()),
('andres@fitness.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Andrés Pérez', 'INFLUENCER', TRUE, TRUE, NOW(), NOW()),
('sofia@lifestyle.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Sofía González', 'INFLUENCER', TRUE, TRUE, NOW(), NOW());

-- 3.2 PERFILES DE INFLUENCERS

INSERT INTO influencer_profiles (
    user_id, bio, tiktok_handle, tiktok_followers, youtube_handle, youtube_subscribers,
    average_engagement_rate, suggested_rate_per_post, suggested_rate_per_story, suggested_rate_per_video,
    categories, total_campaigns_completed, average_rating, created_at, updated_at
) VALUES
-- Gabriela Martínez (user_id: 7)
(7, 
 'Creadora de contenido especializada en moda y estilo de vida. 🌟 Más de 5 años conectando marcas con audiencias auténticas. Colaboraciones con marcas reconocidas internacionalmente.',
 '@gabymartinez', 125000, 'GabyMartinezVlogs', 45000,
 4.8, 2500.00, 1200.00, 4500.00,
 '["moda", "estilo de vida", "belleza", "viajes"]', 12, 4.9,
 NOW(), NOW()),

-- Carlos Rodríguez (user_id: 8)
(8,
 'Experto en tecnología y gadgets. 🔧 Reviews honestos y tutoriales prácticos. Ayudo a las personas a elegir la mejor tecnología para su estilo de vida.',
 '@carlostechreview', 156000, 'CarlosTechChannel', 234000,
 5.2, 3500.00, 1800.00, 6000.00,
 '["tecnología", "gadgets", "reviews", "educación"]', 18, 4.8,
 NOW(), NOW()),

-- María José López (user_id: 9)
(9,
 'Experta en belleza y cuidado personal. 💄 Maquilladora profesional certificada. Tutoriales, reseñas y tips para lucir radiante cada día.',
 '@mjbeautyofficial', 178000, NULL, NULL,
 6.1, 4500.00, 2000.00, 7000.00,
 '["belleza", "maquillaje", "skincare", "wellness"]', 15, 4.7,
 NOW(), NOW()),

-- Andrés Pérez (user_id: 10)
(10,
 'Fitness coach y nutricionista certificado. 💪 Transformo vidas a través del ejercicio y alimentación saludable. Rutinas, recetas y motivación diaria.',
 '@andresfitnesscoach', 267000, 'AndresFitnessTV', 123000,
 7.3, 3200.00, 1500.00, 5500.00,
 '["fitness", "nutrición", "salud", "motivación"]', 22, 4.9,
 NOW(), NOW()),

-- Sofía González (user_id: 11)
(11,
 'Travel blogger apasionada por descubrir nuevos destinos. 🌎 Comparto guías, tips y experiencias únicas de viaje por Latinoamérica y el mundo.',
 '@sofiaviaje', 134000, 'SofiaViajeChannel', 89000,
 5.8, 3800.00, 1700.00, 6500.00,
 '["viajes", "turismo", "fotografía", "aventura"]', 10, 4.6,
 NOW(), NOW());

-- 3.3 PLANES DE SUSCRIPCIÓN

INSERT INTO subscription_plans (name, description, price, price_display, billing_period, features, is_featured, is_active, display_order, created_at, updated_at) VALUES
('Plan Básico', 
 'Ideal para pequeñas empresas que inician en marketing de influencers',
 49.99, '$49.99', 'monthly',
 '["Acceso a perfiles ilimitados", "Hasta 5 campañas activas", "Soporte por email", "Reportes básicos"]',
 FALSE, TRUE, 1, NOW(), NOW()),

('Plan Profesional',
 'Para empresas con estrategias de marketing activas y en crecimiento',
 99.99, '$99.99', 'monthly',
 '["Acceso a perfiles ilimitados", "Hasta 20 campañas activas", "Soporte prioritario", "Reportes avanzados", "Analíticas en tiempo real", "Gestor de cuenta dedicado"]',
 TRUE, TRUE, 2, NOW(), NOW()),

('Plan Empresarial',
 'Solución completa para grandes corporaciones y agencias',
 199.99, '$199.99', 'monthly',
 '["Acceso a perfiles ilimitados", "Campañas ilimitadas", "Soporte 24/7 dedicado", "Reportes personalizados", "Analíticas avanzadas", "API access", "Capacitación mensual", "Cuenta ejecutiva exclusiva"]',
 FALSE, TRUE, 3, NOW(), NOW()),

('Plan Personalizado',
 'Soluciones a medida para necesidades específicas',
 NULL, 'Contactar', 'custom',
 '["Todo del Plan Empresarial", "Desarrollo de features personalizados", "Integraciones específicas", "SLA garantizado", "Consultoría estratégica"]',
 FALSE, TRUE, 4, NOW(), NOW());

-- 3.4 CAMPAÑAS

INSERT INTO campaigns (
    empresa_id, influencer_id, title, description, briefing,
    proposed_budget, final_budget, status, deliverables,
    start_date, end_date, created_at, updated_at
) VALUES
-- Campaña Activa
(6, 7,
 'Lanzamiento Colección Primavera-Verano 2025',
 'Campaña para promocionar nuestra nueva colección de moda sostenible. Buscamos contenido auténtico que conecte con audiencias jóvenes interesadas en moda consciente y sustentable.',
 'Queremos mostrar cómo la moda puede ser hermosa y responsable. El mensaje clave es: "Estilo que cuida el planeta". Enfoque en materiales reciclados y procesos éticos.',
 5000.00, 5500.00, 'ACTIVA',
 '3 posts en Instagram feed, 5 historias de Instagram diarias, 2 videos de TikTok mostrando outfits, 1 reel colaborativo con tips de moda sostenible',
 DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 35 DAY),
 DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),

-- Campaña Pendiente
(6, 8,
 'Review Smartphone Nueva Generación',
 'Necesitamos un review detallado y honesto de nuestro último smartphone flagship. Incluye unboxing, características técnicas, pruebas de rendimiento y comparación con competidores.',
 'El dispositivo tiene cámara de 200MP, batería de 5000mAh y procesador de última generación. Queremos destacar la relación calidad-precio.',
 8000.00, NULL, 'PENDIENTE',
 '1 video de YouTube (10-15 minutos) con review completo, 3 posts en Instagram destacando características, Stories diarias durante 5 días mostrando uso real',
 NULL, NULL,
 DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- Campaña en Negociación
(3, 9,
 'Promoción Línea de Cosméticos Naturales',
 'Lanzamiento de nuestra línea de cosméticos 100% naturales. Buscamos contenido educativo sobre los beneficios de ingredientes naturales y orgánicos en el cuidado de la piel.',
 'La línea incluye cremas faciales, serums y mascarillas. Ingredientes clave: aloe vera, aceite de argán, vitamina C. Target: mujeres 25-45 años.',
 6500.00, 7200.00, 'NEGOCIACION',
 '4 posts en Instagram mostrando productos, 2 videos de TikTok con tutoriales de aplicación, 1 tutorial completo de rutina de skincare, Código de descuento exclusivo para seguidores',
 NULL, NULL,
 DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- Campaña Finalizada
(6, 10,
 'Desafío Fitness 30 Días',
 'Campaña motivacional para promocionar nuestra app de fitness premium. El influencer liderará un desafío de 30 días con su audiencia, mostrando rutinas y seguimiento de progreso.',
 'App incluye rutinas personalizadas, tracking de nutrición y comunidad activa. Queremos generar descargas y suscripciones mensuales.',
 12000.00, 12000.00, 'FINALIZADA',
 '30 posts diarios en Instagram con rutinas del día, Videos motivacionales semanales en TikTok, 2 Lives en Instagram con Q&A, Seguimiento de resultados con testimonios',
 DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY),
 DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),

-- Campaña Rechazada
(3, 11,
 'Promoción Paquetes Turísticos Caribe',
 'Campaña para promocionar paquetes turísticos all-inclusive al Caribe. Buscamos contenido aspiracional que inspire a viajar.',
 'Paquetes incluyen vuelo, hotel 5 estrellas y tours. Destinos: Cancún, Punta Cana, Jamaica.',
 4000.00, NULL, 'RECHAZADA',
 '3 reels de TikTok, 5 posts de Instagram, 1 video de YouTube',
 NULL, NULL,
 DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- 3.5 NOTIFICACIONES

INSERT INTO notifications (user_id, title, message, notification_type, related_entity_type, related_entity_id, is_read, created_at) VALUES
-- Para Gabriela (user_id: 7)
(7, '¡Nueva propuesta de campaña!',
 'La empresa "Startup Innovación México" te ha enviado una propuesta para la campaña "Lanzamiento Colección Primavera-Verano 2025". Revísala en tu dashboard.',
 'CAMPAIGN_PROPOSAL', 'campaign', 1, FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY)),

(7, 'Campaña iniciada',
 'La campaña "Lanzamiento Colección Primavera-Verano 2025" ha comenzado oficialmente. Ya puedes iniciar la creación de contenido.',
 'CAMPAIGN_STARTED', 'campaign', 1, TRUE, NOW()),

-- Para Carlos (user_id: 8)
(8, 'Nueva propuesta de campaña',
 'Tienes una nueva propuesta de "Startup Innovación México" para revisar: "Review Smartphone Nueva Generación"',
 'CAMPAIGN_PROPOSAL', 'campaign', 2, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Para María José (user_id: 9)
(9, 'Negociación actualizada',
 'La empresa ha respondido a tu contra-oferta en la campaña "Promoción Línea de Cosméticos Naturales". Presupuesto propuesto: $7,200',
 'CAMPAIGN_NEGOTIATION', 'campaign', 3, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Para Andrés (user_id: 10)
(10, 'Campaña completada exitosamente',
 '¡Felicitaciones! Has completado la campaña "Desafío Fitness 30 Días". El pago será procesado en las próximas 24 horas.',
 'CAMPAIGN_COMPLETED', 'campaign', 4, TRUE, DATE_SUB(NOW(), INTERVAL 14 DAY)),

(10, 'Pago recibido',
 'Has recibido un pago de $10,200 por la campaña "Desafío Fitness 30 Días" (después de comisión de plataforma).',
 'PAYMENT_RECEIVED', 'transaction', 1, TRUE, DATE_SUB(NOW(), INTERVAL 13 DAY)),

-- Para Empresa (user_id: 6)
(6, 'Campaña aceptada',
 'Gabriela Martínez ha aceptado tu propuesta para "Lanzamiento Colección Primavera-Verano 2025". Ya puedes comunicarte con ella.',
 'CAMPAIGN_ACCEPTED', 'campaign', 1, TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY)),

(6, 'Pago procesado',
 'Tu pago de $12,000 para la campaña "Desafío Fitness 30 Días" ha sido procesado exitosamente.',
 'PAYMENT_COMPLETED', 'transaction', 1, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY));

-- 3.6 MENSAJES (Conversación campaña activa)

INSERT INTO messages (campaign_id, sender_id, receiver_id, content, is_read, created_at) VALUES
-- Conversación entre Empresa (6) y Gabriela (7)
(1, 6, 7, 
 '¡Hola Gaby! Muchas gracias por aceptar nuestra campaña. Estamos muy emocionados de trabajar contigo. ¿Podemos coordinar los detalles de la entrega de productos?',
 TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY)),

(1, 7, 6,
 '¡Hola! Igualmente emocionada de colaborar con ustedes. Cuéntenme más sobre la visión de la colección y el mensaje que quieren transmitir. ¿Tienen algún mood board o referencias visuales?',
 TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY)),

(1, 6, 7,
 'Claro, te comparto el drive con todas las referencias. Nuestra colección está enfocada en moda sostenible y consciente. Queremos que el contenido refleje autenticidad y conexión con valores ambientales.',
 TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY)),

(1, 7, 6,
 'Perfecto, me encanta ese enfoque. Ya vi el material y tengo varias ideas. Propongo hacer un post educativo sobre moda sostenible, seguido de looks casuales con las prendas. También un reel mostrando la calidad de los materiales. ¿Les parece?',
 TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY)),

(1, 6, 7,
 '¡Excelente propuesta! Nos encanta la idea del contenido educativo. Adelante con esa línea. ¿Necesitas que te enviemos las prendas con anticipación para planear las sesiones?',
 TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY)),

(1, 7, 6,
 'Sí, por favor. Necesito al menos una semana antes del inicio oficial para planear bien el contenido, hacer pruebas de looks y coordinar las locaciones para las fotos. También quiero asegurarme de que todo quede perfecto.',
 TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY)),

(1, 6, 7,
 'Perfecto, te enviamos todo mañana mismo por mensajería express. Incluiremos 5 outfits completos de la colección. ¡Muchas gracias Gaby, estamos seguros de que será increíble!',
 TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),

(1, 7, 6,
 '¡Genial! Ya estaré pendiente del envío. Empezaré a trabajar en el concepto creativo esta semana. Cualquier cosa les escribo por aquí. 🌟',
 FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- 3.7 TRANSACCIONES

INSERT INTO transactions (user_id, amount, type, status, description, payment_method, transaction_reference, created_at, updated_at) VALUES
-- Transacción completada (campaña finalizada)
(10, 12000.00, 'CAMPAIGN_PAYMENT', 'COMPLETED',
 'Pago por campaña "Desafío Fitness 30 Días". Comisión de plataforma: $1,800. Pago neto al influencer: $10,200',
 'stripe', 'pi_campaign_fitness_202412_001',
 DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY)),

-- Pago de suscripción
(6, 99.99, 'SUBSCRIPTION_PAYMENT', 'COMPLETED',
 'Suscripción mensual - Plan Profesional',
 'stripe', 'pi_sub_startup_202412_001',
 DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- Transacción pendiente (campaña activa)
(7, 5500.00, 'CAMPAIGN_PAYMENT', 'PENDING',
 'Pago pendiente por campaña "Lanzamiento Colección Primavera-Verano 2025". Se liberará al completar entregables.',
 'stripe', 'pi_campaign_moda_202412_001',
 DATE_SUB(NOW(), INTERVAL 10 DAY), NOW());

-- ============================================================
-- 4. VERIFICACIÓN
-- ============================================================

-- Mostrar resumen de datos insertados
SELECT '✅ BASE DE DATOS CREADA EXITOSAMENTE' AS status;
SELECT '📊 RESUMEN DE DATOS' AS info;

SELECT 'Usuarios' AS tabla, COUNT(*) AS total FROM users
UNION ALL
SELECT 'Perfiles de Influencers', COUNT(*) FROM influencer_profiles
UNION ALL
SELECT 'Campañas', COUNT(*) FROM campaigns
UNION ALL
SELECT 'Notificaciones', COUNT(*) FROM notifications
UNION ALL
SELECT 'Mensajes', COUNT(*) FROM messages
UNION ALL
SELECT 'Planes de Suscripción', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'Transacciones', COUNT(*) FROM transactions;

-- Mostrar usuarios de prueba
SELECT '👥 USUARIOS DE PRUEBA (password: admin123)' AS info;
SELECT id, email, full_name, role, is_active, is_approved 
FROM users 
ORDER BY role, id;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
