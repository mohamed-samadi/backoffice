# 📦 Livraison aux Clients

Guide pour empaqueter et livrer l'application aux clients.

---

## 📋 Fichiers à Livrer

Le client reçoit **3 fichiers seulement**:

```
livraison/
├── docker-compose.prod.yml    ← Configuration Docker
├── .env.example               ← Template variables
└── CLIENT_README.md           ← Documentation client
```

**C'est tout!** Les images sont sur Docker Hub.

---

## 📝 Préparation de la Livraison

### Créer le dossier de livraison

```bash
mkdir -p livraison/

# Copier les 3 fichiers
cp docker-compose.prod.yml livraison/
cp .env.example livraison/
cp CLIENT_README.md livraison/
```

### Vérifier que docker-compose.prod.yml utilise Docker Hub

```bash
# Doit avoir:
grep "image:" livraison/docker-compose.prod.yml

# Résultat attendu:
# image: ${DOCKER_USERNAME}/app-backend:${IMAGE_TAG:-latest}
# image: ${DOCKER_USERNAME}/app-frontend:${IMAGE_TAG:-latest}

# ✅ Si c'est correct, pas de build: section
```

### Vérifier le .env.example

```bash
# Doit avoir les variables Docker Hub:
grep "DOCKER_USERNAME\|IMAGE_TAG" livraison/.env.example

# Résultat attendu:
# DOCKER_USERNAME=ton-username
# IMAGE_TAG=latest
```

---

## 📧 Email à Envoyer au Client

```
Sujet: Installation de BizOS - v1.0.0

Bonjour,

Veuillez trouver les fichiers d'installation de BizOS v1.0.0.

📦 FICHIERS INCLUS:
  1. docker-compose.prod.yml    ← Configuration Docker
  2. .env.example               ← Template configuration
  3. CLIENT_README.md           ← Guide installation

🚀 INSTALLATION RAPIDE:

  1. Créer un dossier:
     mkdir bizos && cd bizos

  2. Copier les fichiers reçus

  3. Créer .env:
     cp .env.example .env

  4. Éditer .env avec vos valeurs:
     - APP_KEY (laisser tel quel)
     - DB_PASSWORD (changer)
     - APP_URL, VITE_API_URL, VITE_STORAGE_URL
     - DOCKER_USERNAME: bizos_pro (nous vous l'enverrons)
     - IMAGE_TAG: v1.0.0

  5. Démarrer:
     docker compose -f docker-compose.prod.yml up -d

  6. Attendre ~30 secondes et accéder:
     https://votre-domaine.com

📖 DOCUMENTATION:
  - Voir CLIENT_README.md pour plus de détails
  - Pour l'aide: contact-support@bizos.com

Merci!
BizOS Team
```

---

## 🔐 Données Sensibles à Envoyer SÉPARÉMENT

**JAMAIS dans les fichiers**, envoyer par email séparé ou 1Password:

```
DOCKER_USERNAME: bizos_pro
DOCKER_REGISTRY: docker.io

(ou rien si repositories publiques)
```

---

## ✅ Checklist de Livraison

```
□ Version est taggée et pushée
  git tag v1.0.0
  git push origin v1.0.0

□ GitHub Actions a terminé le build
  GitHub → Actions → green checkmark

□ Images sont sur Docker Hub
  docker.io/ton-username/app-backend:v1.0.0 ✅
  docker.io/ton-username/app-frontend:v1.0.0 ✅

□ Dossier livraison est préparé
  livraison/
  ├── docker-compose.prod.yml
  ├── .env.example
  └── CLIENT_README.md

□ docker-compose.prod.yml est bon
  ✅ Utilise images: (pas build:)
  ✅ DOCKER_USERNAME et IMAGE_TAG sont variables

□ .env.example est complet
  ✅ Toutes les variables obligatoires
  ✅ DOCKER_USERNAME et IMAGE_TAG inclus

□ CLIENT_README.md est à jour
  ✅ URLs correctes
  ✅ Versions correctes

□ Test de déploiement réussi
  ✅ Test sur machine de dev
  ✅ Vérifier que tout fonctionne

□ Documentation à jour
  ✅ DOCKER_HUB_WORKFLOW.md explique le processus
  ✅ CLIENT_README.md explique installation

□ Support configuré
  ✅ Email de support connu
  ✅ Process de support documenté
```

---

## 📦 Livrer les Fichiers

### Option 1 — Fichiers Individuels

Envoyer par email:

```
email.send(
  to: client@example.com
  files: [
    'docker-compose.prod.yml',
    '.env.example',
    'CLIENT_README.md'
  ]
)
```

### Option 2 — Archive ZIP

```bash
cd livraison/
zip -r bizos-v1.0.0.zip .
# Envoyer bizos-v1.0.0.zip au client
```

### Option 3 — Repository Git

```bash
# Créer un repo Git privé pour le client
git init livraison-client/
cd livraison-client/

cp ../docker-compose.prod.yml .
cp ../.env.example .
cp ../CLIENT_README.md .

git add .
git commit -m "BizOS v1.0.0"
git tag v1.0.0

# Partager l'accès au client
```

---

## 👥 Workflow du Client

Le client va faire:

```bash
# 1. Créer dossier
mkdir bizos-prod
cd bizos-prod

# 2. Copier les 3 fichiers reçus
# (docker-compose.prod.yml, .env.example, CLIENT_README.md)

# 3. Créer .env
cp .env.example .env

# 4. Éditer .env (nom, domaine, mot de passe, credentials Docker)
nano .env

# 5. Démarrer
docker compose -f docker-compose.prod.yml up -d

# 6. Accéder à l'app
# https://son-domaine.com

# 7. Garder .env en sécurisé
# (jamais dans Git, jamais partagé)
```

---

## 🔄 Updates Futures

Quand il y a une nouvelle version (v1.1.0):

### Ce qu'on fait (nous):

```bash
# Développer, committer
git add .
git commit -m "Feature: ..."

# Tagger
git tag v1.1.0
git push origin v1.1.0

# GitHub Actions build et push automatiquement
```

### Ce que le client fait:

```bash
# Éditer .env
nano .env
# IMAGE_TAG=v1.1.0  (au lieu de v1.0.0)

# Redémarrer
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

**C'est tout!** Pas besoin de télécharger les fichiers à chaque fois.

---

## 📋 Structure Finale

```
Répertoire du client:
  bizos-prod/
  ├── docker-compose.prod.yml    ← Jamais modifié (sauf si config change)
  ├── .env.example               ← Référence (garder original)
  ├── .env                       ← PRIVÉ (jamais partagé)
  ├── CLIENT_README.md           ← Documentation
  └── (données dans volumes Docker)
```

---

## 🔐 Sécurité de la Livraison

```
✅ Envoyer les 3 fichiers par email sécurisé
✅ Envoyer les credentials par 1Password ou chancel séparé
✅ NE JAMAIS envoyer les secrets dans les fichiers

❌ Ne pas mettre les secrets dans docker-compose.prod.yml
❌ Ne pas envoyer .env complété
❌ Ne pas partager les credentials
```

---

## 📞 Support Client

Vous pouvez:

1. **Envoyer les fichiers**
2. **Mettre à jour IMAGE_TAG** à chaque release
3. **Support par email** pour dépannage

Les clients n'ont besoin de:

- ✅ 3 fichiers de livraison
- ✅ Créer et éditer .env
- ✅ Lancer docker compose pull + up
- ✅ Docker Desktop installé

---

## 🎁 Bonus: Script de Livraison (Optionnel)

Créer `package-for-client.sh`:

```bash
#!/bin/bash
VERSION=${1:-latest}

mkdir -p "livraison-$VERSION"
cp docker-compose.prod.yml "livraison-$VERSION/"
cp .env.example "livraison-$VERSION/"
cp CLIENT_README.md "livraison-$VERSION/"

zip -r "bizos-$VERSION.zip" "livraison-$VERSION"
echo "✅ Livraison packagée: bizos-$VERSION.zip"
```

Utilisation:

```bash
bash package-for-client.sh v1.0.0
# Crée: bizos-v1.0.0.zip
```

---

## ✨ Résumé

**À livrer au client:**

1. `docker-compose.prod.yml` — Configuration
2. `.env.example` — Template variables
3. `CLIENT_README.md` — Guide installation

**Le client fait:**

1. `cp .env.example .env`
2. Éditer .env
3. `docker compose -f docker-compose.prod.yml up -d`

**Pour updates:**

1. Éditer `IMAGE_TAG` dans .env
2. `docker compose pull`
3. `docker compose up -d`

**Simple!** 🎉
