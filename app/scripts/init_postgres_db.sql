-- =========================================
-- PostgreSQL Database Initialization Script
-- Para AppInfluencers Platform
-- =========================================
-- 
-- Este script configura PostgreSQL desde cero con:
-- - UTF8 encoding para caracteres especiales (emojis, acentos, etc.)
-- - Collation apropiada para español
-- - Usuario y permisos configurados
-- - Extensiones necesarias
--
-- Ejecutar como superusuario postgres:
-- psql -U postgres -f init_postgres_db.sql
-- =========================================

-- 1. Terminar conexiones existentes a la base de datos (si existe)
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'db_appinfluencers'
  AND pid <> pg_backend_pid();

-- 2. Eliminar base de datos si existe (cuidado en producción)
DROP DATABASE IF EXISTS db_appinfluencers;

-- 3. Eliminar usuario si existe
DROP USER IF EXISTS influencers_user;

-- 4. Crear usuario con contraseña
-- CAMBIAR CONTRASEÑA EN PRODUCCIÓN
CREATE USER influencers_user WITH
    PASSWORD 'influencers_password'
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    CONNECTION LIMIT -1;

-- 5. Crear base de datos con configuración UTF8
CREATE DATABASE db_appinfluencers
    WITH 
    OWNER = influencers_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'          -- Para ordenamiento
    LC_CTYPE = 'en_US.UTF-8'            -- Para clasificación de caracteres
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    TEMPLATE = template0;               -- Template limpio para encoding personalizado

COMMENT ON DATABASE db_appinfluencers 
    IS 'AppInfluencers Platform - Main Database';

-- 6. Conectar a la base de datos recién creada
\c db_appinfluencers

-- 7. Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";           -- Para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";            -- Para funciones de encriptación
CREATE EXTENSION IF NOT EXISTS "pg_trgm";             -- Para búsquedas de texto similares
CREATE EXTENSION IF NOT EXISTS "unaccent";            -- Para búsquedas sin acentos

COMMENT ON EXTENSION "uuid-ossp" IS 'Generación de UUIDs';
COMMENT ON EXTENSION "pgcrypto" IS 'Funciones criptográficas';
COMMENT ON EXTENSION "pg_trgm" IS 'Búsqueda de similitud de texto (trigrams)';
COMMENT ON EXTENSION "unaccent" IS 'Búsqueda sin acentos';

-- 8. Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE db_appinfluencers TO influencers_user;
GRANT ALL ON SCHEMA public TO influencers_user;

-- 9. Configurar permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO influencers_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO influencers_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON FUNCTIONS TO influencers_user;

-- 10. Configurar parámetros de la base de datos
-- Timezone
ALTER DATABASE db_appinfluencers SET timezone TO 'UTC';

-- Codificación del cliente
ALTER DATABASE db_appinfluencers SET client_encoding TO 'UTF8';

-- Formato de fecha por defecto
ALTER DATABASE db_appinfluencers SET datestyle TO 'ISO, MDY';

-- 11. Crear esquema de auditoría (opcional)
CREATE SCHEMA IF NOT EXISTS audit;
GRANT ALL ON SCHEMA audit TO influencers_user;

-- 12. Función para timestamps automáticos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION update_updated_at_column() 
    IS 'Trigger function para actualizar automáticamente updated_at';

-- =========================================
-- VERIFICACIÓN
-- =========================================

-- Verificar encoding
SELECT 
    datname as database,
    pg_encoding_to_char(encoding) as encoding,
    datcollate as collation,
    datctype as ctype
FROM pg_database 
WHERE datname = 'db_appinfluencers';

-- Verificar extensiones instaladas
SELECT 
    extname as extension,
    extversion as version
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent');

-- Verificar usuario y permisos
SELECT 
    usename as username,
    usesuper as is_superuser,
    usecreatedb as can_create_db
FROM pg_user 
WHERE usename = 'influencers_user';

-- =========================================
-- TEST DE CARACTERES ESPECIALES
-- =========================================

-- Crear tabla de prueba con caracteres especiales
CREATE TABLE IF NOT EXISTS test_utf8 (
    id SERIAL PRIMARY KEY,
    texto TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar datos de prueba con caracteres especiales
INSERT INTO test_utf8 (texto) VALUES 
    ('Español: áéíóúñÑ¿¡'),
    ('Francés: àâæçéèêëïîôùûüÿœ'),
    ('Alemán: äöüßÄÖÜ'),
    ('Emojis: 😀🎉💯✨🔥'),
    ('Símbolos: €$¥£₹¢'),
    ('Caracteres especiales: ©®™§¶†‡');

-- Verificar que se guardaron correctamente
SELECT * FROM test_utf8;

-- Limpiar tabla de prueba
DROP TABLE IF EXISTS test_utf8;

-- =========================================
-- INSTRUCCIONES DE USO
-- =========================================

/*

CONEXIÓN LOCAL:
---------------
psql -U influencers_user -d db_appinfluencers -h localhost

STRING DE CONEXIÓN:
------------------
postgresql://influencers_user:influencers_password@localhost:5432/db_appinfluencers

PARA APLICAR MIGRACIONES ALEMBIC:
---------------------------------
cd app
alembic upgrade head

VERIFICAR ENCODING EN PYTHON:
-----------------------------
python -c "
import asyncpg
import asyncio

async def test():
    conn = await asyncpg.connect(
        'postgresql://influencers_user:influencers_password@localhost:5432/db_appinfluencers'
    )
    result = await conn.fetchval('SELECT $$Prueba: áéíóú 😀🎉$$')
    print(result)
    await conn.close()

asyncio.run(test())
"

BACKUP:
-------
pg_dump -U influencers_user -d db_appinfluencers -F c -f backup.dump

RESTORE:
--------
pg_restore -U influencers_user -d db_appinfluencers -c backup.dump

NOTAS DE SEGURIDAD:
-------------------
1. CAMBIAR la contraseña 'influencers_password' en producción
2. Usar variables de entorno para credenciales
3. Configurar pg_hba.conf para restringir acceso
4. Habilitar SSL en producción

*/

-- =========================================
-- Script completado exitosamente
-- =========================================

\echo '✅ Base de datos db_appinfluencers creada correctamente'
\echo '✅ Usuario influencers_user configurado'
\echo '✅ UTF8 encoding habilitado'
\echo '✅ Extensiones instaladas'
\echo ''
\echo '📋 Siguiente paso: alembic upgrade head'
