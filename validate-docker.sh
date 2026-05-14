#!/bin/bash

# 🧪 Quick Validation Script for Docker Setup
# Teste si la configuration Docker est correcte

set -e

echo "════════════════════════════════════════════════════════"
echo "  🧪 Docker Setup Validation"
echo "════════════════════════════════════════════════════════"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0

# Fonction pour tester
test_file() {
    local file=$1
    local name=$2
    test_count=$((test_count + 1))

    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $name existe"
        pass_count=$((pass_count + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $name manque: $file"
        return 1
    fi
}

test_command() {
    local cmd=$1
    local name=$2
    test_count=$((test_count + 1))

    if command -v $cmd &> /dev/null; then
        echo -e "${GREEN}✅${NC} $name installé"
        pass_count=$((pass_count + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $name n'est pas installé"
        return 1
    fi
}

test_docker_image() {
    local image=$1
    local name=$2
    test_count=$((test_count + 1))

    if docker image inspect $image &> /dev/null; then
        echo -e "${GREEN}✅${NC} Image Docker $name pullée"
        pass_count=$((pass_count + 1))
        return 0
    else
        echo -e "${YELLOW}⚠️ ${NC} Image Docker $name n'est pas local (sera pullée à la build)"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════
echo "📋 Vérification des fichiers..."
test_file "docker-compose.yml" "docker-compose.yml"
test_file "backend/Dockerfile" "Backend Dockerfile"
test_file "backend/docker/entrypoint.sh" "Backend entrypoint.sh"
test_file "backend/docker/nginx.conf" "Backend nginx.conf"
test_file "backend/docker/supervisord.conf" "Backend supervisord.conf"
test_file "frontend/Dockerfile" "Frontend Dockerfile"
test_file "frontend/docker/entrypoint.sh" "Frontend entrypoint.sh"
test_file "frontend/docker/nginx.conf" "Frontend nginx.conf"

echo ""
echo "🛠️  Vérification des outils..."
test_command "docker" "Docker"
test_command "docker-compose" "Docker Compose"

echo ""
echo "🐳 Vérification des images Docker de base..."
test_docker_image "mysql:8.0" "MySQL 8.0"
test_docker_image "nginx:alpine" "Nginx Alpine"
test_docker_image "node:20-alpine" "Node.js 20 Alpine"
test_docker_image "php:8.2-fpm-alpine" "PHP 8.2 FPM Alpine"

# ═══════════════════════════════════════════════════════════
echo ""
echo "════════════════════════════════════════════════════════"
echo "  📊 Résumé"
echo "════════════════════════════════════════════════════════"
echo "  ✅ Passés: $pass_count/$test_count"
echo ""

if [ $pass_count -eq $test_count ]; then
    echo -e "${GREEN}✨ Tout est prêt !${NC}"
    echo ""
    echo "Démarrer avec :"
    echo "  docker compose up --build"
    exit 0
else
    echo -e "${YELLOW}⚠️  Certaines vérifications n'ont pas passé${NC}"
    echo ""
    echo "Vérifications échouées : $((test_count - pass_count))/$test_count"
    echo ""
    echo "À faire :"
    echo "1. Installer Docker Desktop (https://www.docker.com/products/docker-desktop)"
    echo "2. S'assurer que Docker & Docker Compose fonctionnent"
    echo "3. Réexécuter ce script"
    exit 1
fi
