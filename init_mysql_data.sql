-- ============================================================
-- Script de Inicialización para MySQL - Plataforma Influencers
-- Encoding: UTF-8
-- ============================================================

-- Asegurar que usamos utf8mb4 para soportar todos los caracteres especiales
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- DATOS DE PRUEBA CON CARACTERES EN ESPAÑOL
-- ============================================================

-- Nota: Las tablas ya están creadas por Alembic.
-- Este script solo inserta datos de prueba.

-- ============================================================
-- 1. USUARIOS (users)
-- ============================================================

-- Admin
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved, created_at, updated_at, trial_start_time, has_active_subscription)
VALUES 
('admin@influencers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Administrador Principal', 'ADMIN', 1, 1, NOW(), NOW(), NULL, 0),
('soporte@influencers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Equipo de Soporte', 'ADMIN', 1, 1, NOW(), NOW(), NULL, 0);

-- Empresas
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved, created_at, updated_at, trial_start_time, has_active_subscription, trial_profile_viewed_id)
VALUES 
('empresa@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Empresa de Tecnología SAS', 'EMPRESA', 1, 1, NOW(), NOW(), NOW(), 0, NULL),
('marketing@ejemplo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Agencia de Marketing Digital', 'EMPRESA', 1, 1, NOW(), NOW(), NOW(), 0, NULL),
('startup@innovacion.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Startup Innovación México', 'EMPRESA', 1, 1, NOW(), NOW(), DATE_SUB(NOW(), INTERVAL 2 DAY), 0, NULL),
('comercio@ecommerce.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'E-commerce Perú', 'EMPRESA', 1, 1, NOW(), NOW(), NOW(), 1, NULL);

-- Influencers
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_approved, created_at, updated_at, trial_start_time, has_active_subscription)
VALUES 
('gaby@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Gabriela Martínez', 'INFLUENCER', 1, 1, NOW(), NOW(), NULL, 0),
('carlos@influencer.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Carlos Rodríguez', 'INFLUENCER', 1, 1, NOW(), NOW(), NULL, 0),
('maria@beauty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'María José López', 'INFLUENCER', 1, 1, NOW(), NOW(), NULL, 0),
('andres@tech.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Andrés Pérez', 'INFLUENCER', 1, 1, NOW(), NOW(), NULL, 0),
('sofia@lifestyle.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC', 'Sofía González', 'INFLUENCER', 1, 1, NOW(), NOW(), NULL, 0);

-- ============================================================
-- 2. PLANES DE SUSCRIPCIÓN (subscription_plans)
-- ============================================================

INSERT INTO subscription_plans (name, description, price, duration_days, features, is_active, created_at, updated_at)
VALUES 
('Plan Básico', 'Ideal para pequeñas empresas que inician en marketing de influencers', 49900.00, 30, '{"perfiles_ilimitados": true, "campanas_mes": 5, "soporte": "email", "reportes": "básicos"}', 1, NOW(), NOW()),
('Plan Profesional', 'Para empresas con estrategias de marketing activas', 99900.00, 30, '{"perfiles_ilimitados": true, "campanas_mes": 20, "soporte": "prioritario", "reportes": "avanzados", "analiticas": true}', 1, NOW(), NOW()),
('Plan Empresarial', 'Solución completa para grandes corporaciones', 199900.00, 30, '{"perfiles_ilimitados": true, "campanas_mes": -1, "soporte": "dedicado", "reportes": "personalizados", "analiticas": true, "api_access": true}', 1, NOW(), NOW());

-- ============================================================
-- 3. PERFILES DE INFLUENCERS (influencer_profiles)
-- ============================================================

INSERT INTO influencer_profiles (user_id, bio, categories, instagram_handle, instagram_followers, tiktok_handle, tiktok_followers, youtube_handle, youtube_subscribers, suggested_rate_per_post, portfolio_url, is_verified, created_at, updated_at)
VALUES 
-- Gabriela Martínez (user_id: 5)
(5, 
 'Creadora de contenido especializada en moda y estilo de vida. Más de 5 años conectando marcas con audiencias auténticas. 🌟 Colaboraciones con marcas reconocidas.', 
 '["moda", "estilo de vida", "belleza", "viajes"]',
 '@gabymartinez',
 125000,
 '@gabymartinezoficial',
 89000,
 'GabyMartinezVlogs',
 45000,
 2500.00,
 'https://portfolio.gabymartinez.com',
 1,
 NOW(),
 NOW()),

-- Carlos Rodríguez (user_id: 6)
(6,
 'Experto en tecnología y gadgets. Reviews honestos y tutoriales prácticos. 🔧 Ayudo a las personas a elegir la mejor tecnología.',
 '["tecnología", "gadgets", "reviews", "educación"]',
 '@carlostech',
 98000,
 '@carlostechreview',
 156000,
 'CarlosTechChannel',
 234000,
 3500.00,
 'https://carlosrodriguez.tech',
 1,
 NOW(),
 NOW()),

-- María José López (user_id: 7)
(7,
 'Experta en belleza y cuidado personal. Maquilladora profesional certificada. 💄 Tutoriales, reseñas y tips para lucir radiante.',
 '["belleza", "maquillaje", "skincare", "wellness"]',
 '@mariajosebeauty',
 215000,
 '@mjbeautyofficial',
 178000,
 NULL,
 NULL,
 4500.00,
 NULL,
 1,
 NOW(),
 NOW()),

-- Andrés Pérez (user_id: 8)
(8,
 'Fitness coach y nutricionista. Transformo vidas a través del ejercicio y alimentación saludable. 💪 Rutinas, recetas y motivación.',
 '["fitness", "nutrición", "salud", "motivación"]',
 '@andresfitness',
 167000,
 '@andresfitnesscoach',
 267000,
 'AndresFitnessTV',
 123000,
 3200.00,
 'https://andresperez.fitness',
 1,
 NOW(),
 NOW()),

-- Sofía González (user_id: 9)
(9,
 'Travel blogger apasionada por descubrir nuevos destinos. 🌎 Comparto guías, tips y experiencias únicas de viaje.',
 '["viajes", "turismo", "fotografía", "aventura"]',
 '@sofiaviajeoficial',
 189000,
 '@sofiaviaje',
 134000,
 'SofiaViajeChannel',
 89000,
 3800.00,
 'https://sofiaviaje.blog',
 1,
 NOW(),
 NOW());

-- ============================================================
-- 4. CAMPAÑAS (campaigns)
-- ============================================================

INSERT INTO campaigns (empresa_id, influencer_id, title, description, proposed_budget, negotiated_budget, status, start_date, end_date, deliverables, created_at, updated_at)
VALUES 
-- Campaña activa
(3, 5, 
 'Lanzamiento Colección Primavera-Verano',
 'Campaña para promocionar nuestra nueva colección de moda sostenible. Buscamos contenido auténtico que conecte con audiencias jóvenes interesadas en moda consciente.',
 5000.00,
 5500.00,
 'ACTIVA',
 DATE_ADD(NOW(), INTERVAL 5 DAY),
 DATE_ADD(NOW(), INTERVAL 35 DAY),
 '["3 posts Instagram feed", "5 historias Instagram", "2 videos TikTok", "1 reel colaborativo"]',
 DATE_SUB(NOW(), INTERVAL 10 DAY),
 NOW()),

-- Campaña pendiente
(4, 6,
 'Review Smartphone Nueva Generación',
 'Necesitamos un review detallado y honesto de nuestro último smartphone. Incluye unboxing, características técnicas y pruebas de rendimiento.',
 8000.00,
 NULL,
 'PENDIENTE',
 NULL,
 NULL,
 '["1 video YouTube (10-15 min)", "3 posts Instagram", "Stories diarias durante 5 días"]',
 DATE_SUB(NOW(), INTERVAL 2 DAY),
 NOW()),

-- Campaña en negociación
(3, 7,
 'Promoción Línea de Cosméticos Naturales',
 'Lanzamiento de nuestra línea de cosméticos 100% naturales. Buscamos contenido educativo sobre los beneficios de ingredientes naturales.',
 6500.00,
 7200.00,
 'NEGOCIACION',
 NULL,
 NULL,
 '["4 posts Instagram", "2 videos TikTok", "1 tutorial completo", "Código descuento exclusivo"]',
 DATE_SUB(NOW(), INTERVAL 5 DAY),
 NOW()),

-- Campaña finalizada
(4, 8,
 'Desafío Fitness 30 Días',
 'Campaña motivacional para promocionar nuestra app de fitness. El influencer liderará un desafío de 30 días con su audiencia.',
 12000.00,
 12000.00,
 'FINALIZADA',
 DATE_SUB(NOW(), INTERVAL 45 DAY),
 DATE_SUB(NOW(), INTERVAL 15 DAY),
 '["30 posts diarios Instagram", "Videos motivacionales semanales", "Live Q&A", "Seguimiento resultados"]',
 DATE_SUB(NOW(), INTERVAL 50 DAY),
 DATE_SUB(NOW(), INTERVAL 14 DAY));

-- ============================================================
-- 5. NOTIFICACIONES (notifications)
-- ============================================================

INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
VALUES 
(5, '¡Nueva propuesta de campaña!', 
 'La empresa "Startup Innovación México" te ha enviado una propuesta para la campaña "Lanzamiento Colección Primavera-Verano". Revísala en tu dashboard.',
 'CAMPAIGN_PROPOSAL', 0, DATE_SUB(NOW(), INTERVAL 10 DAY)),

(5, 'Campaña aceptada', 
 'Has aceptado la campaña "Lanzamiento Colección Primavera-Verano". La fecha de inicio es en 5 días.',
 'CAMPAIGN_ACCEPTED', 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),

(6, 'Nueva propuesta de campaña', 
 'Tienes una nueva propuesta de "E-commerce Perú" para revisar: "Review Smartphone Nueva Generación"',
 'CAMPAIGN_PROPOSAL', 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),

(7, 'Negociación actualizada', 
 'La empresa ha respondido a tu contra-oferta en la campaña "Promoción Línea de Cosméticos Naturales"',
 'CAMPAIGN_NEGOTIATION', 0, DATE_SUB(NOW(), INTERVAL 3 DAY)),

(3, 'Campaña iniciada', 
 'La campaña "Lanzamiento Colección Primavera-Verano" ha comenzado hoy. Puedes chatear con el influencer.',
 'CAMPAIGN_STARTED', 1, NOW()),

(4, 'Pago procesado', 
 'Tu pago de $12,000 para la campaña "Desafío Fitness 30 Días" ha sido procesado exitosamente.',
 'PAYMENT_COMPLETED', 1, DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ============================================================
-- 6. MENSAJES (messages)
-- ============================================================

INSERT INTO messages (campaign_id, sender_id, content, created_at, is_read)
VALUES 
-- Conversación campaña activa (campaign_id: 1)
(1, 3, 'Hola Gaby! Muchas gracias por aceptar nuestra campaña. Estamos muy emocionados de trabajar contigo. ¿Podemos coordinar los detalles?', DATE_SUB(NOW(), INTERVAL 8 DAY), 1),
(1, 5, '¡Hola! Igualmente emocionada. Cuéntenme más sobre la visión de la colección y el mensaje que quieren transmitir.', DATE_SUB(NOW(), INTERVAL 8 DAY), 1),
(1, 3, 'Nuestra colección está enfocada en moda sostenible y consciente. Queremos que el contenido refleje autenticidad y conexión con valores ambientales.', DATE_SUB(NOW(), INTERVAL 7 DAY), 1),
(1, 5, 'Perfecto, me encanta ese enfoque. Propongo hacer un post educativo sobre moda sostenible, seguido de looks casuales con las prendas. ¿Les parece?', DATE_SUB(NOW(), INTERVAL 7 DAY), 1),
(1, 3, '¡Excelente idea! Adelante con esa propuesta. ¿Necesitas que te enviemos las prendas con anticipación?', DATE_SUB(NOW(), INTERVAL 6 DAY), 1),
(1, 5, 'Sí, por favor. Necesito al menos una semana antes del inicio para planear bien el contenido y tomas fotográficas.', DATE_SUB(NOW(), INTERVAL 6 DAY), 1),
(1, 3, 'Perfecto, te las enviamos mañana mismo. ¡Gracias Gaby!', DATE_SUB(NOW(), INTERVAL 5 DAY), 1);

-- ============================================================
-- 7. TRANSACCIONES (transactions)
-- ============================================================

INSERT INTO transactions (campaign_id, empresa_id, influencer_id, amount, platform_commission, influencer_payout, transaction_type, status, stripe_payment_intent_id, stripe_payout_id, created_at, updated_at, completed_at)
VALUES 
-- Transacción completada
(4, 4, 8, 
 12000.00, 
 1800.00, 
 10200.00,
 'CAMPAIGN_PAYMENT',
 'COMPLETADO',
 'pi_test_completed_123456789',
 'po_test_payout_987654321',
 DATE_SUB(NOW(), INTERVAL 50 DAY),
 DATE_SUB(NOW(), INTERVAL 14 DAY),
 DATE_SUB(NOW(), INTERVAL 14 DAY)),

-- Transacción retenida (campaña activa)
(1, 3, 5,
 5500.00,
 825.00,
 4675.00,
 'CAMPAIGN_PAYMENT',
 'RETENIDO',
 'pi_test_active_223344556',
 NULL,
 DATE_SUB(NOW(), INTERVAL 10 DAY),
 DATE_SUB(NOW(), INTERVAL 10 DAY),
 NULL),

-- Transacción pendiente
(2, 4, 6,
 8000.00,
 1200.00,
 6800.00,
 'CAMPAIGN_PAYMENT',
 'PENDIENTE',
 NULL,
 NULL,
 DATE_SUB(NOW(), INTERVAL 2 DAY),
 DATE_SUB(NOW(), INTERVAL 2 DAY),
 NULL);

-- ============================================================
-- RESUMEN DE CONTRASEÑAS PARA PRUEBAS
-- ============================================================
-- Todas las cuentas usan la contraseña: "admin123"
-- Hash bcrypt: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PJvDdZ3l8LwC
--
-- Usuarios disponibles:
-- - admin@influencers.com (ADMIN)
-- - empresa@test.com (EMPRESA - en trial)
-- - marketing@ejemplo.com (EMPRESA - en trial)
-- - comercio@ecommerce.com (EMPRESA - con suscripción)
-- - gaby@gmail.com (INFLUENCER)
-- - carlos@influencer.com (INFLUENCER)
-- - maria@beauty.com (INFLUENCER)
-- ============================================================

SELECT '✅ Datos de prueba insertados correctamente con soporte UTF-8!' AS resultado;
