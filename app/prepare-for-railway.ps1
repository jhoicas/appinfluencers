# Script para preparar la aplicación para despliegue en Railway

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Preparando para Railway Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: Ejecuta este script en la carpeta raíz del backend (Influencers)" -ForegroundColor Red
    exit
}

# Paso 1: Mover frontend a la carpeta del backend
$frontendPath = "..\Downloads\New folder\InfluencersFront"
$targetPath = ".\frontend"

if (Test-Path $targetPath) {
    Write-Host "⚠️  La carpeta frontend ya existe." -ForegroundColor Yellow
    $overwrite = Read-Host "¿Deseas sobrescribirla? (s/n)"
    
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "❌ Operación cancelada." -ForegroundColor Red
        exit
    }
    
    Remove-Item -Path $targetPath -Recurse -Force
}

Write-Host "📁 Moviendo frontend..." -ForegroundColor Green
Copy-Item -Path $frontendPath -Destination $targetPath -Recurse
Write-Host "✅ Frontend movido a ./frontend" -ForegroundColor Green

# Paso 2: Actualizar docker-compose.yml
Write-Host "📝 Actualizando docker-compose.yml..." -ForegroundColor Green

$newDockerCompose = @"
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: `$`{POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: `$`{POSTGRES_PASSWORD:-password}
      POSTGRES_DB: `$`{POSTGRES_DB:-influencers}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    environment:
      DATABASE_URL: postgresql+asyncpg://`$`{POSTGRES_USER:-postgres}:`$`{POSTGRES_PASSWORD:-password}@db:5432/`$`{POSTGRES_DB:-influencers}
      SECRET_KEY: `$`{SECRET_KEY}
      FACEBOOK_APP_ID: `$`{FACEBOOK_APP_ID}
      FACEBOOK_APP_SECRET: `$`{FACEBOOK_APP_SECRET}
      TIKTOK_CLIENT_KEY: `$`{TIKTOK_CLIENT_KEY}
      TIKTOK_CLIENT_SECRET: `$`{TIKTOK_CLIENT_SECRET}
      ENVIRONMENT: production
      DEBUG: "false"
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: `$`{RAILWAY_PUBLIC_URL}/api
      NEXT_PUBLIC_FACEBOOK_APP_ID: `$`{FACEBOOK_APP_ID}
    depends_on:
      - api

volumes:
  postgres_data:
"@

$newDockerCompose | Out-File -FilePath "docker-compose.yml" -Encoding UTF8
Write-Host "✅ docker-compose.yml actualizado" -ForegroundColor Green

# Paso 3: Crear Dockerfile para frontend
Write-Host "📝 Creando Dockerfile para frontend..." -ForegroundColor Green

$frontendDockerfile = @"
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "run", "build", "&&", "npm", "start"]
"@

$frontendDockerfile | Out-File -FilePath "frontend/Dockerfile" -Encoding UTF8
Write-Host "✅ Frontend Dockerfile creado" -ForegroundColor Green

# Paso 4: Crear railway.toml
Write-Host "📝 Creando railway.toml..." -ForegroundColor Green

$railwayToml = @"
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "docker-compose up"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
"@

$railwayToml | Out-File -FilePath "railway.toml" -Encoding UTF8
Write-Host "✅ railway.toml creado" -ForegroundColor Green

# Paso 5: Actualizar .gitignore
Write-Host "📝 Actualizando .gitignore..." -ForegroundColor Green

$gitignoreContent = @"
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.ENV/
env.bak/
venv.bak/

# Database
*.db
*.sqlite3

# Docker
.dockerignore

# Railway
railway.toml

# Frontend
frontend/.next/
frontend/out/
frontend/build/
frontend/.env.local
frontend/.env.development.local
frontend/.env.test.local
frontend/.env.production.local
frontend/npm-debug.log*
frontend/yarn-debug.log*
frontend/yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
"@

$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
Write-Host "✅ .gitignore actualizado" -ForegroundColor Green

# Paso 6: Verificar estructura
Write-Host ""
Write-Host "📁 Estructura de carpetas creada:" -ForegroundColor Cyan
Get-ChildItem -Path . -Directory | Where-Object { $_.Name -in @("app", "frontend", "alembic", "scripts") } | ForEach-Object {
    Write-Host "  📂 $($_.Name)/" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📄 Archivos creados/actualizados:" -ForegroundColor Cyan
Get-ChildItem -Path . -File | Where-Object { $_.Name -in @("docker-compose.yml", "railway.toml", ".gitignore") } | ForEach-Object {
    Write-Host "  📄 $($_.Name)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ ¡Preparación completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Revisa los cambios creados:"
Write-Host "   - docker-compose.yml (unificado)"
Write-Host "   - frontend/ (movido del otro proyecto)"
Write-Host "   - railway.toml (configuración de Railway)"
Write-Host ""
Write-Host "2. Sube a GitHub:"
Write-Host "   git add ."
Write-Host "   git commit -m 'Prepare for Railway deployment'"
Write-Host "   git push origin main"
Write-Host ""
Write-Host "3. Ve a Railway.app y despliega:"
Write-Host "   - New Project → Deploy from GitHub"
Write-Host "   - Configura variables de entorno"
Write-Host "   - ¡Listo!"
Write-Host ""
Write-Host "📖 Guía completa: RAILWAY_DEPLOY.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 ¡Tu aplicación está lista para producción!" -ForegroundColor Green
Write-Host ""
