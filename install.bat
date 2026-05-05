@echo off
echo.
echo 🚀 Instalando dependencias de Eco-Huella...
echo.

echo 📦 Frontend...
call npm install

echo.
echo 📦 Backend...
cd backend
call npm install
cd ..

echo.
echo ✅ Instalación completada
echo.
echo Para ejecutar:
echo 1. Terminal 1: cd backend ^&^& npm run dev
echo 2. Terminal 2: npm run dev
echo.
echo Para inicializar la BD:
echo cd backend ^&^& node seed.js
echo.
pause
