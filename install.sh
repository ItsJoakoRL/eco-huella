#!/bin/bash

echo "🚀 Instalando dependencias de Eco-Huella..."

echo "📦 Frontend..."
npm install

echo "📦 Backend..."
cd backend
npm install
cd ..

echo "✅ Instalación completada"
echo ""
echo "Para ejecutar:"
echo "npm run dev:all"
echo ""
echo "Para inicializar la BD:"
echo "cd backend && node seed.js"
