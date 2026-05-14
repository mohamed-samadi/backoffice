# 📦 Guide Complet - Livraison Docker Hub Automatisée

## 📋 Table des matières

1. [Configuration initiale](#configuration-initiale)
2. [Déploiement local](#déploiement-local)
3. [Livraison vers Docker Hub](#livraison-vers-docker-hub)
4. [Automatisation GitHub Actions](#automatisation-github-actions)
5. [Déploiement en production](#déploiement-en-production)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Configuration initiale

### Étape 1: Créer les dépôts Docker Hub

Allez sur [hub.docker.com](https://hub.docker.com):

1. **Créer le dépôt Backend:**
   - Nom: `bizos-backend`
   - Description: `BizOS Backend - Laravel API Service`
   - Visibilité: Public (ou Private selon vos préférences)

2. **Créer le dépôt Frontend:**
   - Nom: `bizos-frontend`
   - Description: `BizOS Frontend - React Application`
   - Visibilité: Public

### Étape 2: Générer un token d'accès Docker Hub

1. Allez à **Account Settings** → **Security** → **Access Tokens**
2. Cliquez **New Access Token**
3. Configuration:
   - Token name: `github-actions`
   - Permissions: `Read & Write`
4. Copiez le token (vous en aurez besoin)

### Étape 3: Configurer les secrets GitHub

Dans votre dépôt GitHub, allez à **Settings** → **Secrets and Variables** → **Actions**

Créez ces secrets:

```
DOCKER_USERNAME = redamohamedberhouma
DOCKER_TOKEN = votre_token_docker_hub
VITE_API_URL = https://api.votresite.com
VITE_STORAGE_URL = https://api.votresite.com/storage
```

**Pour développement local:**

```
VITE_API_URL = http://localhost:8000/api
VITE_STORAGE_URL = http://localhost:8000/storage
```

---

## 🚀 Déploiement local

### Commandes de base

```bash
# 1. Initialiser le projet (première fois)
make init
# ou
bash init-docker.sh

# 2. Démarrer les services
docker compose up --build -d

# ou plus simplement:
make up

# 3. Vérifier le statut
make ps

# 4. Voir les logs
make logs

# 5. Arrêter
make down
```

### Vérifier que tout fonctionne

```bash
# Frontend
curl http://localhost:3000

# Backend API
curl http://localhost:8000/api/health

# PhpMyAdmin
http://localhost:8080
# Utilisateur: app_user
# Mot de passe: app_password (du .env)
```

---

## 📦 Livraison vers Docker Hub

### Option 1: Script de livraison automatisé

```bash
# 1. Définir les variables d'environnement
export DOCKER_USERNAME=redamohamedberhouma
export DOCKER_TOKEN=votre_token_docker_hub

# 2. Rendre le script exécutable (première fois)
chmod +x deliver.sh

# 3. Lancer la livraison
./deliver.sh 1.0.0 develop

# Exemples:
./deliver.sh 1.0.0 production
./deliver.sh 1.0.0-rc1 staging
./deliver.sh latest main
```

**Sortie attendue:**

```
✓ Successfully built and pushed images
Backend: docker.io/redamohamedberhouma/bizos-backend:1.0.0
Frontend: docker.io/redamohamedberhouma/bizos-frontend:1.0.0
```

### Option 2: Build et push manuels

```bash
# Login (une fois)
docker login

# Build backend
docker build -f backend/Dockerfile \
  -t redamohamedberhouma/bizos-backend:1.0.0 .

# Build frontend
docker build -f frontend/Dockerfile \
  --build-arg VITE_API_URL=http://localhost:8000/api \
  --build-arg VITE_STORAGE_URL=http://localhost:8000/storage \
  -t redamohamedberhouma/bizos-frontend:1.0.0 .

# Push
docker push redamohamedberhouma/bizos-backend:1.0.0
docker push redamohamedberhouma/bizos-frontend:1.0.0
```

### Option 3: Utiliser Makefile

```bash
# Configuration Docker Hub
make docker-hub-setup

# Login Docker
make docker-login

# Livrer vers Docker Hub
make deliver version=1.0.0 stage=develop

# Build local
make docker-build-local

# Build production
make docker-build-prod
```

---

## 🔄 Automatisation GitHub Actions

Le workflow `.github/workflows/docker-build-and-push.yml` fait:

✅ **Déclenché par:**

- Push sur `main`, `develop`, `staging`
- Pull requests
- Manuellement via `workflow_dispatch`

✅ **Actions:**

1. Checkout du code
2. Setup Docker Buildx
3. Login à Docker Hub
4. Build des images
5. Push vers Docker Hub
6. Tags multiples (version, branche, sha)
7. Mise à jour descriptions Docker Hub

### Voir les workflows

```
GitHub → Actions → docker-build-and-push
```

Vous verrez:

- ✅ **Succès** = Images pushées
- ❌ **Erreur** = Vérifiez les logs

### Tags générés automatiquement

```
redamohamedberhouma/bizos-backend:
  - latest (branche main)
  - develop (branche develop)
  - main (branche main)
  - sha-xxxxx (hash du commit)
  - v1.0.0 (releases GitHub)
```

---

## 🌍 Déploiement en production

### Configuration .env de production

```bash
cp .env.example .env.production

# Éditer .env.production
nano .env.production
```

Contenu recommandé:

```env
APP_NAME=BizOS
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:VOTRE_CLE_GENEREE
APP_URL=https://votresite.com

DB_ROOT_PASSWORD=mot_de_passe_tres_fort_production
DB_DATABASE=bizos_prod
DB_USERNAME=bizos_user
DB_PASSWORD=mot_de_passe_tres_fort_production

VITE_API_URL=https://api.votresite.com
VITE_STORAGE_URL=https://api.votresite.com/storage

DOCKER_USERNAME=redamohamedberhouma
BACKEND_IMAGE_TAG=latest
FRONTEND_IMAGE_TAG=latest
```

### Déployer en production

```bash
# Option 1: Avec docker-compose.prod.yml (utilise Docker Hub)
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Option 2: Avec Makefile
make prod-up

# Option 3: Pull les images depuis Docker Hub, puis démarrer
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Vérifier la production

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f

# Statut
docker compose -f docker-compose.prod.yml ps

# Santé
curl https://votresite.com/api/health
```

### Mettre à jour la production

```bash
# Cas 1: Nouvelle version depuis Docker Hub
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Cas 2: Version spécifique
BACKEND_IMAGE_TAG=1.0.0 FRONTEND_IMAGE_TAG=1.0.0 \
  docker compose -f docker-compose.prod.yml up -d

# Cas 3: Via Makefile
make prod-pull
make prod-restart
```

---

## 📊 Volume et données

### Volumes utilisés

```yaml
db_data_prod: # Base de données MySQL
storage_data_prod: # Fichiers uploadés
```

### Backup de la base de données

```bash
# Créer un backup
docker compose -f docker-compose.prod.yml exec db mysqldump \
  -u bizos_user -p bizos_prod > backup_2025-01-14.sql

# Restaurer depuis un backup
docker compose -f docker-compose.prod.yml exec -T db mysql \
  -u bizos_user -p bizos_prod < backup_2025-01-14.sql

# Ou avec Makefile
make db-backup
make db-restore file="backups/backup_20250114.sql"
```

---

## 🔍 Monitoring et logs

### Logs en temps réel

```bash
# Tous les services
docker compose -f docker-compose.prod.yml logs -f

# Backend uniquement
docker compose -f docker-compose.prod.yml logs backend -f

# Frontend uniquement
docker compose -f docker-compose.prod.yml logs frontend -f

# Database uniquement
docker compose -f docker-compose.prod.yml logs db -f
```

### Accès aux containers

```bash
# Shell backend
docker compose exec app_backend_prod bash

# Shell frontend
docker compose exec app_frontend_prod sh

# MySQL CLI
docker compose exec db mysql -u bizos_user -p bizos_prod
```

### Health checks

Les healthchecks automatiques sont configurés:

```
Backend:  curl http://localhost/health
Frontend: wget http://localhost/
Database: mysqladmin ping
```

Vérifier l'état:

```bash
docker compose ps
# Status: healthy/unhealthy
```

---

## 🛠️ Troubleshooting

### Problème 1: Les images ne se poussent pas sur Docker Hub

```bash
# Vérifier la connexion Docker
docker login

# Vérifier les secrets GitHub
GitHub → Settings → Secrets → Vérifier DOCKER_USERNAME et DOCKER_TOKEN

# Tester localement
export DOCKER_USERNAME=redamohamedberhouma
export DOCKER_TOKEN=votre_token
./deliver.sh test-version develop
```

### Problème 2: Le build échoue

```bash
# Vérifier les logs du workflow GitHub
GitHub → Actions → docker-build-and-push → Voir les détails

# Tester localement
docker compose up --build

# Vérifier les erreurs
docker compose logs backend
docker compose logs frontend
```

### Problème 3: Les conteneurs ne démarrent pas en production

```bash
# Vérifier les volumes
docker volume ls

# Vérifier le réseau
docker network ls

# Lancer avec plus de détails
docker compose -f docker-compose.prod.yml --verbose up

# Vérifier les variables d'environnement
cat .env.production | grep -E "DOCKER|IMAGE"
```

### Problème 4: Les ports sont en conflit

```bash
# Voir quel processus utilise le port
netstat -tlnp | grep 8000  # Linux
netstat -ao | grep 8000    # Windows

# Changer les ports dans docker-compose.yml
# Ou arrêter les autres services:
docker compose down
docker container prune
```

### Problème 5: Base de données ne démarre pas

```bash
# Vérifier les permissions des volumes
docker volume inspect db_data_prod

# Nettoyer et recommencer
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d

# Vérifier les logs MySQL
docker compose logs db
```

---

## ✅ Checklist complète

- [ ] Docker Hub dépôts créés
- [ ] Token Docker Hub généré et copié
- [ ] Secrets GitHub configurés
- [ ] `.env.example` mis à jour
- [ ] `deliver.sh` rendu exécutable
- [ ] GitHub Actions workflow créé
- [ ] Test local: `docker compose up --build`
- [ ] Test livraison: `./deliver.sh test-version develop`
- [ ] Images visibles sur Docker Hub
- [ ] `.env.production` configuré
- [ ] Déploiement production testé
- [ ] Backup base de données automatisé
- [ ] Monitoring et logs configurés

---

## 📚 Documentation additionnelle

- [DOCKER_HUB_SETUP.md](DOCKER_HUB_SETUP.md) — Configuration détaillée
- [DOCKER_SETUP.md](DOCKER_SETUP.md) — Usage du docker-compose dev
- [DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md) — Détails techniques
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) — Avant de produire

---

## 🚀 Commandes rapides

```bash
# Développement
docker compose up --build -d     # Démarrer
docker compose down              # Arrêter
make logs                        # Voir les logs

# Livraison
export DOCKER_USERNAME=redamohamedberhouma
export DOCKER_TOKEN=votre_token
./deliver.sh 1.0.0 develop      # Livrer

# Production
docker compose -f docker-compose.prod.yml \
  --env-file .env.production up -d
```

---

**Besoin d'aide?** Consultez la documentation ou exécutez:

```bash
make docs-docker-hub
make help
```
