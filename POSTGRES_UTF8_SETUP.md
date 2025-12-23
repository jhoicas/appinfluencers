# 🗄️ PostgreSQL UTF8 Configuration Guide

## Script de Inicialización

El archivo `init_postgres_db.sql` configura PostgreSQL desde cero con:

✅ **Encoding UTF8** - Soporta todos los caracteres especiales  
✅ **Collation en_US.UTF-8** - Ordenamiento y clasificación correcta  
✅ **Usuario y permisos** - `influencers_user` con acceso completo  
✅ **Extensiones útiles** - UUID, pgcrypto, búsqueda de texto  
✅ **Funciones helper** - Timestamps automáticos  

---

## 🚀 Ejecución del Script

### Opción 1: Desde línea de comandos

```bash
# Como superusuario postgres
psql -U postgres -f app/scripts/init_postgres_db.sql

# Con contraseña interactiva
psql -U postgres -W -f app/scripts/init_postgres_db.sql
```

### Opción 2: Desde psql shell

```bash
# Conectar como postgres
psql -U postgres

# Dentro de psql, ejecutar:
\i app/scripts/init_postgres_db.sql
```

### Opción 3: Docker (si usas docker-compose)

```bash
# Copiar script al contenedor
docker cp app/scripts/init_postgres_db.sql influencers_db:/tmp/

# Ejecutar dentro del contenedor
docker exec -it influencers_db psql -U postgres -f /tmp/init_postgres_db.sql
```

---

## 📋 Lo que hace el script

### 1. Crear Usuario
```sql
CREATE USER influencers_user WITH
    PASSWORD 'influencers_password'
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE;
```

### 2. Crear Base de Datos con UTF8
```sql
CREATE DATABASE db_appinfluencers
    WITH 
    OWNER = influencers_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;  -- Importante para UTF8
```

**¿Por qué `template0`?**  
- Permite especificar encoding diferente al por defecto
- Garantiza configuración limpia sin objetos heredados

### 3. Instalar Extensiones
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Encriptación
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Búsqueda similar
CREATE EXTENSION IF NOT EXISTS "unaccent";     -- Búsqueda sin acentos
```

### 4. Configurar Permisos
```sql
GRANT ALL PRIVILEGES ON DATABASE db_appinfluencers TO influencers_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO influencers_user;
```

### 5. Test UTF8
```sql
-- El script prueba automáticamente:
INSERT INTO test_utf8 (texto) VALUES 
    ('Español: áéíóúñÑ¿¡'),
    ('Emojis: 😀🎉💯✨🔥'),
    ('Símbolos: €$¥£₹¢');
```

---

## ✅ Verificación Post-Script

### Verificar Encoding

```bash
# Conectar a la BD
psql -U influencers_user -d db_appinfluencers -h localhost

# Verificar configuración
SELECT 
    current_setting('server_encoding') as encoding,
    current_setting('client_encoding') as client,
    current_setting('lc_collate') as collation;
```

Deberías ver:
```
 encoding | client | collation
----------+--------+--------------
 UTF8     | UTF8   | en_US.UTF-8
```

### Verificar Extensiones

```sql
\dx
```

Deberías ver:
```
         Name          | Version
-----------------------+---------
 pgcrypto              | 1.3
 pg_trgm               | 1.6
 unaccent              | 1.1
 uuid-ossp             | 1.1
```

### Test de Caracteres Especiales

```sql
-- Crear tabla temporal
CREATE TEMP TABLE test (texto TEXT);

-- Insertar caracteres especiales
INSERT INTO test VALUES 
    ('Prueba: áéíóúñ 😀🎉'),
    ('Café ☕ €10');

-- Verificar
SELECT * FROM test;
```

Si ves los caracteres correctamente, ✅ UTF8 está funcionando.

---

## 🔧 Configuración en el Proyecto

### 1. Actualizar `.env`

```bash
# app/.env
DATABASE_URL=postgresql://influencers_user:influencers_password@localhost:5432/db_appinfluencers
```

### 2. Ejecutar Migraciones

```bash
cd app
alembic upgrade head
```

### 3. Verificar desde Python

```python
# Test rápido
python -c "
import asyncio
import asyncpg

async def test():
    conn = await asyncpg.connect(
        'postgresql://influencers_user:influencers_password@localhost:5432/db_appinfluencers'
    )
    
    # Test UTF8
    result = await conn.fetchval(\"\"\"
        SELECT 'Test UTF8: áéíóú ñ 😀🎉 €$'
    \"\"\")
    print(result)
    
    await conn.close()

asyncio.run(test())
"
```

---

## 🐳 Docker Compose

Si usas `docker-compose.yml`, PostgreSQL ya está configurado con UTF8:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: influencers_user
      POSTGRES_PASSWORD: influencers_password
      POSTGRES_DB: db_appinfluencers
      # PostgreSQL 16 usa UTF8 por defecto
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=en_US.UTF-8"
```

---

## 🚨 Troubleshooting

### Problema: Encoding incorrecto

**Síntoma:** Caracteres especiales aparecen como `�` o `?`

**Solución:**
```sql
-- Verificar encoding de la BD
SELECT pg_encoding_to_char(encoding) 
FROM pg_database 
WHERE datname = 'db_appinfluencers';

-- Si no es UTF8, recrear:
DROP DATABASE db_appinfluencers;
-- Ejecutar script nuevamente
```

### Problema: No se pueden insertar emojis

**Causa:** Cliente configurado con encoding diferente

**Solución:**
```sql
-- En la sesión actual
SET client_encoding = 'UTF8';

-- Permanente para la BD
ALTER DATABASE db_appinfluencers SET client_encoding = 'UTF8';
```

### Problema: Collation errors

**Síntoma:** `ERROR: collation "en_US.UTF-8" does not exist`

**Solución (Linux/macOS):**
```bash
# Instalar locales
sudo locale-gen en_US.UTF-8
sudo update-locale

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

**Solución (Docker):**
```dockerfile
# En tu Dockerfile de PostgreSQL
RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.UTF-8
```

### Problema: Extensiones no se crean

**Síntoma:** `ERROR: extension "uuid-ossp" does not exist`

**Solución:**
```bash
# Instalar contrib (contiene extensiones)
# Ubuntu/Debian
sudo apt-get install postgresql-contrib

# Fedora/RHEL
sudo yum install postgresql-contrib

# macOS (Homebrew)
# Ya incluido en postgres instalación
```

---

## 📊 Collations Alternativas

### Para español (España)
```sql
CREATE DATABASE db_appinfluencers
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_ES.UTF-8'
    LC_CTYPE = 'es_ES.UTF-8';
```

### Para español (Latinoamérica)
```sql
CREATE DATABASE db_appinfluencers
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_MX.UTF-8'  -- México
    LC_CTYPE = 'es_MX.UTF-8';
```

### Neutral (recomendado para multi-idioma)
```sql
CREATE DATABASE db_appinfluencers
    ENCODING = 'UTF8'
    LC_COLLATE = 'C.UTF-8'
    LC_CTYPE = 'C.UTF-8';
```

---

## 🔐 Seguridad en Producción

### 1. Cambiar Contraseña

```sql
-- Generar contraseña fuerte
-- En bash:
openssl rand -base64 32

-- En PostgreSQL:
ALTER USER influencers_user WITH PASSWORD 'nueva_contraseña_segura_generada';
```

### 2. Configurar `pg_hba.conf`

```bash
# /etc/postgresql/16/main/pg_hba.conf

# Desarrollo local
local   db_appinfluencers   influencers_user   md5
host    db_appinfluencers   influencers_user   127.0.0.1/32   md5

# Producción (solo desde app)
hostssl db_appinfluencers   influencers_user   10.0.0.0/8   md5
```

### 3. SSL en Producción

```sql
-- Forzar SSL
ALTER DATABASE db_appinfluencers SET ssl = on;

-- String de conexión con SSL
postgresql://user:pass@host:5432/db?sslmode=require
```

---

## 📈 Performance para UTF8

### Índices para búsqueda de texto

```sql
-- Índice trigram para búsqueda similar
CREATE INDEX idx_profiles_name_trgm 
ON influencer_profiles 
USING gin (full_name gin_trgm_ops);

-- Búsqueda sin acentos
CREATE INDEX idx_profiles_name_unaccent
ON influencer_profiles 
USING gin (unaccent(full_name) gin_trgm_ops);
```

### Búsquedas case-insensitive

```sql
-- Usar ILIKE para búsquedas sin case
SELECT * FROM influencer_profiles 
WHERE full_name ILIKE '%josé%';

-- Con índice funcional
CREATE INDEX idx_profiles_name_lower
ON influencer_profiles (LOWER(full_name));

SELECT * FROM influencer_profiles 
WHERE LOWER(full_name) LIKE '%josé%';
```

---

## 🎯 Best Practices

1. **Siempre usa UTF8** - Es el estándar moderno
2. **Template0 para custom encoding** - Necesario al especificar encoding
3. **Instala extensiones útiles** - uuid-ossp, pg_trgm, unaccent
4. **Configura timezone UTC** - Facilita manejo de fechas
5. **Test con emojis** - Si funcionan, todo funciona
6. **Backup regular** - `pg_dump` preserva encoding

---

## 📚 Recursos

- [PostgreSQL Character Sets](https://www.postgresql.org/docs/current/multibyte.html)
- [Collations](https://www.postgresql.org/docs/current/collation.html)
- [Extensions](https://www.postgresql.org/docs/current/contrib.html)

---

## ✅ Checklist Final

- [ ] Script ejecutado sin errores
- [ ] Encoding verificado (UTF8)
- [ ] Extensiones instaladas
- [ ] Test de caracteres especiales pasado
- [ ] Migraciones aplicadas (`alembic upgrade head`)
- [ ] Conexión desde Python funcional
- [ ] Contraseña cambiada en producción
- [ ] Backup configurado

---

¡Tu PostgreSQL está listo para manejar cualquier carácter especial! 🎉
