#!/bin/bash

# 🚀 Simple Docker Deployment Starter
# Usage: ./start-docker.sh

set -e

echo "=========================================="
echo "  🚀 Starting Full-Stack Application"
echo "=========================================="
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker found"
echo ""

# Vérifier les fichiers nécessaires
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found in current directory"
    exit 1
fi

echo "📁 Building and starting containers..."
echo ""

# Lancer Docker Compose
docker compose up --build

echo ""
echo "=========================================="
echo "  ✨ Application Started!"
echo "=========================================="
echo ""
echo "  🎨 Frontend  : http://localhost:3000"
echo "  📡 Backend   : http://localhost:8000"
echo "  🗄️  MySQL    : localhost:3306"
echo ""
echo "  Press Ctrl+C to stop"
echo ""
