# 🎉 Bienvenue! Infrastructure Docker — Démarrage Rapide

**Votre infrastructure Docker est maintenant complète et prête à l'emploi!**

---

## ⚡ Démarrage en 3 étapes

### 1️⃣ Configuration (1 min)

```bash
cp .env.example .env
```

### 2️⃣ Initialisation (5 min)

```bash
bash init-docker.sh
```

Ce script va:

- ✅ Vérifier Docker & Docker Compose
- ✅ Créer le fichier .env
- ✅ Générer une clé APP_KEY unique
- ✅ Builder les images
- ✅ Démarrer les containers
- ✅ Attendre la santé des services

### 3️⃣ Utilisation

```bash
# Services prêts à http://localhost:3000 (frontend)
# et http://localhost:8000 (backend)

# Voir les logs
docker compose logs -f

# Terminal backend
docker compose exec backend bash

# Arrêter
docker compose down
```

---

## 🎯 Services Disponibles

| Service            | URL                   | Login      |
| ------------------ | --------------------- | ---------- |
| **Frontend React** | http://localhost:3000 | —          |
| **Backend API**    | http://localhost:8000 | —          |
| **PhpMyAdmin**     | http://localhost:8080 | `app_user` |
| **Database**       | localhost:3306        | `app_user` |

---

## 📚 Documentation

Lisez dans cet ordre:

1. **[DOCKER_README.md](DOCKER_README.md)** — Vue d'ensemble (5 min)
2. **[DOCKER_SETUP.md](DOCKER_SETUP.md)** — Guide complet (détails)
3. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** — Cheatsheet des commandes

**Index complet**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 🔨 Commandes Utiles

### Makefile (Recommandé)

```bash
make help              # Voir toutes les commandes
make up                # Démarrer
make down              # Arrêter
make logs              # Logs en temps réel
make bash              # Terminal backend
```

### Docker Compose (Directement)

```bash
docker compose up -d                # Démarrer
docker compose logs -f              # Logs
docker compose exec backend bash    # Terminal
docker compose down                 # Arrêter
```

---

## 🎓 Pour Comprendre l'Architecture

Consultez: [DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)

```
Client Browser
      ↓
Frontend (React)
  ↓ API calls ↓
Backend (Laravel API)
      ↓
Database (MySQL)
```

---

## 🚀 Avant de Déployer en Production

1. Lire: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
2. Vérifier le .env avec des valeurs réelles
3. Générer une nouvelle APP_KEY (unique)
4. Mettre APP_DEBUG=false
5. Suivre la checklist complète

---

## 🆘 Besoin d'Aide?

### Erreur au démarrage?

```bash
# Voir les logs d'erreur
docker compose logs backend

# Reconstruire
docker compose down -v && docker compose up -d --build
```

### Erreur de permission?

```bash
docker compose exec backend chmod -R 755 storage bootstrap/cache
```

### Base de données introuvable?

```bash
# Attendre 30 secondes (initialisation DB)
# Puis vérifier les logs
docker compose logs db | tail -20
```

**Troubleshooting complet**: [DOCKER_SETUP.md#troubleshooting](DOCKER_SETUP.md#troubleshooting)

---

## 📋 Fichiers Créés

### Infrastructure

- ✅ `docker-compose.yml` — Dev
- ✅ `docker-compose.prod.yml` — Prod
- ✅ `backend/Dockerfile` — Backend image
- ✅ `frontend/Dockerfile` — Frontend image

### Configuration

- ✅ `.env.example` — Variables d'env
- ✅ `backend/docker/nginx.conf` — Nginx config
- ✅ `backend/docker/supervisord.conf` — Process manager
- ✅ `backend/docker/entrypoint.sh` — Startup script
- ✅ `frontend/docker/nginx.conf` — Frontend config

### Outils

- ✅ `init-docker.sh` — Setup script
- ✅ `Makefile` — Commandes pratiques

### Documentation

- ✅ `DOCKER_README.md` — Overview
- ✅ `DOCKER_SETUP.md` — Guide complet
- ✅ `DOCKER_ARCHITECTURE.md` — Architecture
- ✅ `ENV_DOCUMENTATION.md` — Variables
- ✅ `DEPLOYMENT_CHECKLIST.md` — Checklist
- ✅ `QUICK_REFERENCE.md` — Cheatsheet
- ✅ `DOCUMENTATION_INDEX.md` — Index
- ✅ `CREATED_FILES_SUMMARY.md` — Résumé
- ✅ Ce fichier! — Getting started

**Total**: 20+ fichiers, 1500+ lignes de documentation

---

## 🎯 Workflow Quotidien

### Matin

```bash
docker compose up -d       # Démarrer
docker compose logs -f     # Voir les logs (Ctrl+C pour quitter)
```

### Pendant la journée

```bash
# Faire les changements du code
# (hot reload en dev)

docker compose restart backend    # Si besoin

# Migrations
docker compose exec backend php artisan migrate

# Terminal
docker compose exec backend bash
```

### Soir

```bash
docker compose down        # Arrêter proprement
```

---

## 🔐 Sécurité

✅ **Dev mode**: Permissif (debug enabled, volumes bindés)  
✅ **Prod mode**: Sécurisé (debug disabled, image immuable)

Changements automatiques en prod:

- APP_ENV=production
- APP_DEBUG=false
- PhpMyAdmin supprimé
- Pas de code source dans l'image

---

## 🌍 Multi-Environnement

### Dev

```bash
docker compose up -d      # Utilise docker-compose.yml
```

### Prod

```bash
docker compose -f docker-compose.prod.yml \
  --env-file .env up -d --build
```

---

## 💡 Tips

```bash
# Voir les statuts
docker compose ps

# Stats temps réel
docker stats

# Nettoyer les données
docker compose down -v    # ⚠️ Perte de données!

# Sauvegarder la BDD
docker compose exec db mysqldump -u app_user -p app_db > backup.sql

# Restaurer
docker compose exec -T db mysql -u app_user -p app_db < backup.sql
```

---

## 🚀 Prochaines Étapes

1. **Démarrer**: `bash init-docker.sh`
2. **Tester**: Ouvrir http://localhost:3000
3. **Apprendre**: Lire [DOCKER_SETUP.md](DOCKER_SETUP.md)
4. **Utiliser**: `make help` pour les commandes
5. **Déployer**: Suivre [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 📞 Questions?

1. **Lisez la doc** — Une réponse existe probablement
2. **Vérifiez les logs** — `docker compose logs -f`
3. **Consultez [QUICK_REFERENCE.md](QUICK_REFERENCE.md)** — Commandes courantes
4. **Contactez le team DevOps** — Pour les problèmes complexes

---

## ✨ Résumé

| Aspect                | Status            |
| --------------------- | ----------------- |
| Docker infrastructure | ✅ Complète       |
| Documentation         | ✅ Exhaustive     |
| Sécurité              | ✅ Best practices |
| Dev experience        | ✅ Optimisée      |
| Prod readiness        | ✅ Prêt           |

---

## 🎉 C'est Prêt!

```bash
# Lancez simplement
bash init-docker.sh

# Et profitez!
docker compose logs -f
```

**Bienvenue dans l'infrastructure Docker BizOS!** 🐳

---

**Questions fréquentes**: Voir [DOCKER_SETUP.md#troubleshooting](DOCKER_SETUP.md#troubleshooting)  
**Documentation complète**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)  
**Index des commandes**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

Bon développement! 🚀
