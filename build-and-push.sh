#!/bin/bash

# 🐳 Script de Build & Push Docker Hub
# Utilisation: ./build-and-push.sh v1.0.0

set -e

# ───────────────────────────────────────────────────────────────────────────
# Vérification des paramètres
# ───────────────────────────────────────────────────────────────────────────

if [ -z "$1" ]; then
  echo "❌ Erreur: Version manquante"
  echo ""
  echo "Usage: ./build-and-push.sh <version>"
  echo "Exemples:"
  echo "  ./build-and-push.sh v1.0.0"
  echo "  ./build-and-push.sh v1.1.0-beta"
  exit 1
fi

VERSION=$1
DOCKER_USERNAME=${DOCKER_USERNAME:-$(git config user.name)}

if [ -z "$DOCKER_USERNAME" ]; then
  echo "❌ DOCKER_USERNAME non défini"
  echo ""
  echo "Définissez DOCKER_USERNAME:"
  echo "  export DOCKER_USERNAME=ton-username"
  echo "  ./build-and-push.sh v1.0.0"
  exit 1
fi

# ───────────────────────────────────────────────────────────────────────────
# Vérification Docker
# ───────────────────────────────────────────────────────────────────────────

if ! command -v docker &> /dev/null; then
  echo "❌ Docker n'est pas installé"
  exit 1
fi

# Vérifier si connecté à Docker Hub
if ! docker info &>/dev/null; then
  echo "❌ Docker daemon ne répond pas"
  echo "Assurez-vous que Docker Desktop est démarré"
  exit 1
fi

# ───────────────────────────────────────────────────────────────────────────
# Vérifier authentification Docker Hub
# ───────────────────────────────────────────────────────────────────────────

echo "▶ Vérification authentification Docker Hub..."
if ! docker images > /dev/null 2>&1; then
  echo "❌ Pas connecté à Docker Hub"
  echo ""
  echo "Connectez-vous avec:"
  echo "  docker login"
  exit 1
fi

echo "✅ Connecté à Docker Hub"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# Configuration
# ───────────────────────────────────────────────────────────────────────────

BACKEND_IMAGE="$DOCKER_USERNAME/app-backend"
FRONTEND_IMAGE="$DOCKER_USERNAME/app-frontend"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🐳 Build & Push Docker Hub                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Configuration:"
echo "  Version:        $VERSION"
echo "  Username:       $DOCKER_USERNAME"
echo "  Backend:        $BACKEND_IMAGE:$VERSION"
echo "  Frontend:       $FRONTEND_IMAGE:$VERSION"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# Build Backend
# ───────────────────────────────────────────────────────────────────────────

echo "▶ Build Backend..."
docker build \
  -t "$BACKEND_IMAGE:$VERSION" \
  -t "$BACKEND_IMAGE:latest" \
  --progress=plain \
  ./backend

if [ $? -eq 0 ]; then
  echo "✅ Backend image built"
else
  echo "❌ Backend build failed"
  exit 1
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Build Frontend (with env vars from .env or defaults)
# ───────────────────────────────────────────────────────────────────────────

echo "▶ Build Frontend..."

# Charger les variables si .env existe
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Defaults si pas de .env
VITE_API_URL=${VITE_API_URL:-"http://ton-domaine.com/api"}
VITE_STORAGE_URL=${VITE_STORAGE_URL:-"http://ton-domaine.com/storage"}

echo "  VITE_API_URL=$VITE_API_URL"
echo "  VITE_STORAGE_URL=$VITE_STORAGE_URL"

docker build \
  --build-arg VITE_API_URL="$VITE_API_URL" \
  --build-arg VITE_STORAGE_URL="$VITE_STORAGE_URL" \
  -t "$FRONTEND_IMAGE:$VERSION" \
  -t "$FRONTEND_IMAGE:latest" \
  --progress=plain \
  ./frontend

if [ $? -eq 0 ]; then
  echo "✅ Frontend image built"
else
  echo "❌ Frontend build failed"
  exit 1
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Push Backend
# ───────────────────────────────────────────────────────────────────────────

echo "▶ Push Backend..."
docker push "$BACKEND_IMAGE:$VERSION"
docker push "$BACKEND_IMAGE:latest"

if [ $? -eq 0 ]; then
  echo "✅ Backend pushed"
else
  echo "❌ Backend push failed"
  exit 1
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Push Frontend
# ───────────────────────────────────────────────────────────────────────────

echo "▶ Push Frontend..."
docker push "$FRONTEND_IMAGE:$VERSION"
docker push "$FRONTEND_IMAGE:latest"

if [ $? -eq 0 ]; then
  echo "✅ Frontend pushed"
else
  echo "❌ Frontend push failed"
  exit 1
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Success
# ───────────────────────────────────────────────────────────────────────────

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ Succès!                               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 Images publiées sur Docker Hub:"
echo "   Backend:  $BACKEND_IMAGE:$VERSION"
echo "   Frontend: $FRONTEND_IMAGE:$VERSION"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Tagger la version:"
echo "      git tag $VERSION"
echo "      git push origin $VERSION"
echo ""
echo "   2. Ou déployer immédiatement:"
echo "      docker compose -f docker-compose.prod.yml up -d --pull always"
echo ""
