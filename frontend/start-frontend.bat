@echo off
echo ========================================
echo   Iniciando Frontend - Influencers
echo ========================================
echo.

echo Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
)

echo.
echo Iniciando servidor de desarrollo...
echo.
echo Frontend: http://localhost:3000
echo.
echo ========================================

call npm run dev
