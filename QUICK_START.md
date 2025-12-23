# 🚀 Quick Start - Digital Ocean Deployment

## Base de Datos: `dfkj68lnvi5nki`

### ⚡ Setup Rápido (5 minutos)

#### 1. Inicializar Base de Datos

**Opción A - Script Automático (Recomendado):**

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="tu_connection_string_de_digital_ocean"
.\setup_digital_ocean.ps1
```

**macOS/Linux (Bash):**
```bash
export DATABASE_URL="tu_connection_string_de_digital_ocean"
./setup_digital_ocean.sh
```

**Opción B - Manual:**
```bash
psql "postgresql://doadmin:PASSWORD@host:25060/dfkj68lnvi5nki?sslmode=require" -f app/scripts/init_complete_db.sql
```

#### 2. Configurar Variables de Entorno en Digital Ocean

En App Platform → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://doadmin:PASSWORD@host:25060/dfkj68lnvi5nki?sslmode=require
SECRET_KEY=tu_secret_key_generada
FRONTEND_URL=https://tu-app.ondigitalocean.app
BACKEND_URL=https://api-tu-app.ondigitalocean.app
ENVIRONMENT=production
```

**Generar SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 3. Deploy

```bash
git add .
git commit -m "Setup for Digital Ocean production"
git push origin main
```

Digital Ocean detectará y deployará automáticamente.

---

## 📦 Resultado del Setup

### ✅ Base de Datos Creada

**Tablas:**
- `users` - Usuarios del sistema
- `influencer_profiles` - Perfiles de influencers
- `subscription_plans` - Planes de suscripción
- `transactions` - Transacciones/pagos
- `campaigns` - Campañas
- `messages` - Mensajes
- `alembic_version` - Control de migraciones

**Datos Iniciales:**

**👤 Usuario Admin:**
- Email: `admin@appinfluencers.com`
- Password: `Admin123!`
- ⚠️ **CAMBIAR EN PRODUCCIÓN INMEDIATAMENTE**

**💳 Planes de Suscripción:**
1. **Básico** - $49.99/mes
2. **Profesional** - $99.99/mes
3. **Empresarial** - Precio personalizado

**🧪 Usuarios de Prueba:**
- `empresa@test.com` / `Test123!` (Empresa)
- `influencer1@test.com` / `Test123!` (Influencer)
- `influencer2@test.com` / `Test123!` (Influencer)

---

## 🔍 Verificación

### Check Base de Datos
```sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Ver usuarios
SELECT id, email, role, is_approved FROM users;

-- Ver planes
SELECT id, name, price FROM subscription_plans;
```

### Check API (después del deploy)
```bash
# Health check
curl https://api-tu-app.ondigitalocean.app/health

# Login admin
curl -X POST https://api-tu-app.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@appinfluencers.com","password":"Admin123!"}'
```

---

## 📁 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `app/scripts/init_complete_db.sql` | Script SQL completo para crear DB |
| `DIGITAL_OCEAN_SETUP.md` | Guía detallada de deployment |
| `setup_digital_ocean.ps1` | Script helper Windows |
| `setup_digital_ocean.sh` | Script helper macOS/Linux |
| `.do/app.yaml` | Configuración Digital Ocean |
| `app/.env.example` | Ejemplo de variables de entorno |

---

## 🔒 Seguridad Post-Deployment

**Tareas Críticas:**
1. ✅ Cambiar password del admin
2. ✅ Verificar que SECRET_KEY sea único y seguro
3. ✅ Revisar que sslmode=require esté en DATABASE_URL
4. ✅ Habilitar CORS solo para tu dominio
5. ✅ Eliminar usuarios de prueba en producción
6. ✅ Implementar proveedor de pagos preferido

---

## 🆘 Troubleshooting

**Error: "relation does not exist"**
→ El script SQL no se ejecutó. Correr `init_complete_db.sql` manualmente.

**Error: "password authentication failed"**
→ Verificar connection string en Digital Ocean Console.

**Error: "could not connect to server"**
→ Verificar que la IP esté en la whitelist (Digital Ocean Trusted Sources).

**Frontend no carga:**
→ Verificar CORS en `app/main.py` y variables de entorno.

---

## 📞 Soporte

Ver documentación completa en:
- **Deployment:** `DIGITAL_OCEAN_SETUP.md`
- **Database:** `DATABASE_CONFIG.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`

---

## ⏱️ Estimación de Costos

**Digital Ocean App Platform:**
- API (Basic): ~$5/mes
- Frontend (Basic): ~$5/mes
- PostgreSQL (Basic 1GB): ~$15/mes
- **Total: ~$25/mes**

Upgrade a Professional ($12/componente) si necesitas más recursos.

---

**¡Listo para producción! 🎉**
