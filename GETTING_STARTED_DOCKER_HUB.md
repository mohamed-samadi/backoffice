# 🎯 Configuration Docker Hub — Guide d'exécution

Bienvenue! Voici les étapes exactes pour configurer et livrer votre projet BizOS vers Docker Hub.

## ⏱️ Durée estimée: 25 minutes (setup une fois)

---

## 📋 Étape 1: Docker Hub Setup (5 minutes)

### 1.1 Créer les dépôts

Allez sur **https://hub.docker.com**

1. Connectez-vous avec votre compte
2. Cliquez sur **Create Repository**
3. **Créer le 1er dépôt:**
   - Repository name: `bizos-backend`
   - Description: `BizOS Backend - Laravel API Service`
   - Visibility: **Public**
   - Cliquez **Create**

4. **Créer le 2ème dépôt:**
   - Repository name: `bizos-frontend`
   - Description: `BizOS Frontend - React Application`
   - Visibility: **Public**
   - Cliquez **Create**

**Résultat:** Vous avez 2 dépôts:

```
https://hub.docker.com/r/redamohamedberhouma/bizos-backend
https://hub.docker.com/r/redamohamedberhouma/bizos-frontend
```

### 1.2 Générer un access token

1. Allez dans **Account Settings** → **Security**
2. Cliquez **New Access Token**
3. Configuration:
   - Token name: `github-actions`
   - Access permissions: **Read & Write**
   - Cliquez **Generate**

4. **Copiez le token** (vous ne pourrez plus le voir après!)

**Exemple:** `dckr_pat_ABC123xyz...`

---

## 🔐 Étape 2: GitHub Secrets Setup (3 minutes)

### 2.1 Aller au dépôt GitHub

1. Allez à votre dépôt GitHub
2. **Settings** → **Secrets and Variables** → **Actions**

### 2.2 Ajouter les secrets

Cliquez **New repository secret** pour chaque secret:

**Secret 1:**

```
Name: DOCKER_USERNAME
Value: redamohamedberhouma
```

**Secret 2:**

```
Name: DOCKER_TOKEN
Value: dckr_pat_ABC123xyz... (votre token Docker Hub)
```

**Secret 3:**

```
Name: VITE_API_URL
Value: http://localhost:8000/api  (pour dev)
     ou https://api.votresite.com (pour prod)
```

**Secret 4:**

```
Name: VITE_STORAGE_URL
Value: http://localhost:8000/storage  (pour dev)
     ou https://api.votresite.com/storage (pour prod)
```

**Résultat:** 4 secrets configurés dans GitHub

---

## 🏗️ Étape 3: Configuration locale (5 minutes)

### 3.1 Créer le .env local

```bash
cd c:\wamp64\www\backoffice

# Copier le template
copy .env.example .env

# Éditer le .env (ouvrir avec un éditeur)
# Vous pouvez garder les valeurs par défaut pour le dev
```

### 3.2 Faire exécutable les scripts

```bash
# Windows: pas besoin pour bash, mais vous pouvez quand même
# Sur Linux/Mac:
chmod +x deliver.sh
chmod +x setup-docker-hub.sh
```

---

## 🧪 Étape 4: Test local (5 minutes)

### 4.1 Démarrer les services

```bash
cd c:\wamp64\www\backoffice

# Démarrer Docker Compose
docker compose up --build -d
```

**Sortie attendue:**

```
Creating app_db ...
Creating app_backend ...
Creating app_frontend ...
✓ Done
```

### 4.2 Vérifier que ça marche

```bash
# Frontend (React)
curl http://localhost:3000
# Résultat: HTML page

# Backend (API Laravel)
curl http://localhost:8000/api/health
# Résultat: JSON response

# Database (PhpMyAdmin)
http://localhost:8080
# Utilisateur: app_user
# Mot de passe: app_password
```

### 4.3 Arrêter (ou continuer)

```bash
# Si vous voulez arrêter maintenant:
docker compose down

# Si vous voulez continuer au test suivant, laissez tourner
```

---

## 📦 Étape 5: Test de livraison (4 minutes)

### 5.1 Configurer les variables d'environnement

**Windows (PowerShell):**

```powershell
$env:DOCKER_USERNAME = "redamohamedberhouma"
$env:DOCKER_TOKEN = "dckr_pat_ABC123xyz..."
```

**Windows (CMD):**

```cmd
set DOCKER_USERNAME=redamohamedberhouma
set DOCKER_TOKEN=dckr_pat_ABC123xyz...
```

**Linux/Mac:**

```bash
export DOCKER_USERNAME=redamohamedberhouma
export DOCKER_TOKEN=dckr_pat_ABC123xyz...
```

### 5.2 Lancer la livraison

```bash
cd c:\wamp64\www\backoffice

./deliver.sh test-version develop
```

**Sortie attendue:**

```
ℹ Building backend image...
✓ Backend image built successfully
ℹ Building frontend image...
✓ Frontend image built successfully
ℹ Pushing backend images...
✓ Pushed docker.io/redamohamedberhouma/bizos-backend:test-version
✓ Delivery complete!
```

### 5.3 Vérifier sur Docker Hub

Allez à: https://hub.docker.com/r/redamohamedberhouma

Vous devriez voir:

- `bizos-backend` avec le tag `test-version`
- `bizos-frontend` avec le tag `test-version`

---

## 🚀 Étape 6: Première livraison réelle (2 minutes)

### 6.1 Lancer la livraison avec version

```bash
./deliver.sh 1.0.0 develop
```

Ou avec Makefile:

```bash
make deliver version=1.0.0 stage=develop
```

### 6.2 Vérifier le résultat

```bash
# Sur Docker Hub
https://hub.docker.com/r/redamohamedberhouma/bizos-backend
```

Vous devriez voir les tags:

- `1.0.0` (votre version)
- `develop` (votre branche)
- `latest` (si main)

---

## 🌍 Étape 7: Configuration production (3 minutes)

### 7.1 Créer .env.production

```bash
# Copier le template
copy .env.example .env.production

# Éditer pour production
# Remplacer:
# - APP_ENV=production
# - APP_DEBUG=false
# - DB_PASSWORD=votre_mot_de_passe_fort
# - VITE_API_URL=https://votresite.com/api
# - VITE_STORAGE_URL=https://votresite.com/storage
```

### 7.2 Déployer en production

**Option 1: Avec docker-compose.prod.yml**

```bash
docker compose -f docker-compose.prod.yml \
  --env-file .env.production up -d
```

**Option 2: Avec Makefile**

```bash
make prod-up
```

### 7.3 Vérifier

```bash
# Voir les services
docker compose -f docker-compose.prod.yml ps

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🔄 Étape 8: Automatisation GitHub (automatique après!)

À partir de maintenant, chaque fois que vous pushez du code:

```bash
git add .
git commit -m "feat: your feature"
git push
```

**Automatiquement:**

1. ✅ GitHub Actions se déclenche
2. ✅ Build les images Docker
3. ✅ Push vers Docker Hub
4. ✅ Crée les tags

Vous pouvez voir la progression dans:

```
GitHub → Actions → docker-build-and-push
```

---

## 📊 Workflow complet

```
1. Développement local
   ↓
   docker compose up --build

2. Tester vos changements
   ↓
   curl http://localhost:3000

3. Commit et push
   ↓
   git push

4. GitHub Actions automatiquement
   ↓
   Build → Push à Docker Hub

5. Production
   ↓
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
```

---

## 📚 Documentation disponible

| Document                  | Contenu                    |
| ------------------------- | -------------------------- |
| `DELIVERY_QUICK_START.md` | ⚡ Quick reference (2 min) |
| `DELIVERY_GUIDE.md`       | 📖 Complete guide (15 min) |
| `DOCKER_HUB_SETUP.md`     | 🔧 Detailed setup (10 min) |
| `DOCKER_ARCHITECTURE.md`  | 🏗️ Technical details       |
| `DEPLOYMENT_CHECKLIST.md` | ✅ Before production       |

**Accès rapide:**

```bash
make help                    # Toutes les commandes
make docs-docker-hub         # Cette doc
cat DELIVERY_GUIDE.md        # Guide complet
```

---

## 💡 Astuces et bonnes pratiques

### Versioning

```bash
# Version de développement
./deliver.sh 1.0.0-dev develop

# Release candidate
./deliver.sh 1.0.0-rc1 staging

# Production release
./deliver.sh 1.0.0 main
```

### Voir les logs

```bash
# Tous les services
docker compose logs -f

# Juste le backend
docker compose logs backend -f

# Juste le frontend
docker compose logs frontend -f
```

### Accès shell

```bash
# Terminal dans le backend
docker compose exec app_backend bash

# Terminal dans le frontend
docker compose exec app_frontend sh

# MySQL CLI
docker compose exec db mysql -u app_user -p app_db
```

### Nettoyer

```bash
# Arrêter tout
docker compose down

# Supprimer les volumes (⚠️ perte de données)
docker compose down -v

# Nettoyer les images inutilisées
docker system prune
```

---

## 🆘 Troubleshooting rapide

| Problème                        | Solution                                                      |
| ------------------------------- | ------------------------------------------------------------- |
| **"docker: command not found"** | Installer Docker: https://docker.com/download                 |
| **Port 3000 déjà utilisé**      | Changer port dans `docker-compose.yml` (ports: "3001:80")     |
| **Erreur "403 Unauthorized"**   | Vérifier `DOCKER_TOKEN` dans GitHub Secrets                   |
| **Build échoue**                | Lancer `docker compose down` puis `docker compose up --build` |
| **Base de données non trouvée** | Vérifier que `db` service a démarré: `docker compose ps`      |
| **Images ne se poussent pas**   | Vérifier credentials: `docker login`                          |

---

## ✨ Prochaines étapes (optionnel)

- [ ] Ajouter des tests dans le workflow CI/CD
- [ ] Configurer des webhooks de déploiement
- [ ] Ajouter Redis pour les caches
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Backup automatisé
- [ ] CDN Cloudflare

---

## 🎉 Félicitations!

Vous avez mis en place:

- ✅ Docker Hub push automatisé
- ✅ GitHub Actions CI/CD
- ✅ Déploiement production
- ✅ Volumes et persistence
- ✅ Health checks et monitoring

**Prêt à déployer le monde! 🚀**

---

**Questions?** Consultez la documentation:

```bash
make help
cat DELIVERY_GUIDE.md
```
