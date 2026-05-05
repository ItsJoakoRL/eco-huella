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
echo "1. Terminal 1: cd backend && npm run dev"
echo "2. Terminal 2: npm run dev"
echo ""
echo "Para inicializar la BD:"
echo "cd backend && node seed.js"
