# Script para configurar el archivo .env.local automáticamente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurando Frontend - .env.local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envLocalPath = ".env.local"

# Verificar si ya existe
if (Test-Path $envLocalPath) {
    Write-Host "⚠️  El archivo .env.local ya existe." -ForegroundColor Yellow
    $overwrite = Read-Host "¿Deseas sobrescribirlo? (s/n)"
    
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "❌ Operación cancelada." -ForegroundColor Red
        exit
    }
}

# Crear el archivo .env.local
$envContent = @"
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Facebook App ID (para login con Facebook)
NEXT_PUBLIC_FACEBOOK_APP_ID=1531422201378331
"@

# Escribir el archivo
$envContent | Out-File -FilePath $envLocalPath -Encoding UTF8

Write-Host "✅ Archivo .env.local creado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Contenido:" -ForegroundColor Cyan
Write-Host $envContent
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Próximos pasos:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Si el servidor está corriendo, reinícialo (Ctrl+C y luego npm run dev)"
Write-Host "2. Abre http://localhost:3000"
Write-Host "3. Prueba el login con Facebook"
Write-Host ""
Write-Host "✅ ¡Listo para usar!" -ForegroundColor Green
Write-Host ""
