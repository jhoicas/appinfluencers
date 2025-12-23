# 🗄️ Database Configuration Guide

## Overview

El proyecto está configurado para usar **PostgreSQL por defecto** con la flexibilidad de cambiar a **MySQL** únicamente modificando la configuración, sin cambios en el código.

## 📋 Bases de Datos Soportadas

### 1. PostgreSQL (Default - Recomendado)
- **Driver**: asyncpg
- **URL Format**: `postgresql://user:password@host:port/database`
- **Características**: Más moderno, mejor soporte async, mejor performance
- **Recomendado para**: Producción, escalabilidad

### 2. MySQL
- **Driver**: aiomysql
- **URL Format**: `mysql://user:password@host:port/database`
- **Características**: Ampliamente usado, familiar
- **Recomendado para**: Legado, compatible con infraestructura existente

---

## 🚀 Quick Start - PostgreSQL (Default)

### Local Development

1. **Instalar PostgreSQL:**
   ```bash
   # macOS (Homebrew)
   brew install postgresql
   brew services start postgresql
   
   # Windows: Descargar desde https://www.postgresql.org/download/windows/
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Crear base de datos:**
   ```bash
   # Conectar como postgres user
   psql -U postgres
   
   # En la terminal psql:
   CREATE USER influencers_user WITH PASSWORD 'influencers_password';
   CREATE DATABASE db_appinfluencers OWNER influencers_user;
   GRANT ALL PRIVILEGES ON DATABASE db_appinfluencers TO influencers_user;
   \q
   ```

3. **Configurar .env:**
   ```bash
   cp app/.env.example app/.env
   
   # Editar app/.env:
   DATABASE_URL=postgresql://influencers_user:influencers_password@localhost:5432/db_appinfluencers
   ```

4. **Instalar dependencias:**
   ```bash
   cd app
   pip install -r requirements.txt
   ```

5. **Ejecutar migraciones:**
   ```bash
   alembic upgrade head
   ```

6. **Iniciar backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Docker Compose (Recomendado)

```bash
# Iniciar todo con PostgreSQL
docker-compose up --build

# El contenedor PostgreSQL se inicia automáticamente
# Base de datos disponible en: postgresql://influencers_user:influencers_password@localhost:5432/db_appinfluencers
```

---

## 🔄 Cambiar de PostgreSQL a MySQL

Si necesitas cambiar a MySQL:

### Paso 1: Actualizar requirements.txt

En `app/requirements.txt`:

```bash
# Comentar PostgreSQL driver
# asyncpg==0.29.0

# Descomentar MySQL driver
aiomysql==0.2.0
PyMySQL==1.1.0
```

### Paso 2: Actualizar .env

```bash
# En app/.env:
DATABASE_URL=mysql://influencers_user:influencers_password@localhost:3306/db_appinfluencers
```

### Paso 3: Actualizar docker-compose.yml

En `docker-compose.yml`:

```yaml
services:
  # Comentar PostgreSQL
  # db:
  #   image: postgres:16-alpine
  #   ...
  
  # Descomentar MySQL
  db:
    image: mysql:8.0
    container_name: influencers_db
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: db_appinfluencers
      MYSQL_USER: influencers_user
      MYSQL_PASSWORD: influencers_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    # ... resto de configuración

volumes:
  # Comentar PostgreSQL
  # postgres_data:

  # Descomentar MySQL
  mysql_data:
```

### Paso 4: Reconstruir contenedores

```bash
# Detener y remover contenedores actuales
docker-compose down -v

# Reconstruir con nuevas dependencias
docker-compose up --build
```

---

## 📊 Estructura de Migraciones

Las migraciones funcionan igual para ambas bases de datos:

```bash
# Ver historial de migraciones
alembic history

# Ver versión actual
alembic current

# Crear nueva migración
alembic revision --autogenerate -m "descripción del cambio"

# Aplicar migraciones
alembic upgrade head

# Rollback una versión
alembic downgrade -1

# Rollback a versión específica
alembic downgrade <revision_id>
```

---

## 🔧 Configuración Avanzada

### PostgreSQL Options

En `app/core/database.py`, puedes configurar opciones específicas de PostgreSQL:

```python
engine_kwargs["connect_args"] = {
    "server_settings": {
        "jit": "off",  # Deshabilitar JIT para consistencia
    }
}
```

### MySQL Options

En `app/core/database.py`, para MySQL:

```python
engine_kwargs["connect_args"] = {
    "charset": "utf8mb4",  # Soporte completo de caracteres especiales
}
```

### Pool Configuration

Ambas bases de datos usan la misma configuración de pool en `database.py`:

```python
engine_kwargs = {
    "pool_size": 10,        # Conexiones por defecto
    "max_overflow": 20,     # Conexiones adicionales cuando se necesita
    "pool_recycle": 3600,   # Reciclar conexiones cada hora
    "pool_pre_ping": True,  # Verificar conexiones antes de usarlas
}
```

---

## 🧪 Testing Different Databases

### Crear instancias temporales para testing

```bash
# PostgreSQL en Docker
docker run --rm -it -p 5432:5432 \
  -e POSTGRES_DB=test_db \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_pass \
  postgres:16-alpine

# MySQL en Docker
docker run --rm -it -p 3306:3306 \
  -e MYSQL_DATABASE=test_db \
  -e MYSQL_USER=test_user \
  -e MYSQL_PASSWORD=test_pass \
  -e MYSQL_ROOT_PASSWORD=root_pass \
  mysql:8.0
```

---

## 📊 Comparación: PostgreSQL vs MySQL

| Aspecto | PostgreSQL | MySQL |
|---------|-----------|-------|
| **Async Driver** | asyncpg | aiomysql |
| **Performance** | Excelente | Bueno |
| **JSON Support** | Nativo | JSONB (5.7+) |
| **Full-Text Search** | Nativo | Disponible |
| **Transactions** | Robusto | Bueno |
| **Curva de aprendizaje** | Media | Baja |
| **Escalabilidad** | Excelente | Buena |
| **Community** | Excelente | Muy grande |

---

## 🚨 Troubleshooting

### PostgreSQL Connection Failed

```bash
# Verificar que PostgreSQL está corriendo
psql -U postgres -c "SELECT 1"

# Mostrar detalles de conexión
psql -U influencers_user -d db_appinfluencers -h localhost -c "SELECT current_database()"

# Resetear conexiones
docker-compose restart db
```

### MySQL Connection Failed

```bash
# Verificar MySQL está corriendo
mysql -u root -h localhost -e "SELECT 1"

# Verificar credenciales
mysql -u influencers_user -p -h localhost db_appinfluencers -e "SELECT 1"

# Resetear conexiones
docker-compose restart db
```

### Migración Fallida

```bash
# Ver logs detallados
alembic downgrade -1 -x verbose

# Reiniciar migraciones
alembic stamp head
alembic upgrade head
```

---

## 🔐 Seguridad

### Contraseñas en Producción

**NUNCA** uses contraseñas por defecto en producción:

```bash
# ❌ Inseguro (desarrollo)
DATABASE_URL=postgresql://user:password@localhost:5432/db

# ✅ Seguro (producción con Digital Ocean)
DATABASE_URL=${DIGITALOCEAN_DATABASE_URL}

# ✅ Seguro (producción con variables de entorno)
DATABASE_URL=postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)
```

### SSL Connections

Para conexiones seguras a la base de datos:

```bash
# PostgreSQL con SSL
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require

# MySQL con SSL
DATABASE_URL=mysql://user:password@host:3306/db?ssl_mode=REQUIRED
```

---

## 📈 Escalabilidad

### PostgreSQL en Producción

Recomendaciones para Digital Ocean:

```bash
# Development
PostgreSQL 14 Basic ($15/mes)

# Production
PostgreSQL 14 Standard ($30+/mes)
- Replicación automática
- Backups diarios
- Monitoring

# Scale-up
PostgreSQL 14 Premium ($49+/mes)
- HA (3 nodos)
- Backups por hora
- Soporte prioritario
```

### MySQL en Producción

Recomendaciones para Digital Ocean:

```bash
# Development
MySQL 8.0 Basic ($15/mes)

# Production
MySQL 8.0 Standard ($30+/mes)
- Replicación
- Backups
- Monitoring
```

---

## 🔄 Backup & Recovery

### PostgreSQL Backup

```bash
# Backup local
pg_dump -U influencers_user -h localhost db_appinfluencers > backup.sql

# Backup en Digital Ocean (automático)
# Dashboard → Databases → Backups

# Restore
psql -U influencers_user -h localhost db_appinfluencers < backup.sql
```

### MySQL Backup

```bash
# Backup local
mysqldump -u influencers_user -p db_appinfluencers > backup.sql

# Restore
mysql -u influencers_user -p db_appinfluencers < backup.sql
```

---

## 📚 Recursos

- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [asyncpg Documentation](https://magicstack.github.io/asyncpg/current/)
- [aiomysql Documentation](https://aiomysql.readthedocs.io/)
- [PostgreSQL vs MySQL](https://www.postgresqltutorial.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

---

## ⚡ Tips

1. **Siempre usa PostgreSQL en desarrollo** - Es más similar a producción (normalmente)
2. **Prueba cambios de schema con la otra BD** - Asegura compatibilidad
3. **Mantén .env.example actualizado** - Facilita onboarding
4. **Versiona tus migraciones** - Git debe trackear `alembic/versions/`
5. **Backup antes de cambios importantes** - Siempre

---

¿Preguntas sobre la configuración de bases de datos? 🤔
