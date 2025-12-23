# =========================================
# Digital Ocean Setup Helper Script (PowerShell)
# =========================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Digital Ocean Setup Helper" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored output
function Print-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Print-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor White
}

# Check if psql is installed
$psqlExists = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlExists) {
    Print-Error "psql no está instalado"
    Write-Host ""
    Write-Host "Instálalo desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "O usando Chocolatey: choco install postgresql" -ForegroundColor Yellow
    exit 1
}

# Check if connection string is provided
$connectionString = $env:DATABASE_URL
if (-not $connectionString -and $args.Count -eq 0) {
    Print-Warning "DATABASE_URL no está definida"
    Write-Host ""
    Write-Host "Por favor, define tu connection string de Digital Ocean:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host '  $env:DATABASE_URL="postgresql://doadmin:PASSWORD@host.db.ondigitalocean.com:25060/dfkj68lnvi5nki?sslmode=require"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "O pásala como argumento:" -ForegroundColor Yellow
    Write-Host '  .\setup_digital_ocean.ps1 "postgresql://..."' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Use argument if provided, otherwise use env var
if ($args.Count -gt 0) {
    $connectionString = $args[0]
}

Print-Info "Conectando a la base de datos..."

# Test connection
try {
    $result = & psql $connectionString -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Conexión exitosa"
    } else {
        throw "Connection failed"
    }
} catch {
    Print-Error "No se pudo conectar a la base de datos"
    Write-Host "Verifica tu connection string" -ForegroundColor Yellow
    exit 1
}

# Execute initialization script
Print-Info "Ejecutando script de inicialización..."
Print-Warning "Esto creará todas las tablas y datos iniciales"
Write-Host ""
$confirmation = Read-Host "¿Continuar? (y/n)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Print-Warning "Operación cancelada"
    exit 1
}

Write-Host ""
Print-Info "Creando tablas y datos iniciales..."

$scriptPath = "app\scripts\init_complete_db.sql"
if (-not (Test-Path $scriptPath)) {
    Print-Error "No se encontró el script: $scriptPath"
    exit 1
}

try {
    & psql $connectionString -f $scriptPath > setup.log 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Script ejecutado exitosamente"
        Write-Host ""
        
        # Verify tables
        Print-Info "Verificando tablas creadas..."
        $tableCount = & psql $connectionString -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
        $tableCount = $tableCount.Trim()
        Print-Success "Tablas creadas: $tableCount"
        
        # Verify admin user
        Print-Info "Verificando usuario admin..."
        $adminExists = & psql $connectionString -t -c "SELECT EXISTS(SELECT 1 FROM users WHERE role = 'ADMIN' LIMIT 1);"
        if ($adminExists -match "t") {
            Print-Success "Usuario admin creado"
            Write-Host "  Email: admin@appinfluencers.com" -ForegroundColor White
            Write-Host "  Password: Admin123!" -ForegroundColor White
            Print-Warning "  ⚠️  CAMBIAR PASSWORD EN PRODUCCIÓN"
        }
        
        # Verify subscription plans
        Print-Info "Verificando planes de suscripción..."
        $planCount = & psql $connectionString -t -c "SELECT COUNT(*) FROM subscription_plans;"
        $planCount = $planCount.Trim()
        Print-Success "Planes creados: $planCount"
        
        Write-Host ""
        Print-Success "Setup completado exitosamente!"
        Write-Host ""
        Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
        Write-Host "  1. Configurar variables de entorno en Digital Ocean App Platform"
        Write-Host "  2. Deploy tu app (git push origin main)"
        Write-Host "  3. Las migraciones se ejecutarán automáticamente"
        Write-Host "  4. Cambiar password del admin"
        Write-Host ""
        Write-Host "📝 Ver detalles en: setup.log" -ForegroundColor Gray
        
    } else {
        throw "Script execution failed"
    }
} catch {
    Print-Error "Error al ejecutar el script"
    Write-Host "Ver detalles en: setup.log" -ForegroundColor Yellow
    if (Test-Path setup.log) {
        Write-Host ""
        Write-Host "Últimas líneas del log:" -ForegroundColor Yellow
        Get-Content setup.log -Tail 10
    }
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Setup Digital Ocean Completado" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
