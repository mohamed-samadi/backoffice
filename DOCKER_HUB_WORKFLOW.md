# 🐳 Workflow Docker Hub Complet

Guide complet pour build, push et déployer les images sur Docker Hub avec GitHub Actions.

---

## 📊 Vue d'ensemble du Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Développement                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Faire les changements du code                                  │
│  2. Merger en main (ou tag une version)                            │
│  3. git tag v1.0.0                                                 │
│  4. git push origin v1.0.0                                         │
│                                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Automatique)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Détecte le tag v1.0.0                                          │
│  2. Checkout le code                                               │
│  3. Build Backend image                                            │
│  4. Build Frontend image                                           │
│  5. Push sur Docker Hub (v1.0.0 + latest)                         │
│  6. Crée une GitHub Release                                        │
│                                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Docker Hub                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ton-username/app-backend:v1.0.0                                   │
│  ton-username/app-backend:latest                                   │
│                                                                     │
│  ton-username/app-frontend:v1.0.0                                  │
│  ton-username/app-frontend:latest                                  │
│                                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Client / Production Server                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Éditer .env                                                     │
│     IMAGE_TAG=v1.0.0                                               │
│     DOCKER_USERNAME=ton-username                                   │
│                                                                     │
│  2. docker compose -f docker-compose.prod.yml pull                 │
│  3. docker compose -f docker-compose.prod.yml up -d                │
│                                                                     │
│  ✅ Application live                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Setup Initial (Une seule fois)

### 1️⃣ Créer les repositories Docker Hub

```
Visiter: https://hub.docker.com
Sign in / Create account

Créer deux repositories PUBLIC:
  ✅ ton-username/app-backend
  ✅ ton-username/app-frontend
```

### 2️⃣ Générer un token Docker Hub

```
Docker Hub → Account Settings → Security → New Access Token

Permissions:
  ✅ Read, write, delete

Copier le token (exemple: 1a2b3c4d5e6f7g8h9i0j)
```

### 3️⃣ Ajouter les secrets à GitHub

```
GitHub Repository → Settings → Secrets and variables → Actions

Ajouter ces secrets:

DOCKERHUB_USERNAME     = ton-username
DOCKERHUB_TOKEN        = (le token généré ci-dessus)
VITE_API_URL           = http://ton-domaine.com/api
VITE_STORAGE_URL       = http://ton-domaine.com/storage
```

### 4️⃣ Vérifier le workflow (optionnel)

```
GitHub Repository → Actions → Deploy

Doit voir: "Build & Push Docker Hub"
```

---

## 🚀 Workflow Quotidien

### Option 1 — Utiliser GitHub Actions (Automatique) ⭐ RECOMMANDÉ

```bash
# 1. Développer normally
git add .
git commit -m "Feature: add new credit type"
git push origin main

# 2. Quand prêt à déployer
git tag v1.0.0              # Créer un tag
git push origin v1.0.0      # Pousser le tag

# 3. GitHub Actions prend le relais automatiquement
# → Les images sont buildées et pushées sur Docker Hub
# → Une GitHub Release est créée

# 4. Vérifier la progression
# GitHub Repo → Actions (ou → Releases)
```

### Option 2 — Script Local (Si GitHub Actions ne fonctionne pas)

```bash
# 1. Définir vos credentials
export DOCKER_USERNAME=ton-username  # Ou ajouter dans ~/.bashrc
docker login                          # Username + Password

# 2. Builder et pusher localement
bash build-and-push.sh v1.0.0

# 3. Le script va:
# → Vérifier vos credentials
# → Builder Backend image
# → Builder Frontend image
# → Pusher les deux images
# → Afficher les commandes de déploiement
```

### Option 3 — Manuellement (Pour développeurs)

```bash
# Backend
docker build -t ton-username/app-backend:v1.0.0 -t ton-username/app-backend:latest ./backend
docker push ton-username/app-backend:v1.0.0
docker push ton-username/app-backend:latest

# Frontend (avec variables d'env)
docker build \
  --build-arg VITE_API_URL=http://ton-domaine.com/api \
  --build-arg VITE_STORAGE_URL=http://ton-domaine.com/storage \
  -t ton-username/app-frontend:v1.0.0 \
  -t ton-username/app-frontend:latest \
  ./frontend

docker push ton-username/app-frontend:v1.0.0
docker push ton-username/app-frontend:latest
```

---

## 📦 Déployer chez le Client

Une fois les images sur Docker Hub, le client fait:

```bash
# 1. Éditer .env avec les bonnes valeurs
nano .env

# 2. S'assurer que IMAGE_TAG est correct
grep IMAGE_TAG .env      # ex: v1.0.0

# 3. Démarrer l'application
docker compose -f docker-compose.prod.yml up -d --pull always

# 4. Vérifier
docker compose -f docker-compose.prod.yml ps
```

---

## 🔍 Vérifier que Tout Fonctionne

### Sur Docker Hub

```
Visiter: https://hub.docker.com/r/ton-username/app-backend/tags
         https://hub.docker.com/r/ton-username/app-frontend/tags

Doit voir:
  ✅ v1.0.0
  ✅ latest
  (autres tags si multiples releases)
```

### Sur GitHub Actions

```
Repository → Actions tab

Doit voir le workflow "Build & Push Docker Hub"
  ✅ Green checkmark = Succès
  ❌ Red X = Erreur
```

Si erreur:

```
1. Cliquer sur le workflow
2. Voir la section "Logs"
3. Chercher le problème (credentials, etc.)
```

### Localement (après pull par le client)

```bash
# Télécharger les images
docker pull ton-username/app-backend:v1.0.0
docker pull ton-username/app-frontend:v1.0.0

# Vérifier la taille (doit être raisonnable)
docker images | grep "ton-username"

# Tester le démarrage
docker compose -f docker-compose.prod.yml up -d
docker compose ps
```

---

## 🏷️ Convention de Versioning

Utiliser [Semantic Versioning](https://semver.org/):

```
v MAJOR . MINOR . PATCH

v1.0.0        Release initiale
v1.0.1        Bugfix
v1.1.0        Nouvelle feature
v2.0.0        Breaking change

Pré-releases:
v1.0.0-beta   Beta release
v1.0.0-rc1    Release candidate
```

Exemples:

```bash
# Nouvelle feature majeure
git tag v1.1.0
git push origin v1.1.0

# Bugfix urgent
git tag v1.0.1
git push origin v1.0.1

# Release candidate (test avant release)
git tag v2.0.0-rc1
git push origin v2.0.0-rc1
```

---

## 🐛 Troubleshooting

### "Authentication error" avec GitHub Actions

```
Problème: DOCKERHUB_TOKEN invalide
Solution:
  1. Régénérer le token sur Docker Hub
  2. Copier le nouveau token
  3. Mettre à jour le secret GitHub
  4. Retester
```

### Les images ne sont pas sur Docker Hub

```
Problème: Tag non détecté par GitHub Actions
Solution:
  1. Vérifier que le tag est v* (v1.0.0)
  2. Vérifier qu'il a été pushé: git push origin v1.0.0
  3. Vérifier le workflow: GitHub → Actions
```

### Build échoue

```
Problème: Erreur lors du build
Solution:
  1. Vérifier les logs: GitHub → Actions → workflow
  2. Chercher l'erreur (manque dépendance, syntaxe, etc.)
  3. Corriger localement
  4. Retagger et repusher
```

### Client ne peut pas télécharger l'image

```
Problème: Repository est privé
Solution:
  1. Docker Hub → Repository → Settings → Visibility = Public
  2. Client réessaye

OU

Problème: Mauvais registry/username
Solution:
  1. Vérifier .env du client:
     DOCKER_USERNAME=ton-username (pas "my-app" ou autre)
```

---

## 📋 Checklist par Release

```
□ Tester localement en dev
  docker compose up -d
  # Vérifier toutes les fonctionnalités

□ Créer un tag
  git tag v1.0.0
  git push origin v1.0.0

□ Vérifier GitHub Actions
  GitHub → Actions
  # Attendre le ✅ (3-5 minutes généralement)

□ Vérifier Docker Hub
  https://hub.docker.com/r/ton-username/app-backend/tags
  https://hub.docker.com/r/ton-username/app-frontend/tags
  # Les tags v1.0.0 et latest doivent être visibles

□ Tester le déploiement
  # Sur une machine test
  cp .env.example .env
  nano .env  # IMAGE_TAG=v1.0.0
  docker compose -f docker-compose.prod.yml up -d
  # Vérifier que tout fonctionne

□ Documenter les changements
  GitHub Release (créée automatiquement)
  # Ajouter notes de release si nécessaire

□ Notifier le client
  "v1.0.0 est maintenant disponible"
  "Pour déployer: IMAGE_TAG=v1.0.0, puis docker compose pull"
```

---

## 💡 Tips & Tricks

### Voir rapidement l'avancement du build

```bash
# Depuis GitHub Actions
github-cli repo view --web
# Ou manuellement: Repository → Actions

# Puis chercher le workflow exécution la plus récente
```

### Nettoyer les anciennes images

```bash
# Docker Hub: Settings → Image retention rules
# Garder les 3 dernières versions

# Ou manuellement supprimer les tags en prod:
# Repos are public → on peut pas les supprimer de docker hub directement
# Mais le client peut faire:
docker system prune -a  # Pour nettoyer localement
```

### Tester localement sans Docker Hub

```bash
# Juste tester le build
docker build -t app-backend:test ./backend
docker build -t app-frontend:test ./frontend

# Tester le docker-compose (sans images du hub)
# Créer docker-compose.test.yml avec image: app-backend:test
```

### Repousser une version existante

```bash
# Si vous avez refait le build d'une version
# Docker Hub demande confirmation (déjà existe)

# Option: Supprimer le tag old et repousser
# Ou utiliser un tag intermédiaire (v1.0.0-rebuild)
```

---

## 📚 Fichiers Importants

```
.github/workflows/deploy.yml
  └── Workflow GitHub Actions (auto-build)
      Modifiez si vous changez la structure

build-and-push.sh
  └── Script de build local
      Utilisez si GitHub Actions ne fonctionne pas

docker-compose.prod.yml
  └── Configuration de production
      Utilise IMAGE_TAG et DOCKER_USERNAME

.env.example
  └── Template d'environnement pour clients
      Mettre à jour avec chaque release
```

---

## 🔐 Sécurité

### ✅ Bonnes Pratiques

```
✅ Garder les secrets (DOCKERHUB_TOKEN) secrets
   Ne jamais les mettre dans le code ou README

✅ Régulièrement retirer les anciens tokens

✅ Utiliser des tags sémantiques (v1.0.0)
   Pas "latest" pour production

✅ Vérifier les images avant de déployer
   docker inspect ton-username/app-backend:v1.0.0
```

### ❌ Ne Pas Faire

```
❌ Hardcoder le token ou username dans le code
❌ Utiliser "latest" en production (utiliser des versions explicites)
❌ Pousser des images contenant des secrets
❌ Oublier de mettre à jour .env.example
```

---

## 🎓 Ressources

- [Docker Hub](https://hub.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Semantic Versioning](https://semver.org/)

---

## 📞 Support

Si le workflow ne fonctionne pas:

1. **Vérifier GitHub Secrets**:
   Repository → Settings → Secrets

   ```
   DOCKERHUB_USERNAME    ✅ Rempli
   DOCKERHUB_TOKEN       ✅ Valide
   VITE_API_URL          ✅ Rempli
   VITE_STORAGE_URL      ✅ Rempli
   ```

2. **Vérifier les logs GitHub Actions**:
   Repository → Actions → Workflow → Run

3. **Test local**:

   ```bash
   bash build-and-push.sh v1.0.0
   # Doit fonctionner si credentials OK
   ```

4. **Contact Support**:
   Avec les logs d'erreur GitHub Actions

---

**Bon déploiement!** 🚀
