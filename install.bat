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
echo start-dev.bat
echo.
echo Para inicializar la BD:
echo cd backend ^&^& node seed.js
echo.
pause
