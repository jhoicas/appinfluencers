#!/bin/bash
# =========================================
# Digital Ocean Setup Helper Script
# =========================================

set -e  # Exit on error

echo "🚀 Digital Ocean Setup Helper"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    print_error "psql no está instalado. Instálalo primero:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo "  Windows: Descarga desde https://www.postgresql.org/download/"
    exit 1
fi

# Check if connection string is provided
if [ -z "$DATABASE_URL" ]; then
    print_warning "DATABASE_URL no está definida"
    echo ""
    echo "Por favor, exporta tu connection string de Digital Ocean:"
    echo ""
    echo "  export DATABASE_URL='postgresql://doadmin:PASSWORD@host.db.ondigitalocean.com:25060/dfkj68lnvi5nki?sslmode=require'"
    echo ""
    echo "O pásala como argumento:"
    echo "  ./setup_digital_ocean.sh 'postgresql://...'"
    echo ""
    exit 1
fi

# Use argument if provided, otherwise use env var
CONNECTION_STRING="${1:-$DATABASE_URL}"

print_info "Conectando a la base de datos..."

# Test connection
if psql "$CONNECTION_STRING" -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Conexión exitosa"
else
    print_error "No se pudo conectar a la base de datos"
    echo "Verifica tu connection string"
    exit 1
fi

# Execute initialization script
print_info "Ejecutando script de inicialización..."
print_warning "Esto creará todas las tablas y datos iniciales"
echo ""
read -p "¿Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Operación cancelada"
    exit 1
fi

echo ""
print_info "Creando tablas y datos iniciales..."

if psql "$CONNECTION_STRING" -f app/scripts/init_complete_db.sql > setup.log 2>&1; then
    print_success "Script ejecutado exitosamente"
    echo ""
    
    # Verify tables
    print_info "Verificando tablas creadas..."
    TABLE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
    print_success "Tablas creadas: $TABLE_COUNT"
    
    # Verify admin user
    print_info "Verificando usuario admin..."
    ADMIN_EXISTS=$(psql "$CONNECTION_URL" -t -c "SELECT EXISTS(SELECT 1 FROM users WHERE role = 'ADMIN' LIMIT 1);")
    if [[ "$ADMIN_EXISTS" == *"t"* ]]; then
        print_success "Usuario admin creado"
        echo "  Email: admin@appinfluencers.com"
        echo "  Password: Admin123!"
        print_warning "  ⚠️  CAMBIAR PASSWORD EN PRODUCCIÓN"
    fi
    
    # Verify subscription plans
    print_info "Verificando planes de suscripción..."
    PLAN_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM subscription_plans;")
    print_success "Planes creados: $PLAN_COUNT"
    
    echo ""
    print_success "Setup completado exitosamente!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "  1. Configurar variables de entorno en Digital Ocean App Platform"
    echo "  2. Deploy tu app (git push origin main)"
    echo "  3. Las migraciones se ejecutarán automáticamente"
    echo "  4. Cambiar password del admin"
    echo ""
    echo "📝 Ver detalles en: setup.log"
    
else
    print_error "Error al ejecutar el script"
    echo "Ver detalles en: setup.log"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ Setup Digital Ocean Completado"
echo "======================================"
