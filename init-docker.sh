#!/bin/bash

# 🐳 Script d'initialisation Docker — BizOS
# Ce script automatise le démarrage initial

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🐳 BizOS — Docker Initialization               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 1. Vérifier que Docker et Docker Compose sont installés
# ───────────────────────────────────────────────────────────────────────────
echo "▶ Vérification des dépendances..."
if ! command -v docker &> /dev/null; then
  echo "❌ Docker n'est pas installé. Visitez https://docker.com"
  exit 1
fi

if ! command -v docker compose &> /dev/null; then
  echo "❌ Docker Compose n'est pas installé."
  exit 1
fi

echo "✅ Docker et Docker Compose détectés"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 2. Créer le fichier .env s'il n'existe pas
# ───────────────────────────────────────────────────────────────────────────
if [ -f .env ]; then
  echo "⚠️  Le fichier .env existe déjà."
  read -p "Voulez-vous le régénérer ? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "ℹ️  Utilisation du .env existant"
  else
    cp .env.example .env
    echo "✅ .env régénéré depuis .env.example"
  fi
else
  cp .env.example .env
  echo "✅ .env créé depuis .env.example"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# 3. Générer APP_KEY
# ───────────────────────────────────────────────────────────────────────────
echo "▶ Génération de la clé APP_KEY..."
APP_KEY=$(docker run --rm php:8.2-cli php -r "echo 'base64:'.base64_encode(random_bytes(32));" 2>/dev/null)
echo "  Clé générée: $APP_KEY"

# Remplacer dans .env (compatible macOS et Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|APP_KEY=.*|APP_KEY=$APP_KEY|g" .env
else
  sed -i "s|APP_KEY=.*|APP_KEY=$APP_KEY|g" .env
fi

echo "✅ APP_KEY écrit dans .env"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 4. Build et démarrage
# ───────────────────────────────────────────────────────────────────────────
echo "▶ Build des images Docker..."
docker compose build

echo ""
echo "▶ Démarrage des containers..."
docker compose up -d

echo ""

# ───────────────────────────────────────────────────────────────────────────
# 5. Attendre la santé de la DB
# ───────────────────────────────────────────────────────────────────────────
echo "▶ Attente de la base de données..."
until docker compose exec -T db mysqladmin ping -u app_user -p"app_password" 2>/dev/null > /dev/null; do
  echo "  ⏳ Attente 2s..."
  sleep 2
done

echo "✅ Base de données prête"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 6. Status final
# ───────────────────────────────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Prêt à l'emploi!                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Services disponibles:"
echo "   🔗 Backend:    http://localhost:8000"
echo "   🔗 Frontend:   http://localhost:3000"
echo "   🔗 PhpMyAdmin: http://localhost:8080"
echo "   🔗 Database:   localhost:3306"
echo ""
echo "📖 Commandes utiles:"
echo "   docker compose logs backend -f      # Logs en temps réel"
echo "   docker compose exec backend bash    # Terminal Laravel"
echo "   docker compose down                 # Arrêter"
echo ""
echo "💡 Voir DOCKER_SETUP.md pour plus de détails"
echo ""
