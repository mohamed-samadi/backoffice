#!/bin/bash

# 🏷️ Script de Versioning et Release
# Utilisation: ./release.sh v1.0.0

set -e

# ───────────────────────────────────────────────────────────────────────────
# Couleurs
# ───────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ───────────────────────────────────────────────────────────────────────────
# Vérifications
# ───────────────────────────────────────────────────────────────────────────

if [ -z "$1" ]; then
  echo -e "${RED}❌ Erreur: Version manquante${NC}"
  echo ""
  echo "Usage: ./release.sh <version>"
  echo "Exemples:"
  echo "  ./release.sh v1.0.0"
  echo "  ./release.sh v1.1.0"
  echo "  ./release.sh v2.0.0-beta"
  exit 1
fi

VERSION=$1

# Vérifier que c'est un format valide (v*.*.*)
if ! [[ $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9] ]]; then
  echo -e "${RED}❌ Format invalide: $VERSION${NC}"
  echo ""
  echo "Format attendu: v<MAJOR>.<MINOR>.<PATCH>"
  echo "Exemples: v1.0.0, v1.1.0, v2.0.0"
  exit 1
fi

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "docker-compose.prod.yml" ]; then
  echo -e "${RED}❌ Erreur: docker-compose.prod.yml non trouvé${NC}"
  echo "Assurez-vous d'être dans le répertoire racine du projet"
  exit 1
fi

# Vérifier qu'on est sur main/master
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo -e "${YELLOW}⚠️  Vous êtes sur '$CURRENT_BRANCH', pas sur 'main'${NC}"
  read -p "Continuer? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Vérifier qu'il n'y a pas de changements non-committed
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ Erreur: Il y a des changements non-committed${NC}"
  echo ""
  echo "Committez d'abord:"
  echo "  git add ."
  echo "  git commit -m 'Message du commit'"
  exit 1
fi

# Vérifier que le tag n'existe pas déjà
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo -e "${RED}❌ Erreur: Le tag $VERSION existe déjà${NC}"
  exit 1
fi

# ───────────────────────────────────────────────────────────────────────────
# Afficher les infos
# ───────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🏷️  Release: $VERSION${NC}${BLUE}                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📋 Infos:"
echo "  Branch:  $CURRENT_BRANCH"
echo "  Version: $VERSION"
echo "  Commit:  $(git rev-parse --short HEAD)"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# Demander confirmation
# ───────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}⚠️  Cela va:${NC}"
echo "  1. Créer un tag git: $VERSION"
echo "  2. Pousser le tag sur GitHub"
echo "  3. Déclencher GitHub Actions pour build & push"
echo ""

read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Annulé."
  exit 0
fi

# ───────────────────────────────────────────────────────────────────────────
# Créer le tag
# ───────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}▶ Création du tag...${NC}"
git tag -a "$VERSION" -m "Release $VERSION"
echo -e "${GREEN}✅ Tag créé: $VERSION${NC}"

# ───────────────────────────────────────────────────────────────────────────
# Pousser le tag
# ───────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}▶ Poussée du tag sur GitHub...${NC}"
git push origin "$VERSION"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Tag pushé${NC}"
else
  echo -e "${RED}❌ Erreur lors du push${NC}"
  exit 1
fi

# ───────────────────────────────────────────────────────────────────────────
# Afficher les prochaines étapes
# ───────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ Release lancée!${NC}${GREEN}                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📦 Prochaines étapes:"
echo ""
echo "  1️⃣  Vérifier GitHub Actions:"
echo "     https://github.com/YOUR-ORG/YOUR-REPO/actions"
echo "     (Attendre le ✅ green checkmark ~ 5-10 minutes)"
echo ""
echo "  2️⃣  Vérifier Docker Hub:"
echo "     https://hub.docker.com/r/YOUR-USERNAME/app-backend/tags"
echo "     https://hub.docker.com/r/YOUR-USERNAME/app-frontend/tags"
echo ""
echo "  3️⃣  Vérifier GitHub Release (créée automatiquement):"
echo "     https://github.com/YOUR-ORG/YOUR-REPO/releases"
echo ""
echo "  4️⃣  Informer le client:"
echo "     Version $VERSION est maintenant disponible"
echo "     Ils doivent éditer .env avec: IMAGE_TAG=$VERSION"
echo ""
echo "  5️⃣  Le client met à jour:"
echo "     nano .env          # IMAGE_TAG=$VERSION"
echo "     docker compose -f docker-compose.prod.yml pull"
echo "     docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "📊 Commandes utiles:"
echo "  # Voir tous les tags
echo "  git tag -l"
echo ""
echo "  # Voir les logs du push
echo "  git log --oneline -5"
echo ""
echo "  # Vérifier l'état GitHub Actions
echo "  # (Attendre un email GitHub Actions ou vérifier manuellement)"
echo ""
echo -e "${GREEN}🎉 Release $VERSION en cours de déploiement!${NC}"
echo ""
