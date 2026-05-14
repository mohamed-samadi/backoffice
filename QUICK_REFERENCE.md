# ⚡ Quick Reference — Commandes Docker

Référence rapide des commandes les plus utilisées.

---

## 🚀 Démarrage & Arrêt

```bash
# Démarrer (1ère fois)
bash init-docker.sh

# Démarrer (après)
docker compose up -d

# Arrêter
docker compose down

# Arrêter et nettoyer (⚠️ perte de données)
docker compose down -v

# Redémarrer
docker compose restart
```

---

## 📊 Status & Logs

```bash
# Voir les containers
docker compose ps

# Logs tous services
docker compose logs -f

# Logs d'un service
docker compose logs backend -f
docker compose logs frontend -f
docker compose logs db -f

# Logs sans suivi (historique)
docker compose logs --tail=50
```

---

## 💻 Accès Terminal

```bash
# Terminal backend (bash)
docker compose exec backend bash

# Terminal frontend (sh)
docker compose exec frontend sh

# MySQL CLI
docker compose exec db mysql -u app_user -p app_db

# Root MySQL
docker compose exec db mysql -u root -p app_db
```

---

## 🎯 Artisan (Backend)

```bash
# Migrations
docker compose exec backend php artisan migrate
docker compose exec backend php artisan migrate:rollback
docker compose exec backend php artisan migrate:refresh
docker compose exec backend php artisan migrate:reset

# Seeding
docker compose exec backend php artisan db:seed

# Cache
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache

# Storage
docker compose exec backend php artisan storage:link

# Tinker (REPL)
docker compose exec backend php artisan tinker

# Key
docker compose exec backend php artisan key:generate

# Générique
docker compose exec backend php artisan <command>
```

---

## 📦 NPM / Frontend

```bash
# Installer dépendances
docker compose exec frontend npm install

# Ajouter un package
docker compose exec frontend npm install package-name

# Mettre à jour
docker compose exec frontend npm update

# Build
docker compose exec frontend npm run build

# Generique
docker compose exec frontend npm <command>
```

---

## 🗄️ Base de Données

```bash
# Sauvegarder
mkdir -p backups
docker compose exec db mysqldump -u app_user -p app_db \
  > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer
docker compose exec -T db mysql -u app_user -p app_db \
  < backups/backup_20250114.sql

# Entrer dans MySQL
docker compose exec db mysql -u app_user -p app_db

# Commandes depuis bash
docker compose exec db \
  mysql -u app_user -p app_db -e "SHOW TABLES;"
```

---

## 🔨 Build & Rebuild

```bash
# Build les images
docker compose build

# Build sans cache
docker compose build --no-cache

# Build un service spécifique
docker compose build backend

# Reconstruire et démarrer
docker compose up -d --build
```

---

## 🧹 Cleanup

```bash
# Arrêter
docker compose down

# Supprimer tout (données incluses)
docker compose down -v

# Supprimer images aussi
docker compose down -v --rmi all

# Nettoyer les orphans
docker compose down --remove-orphans

# Nettoyer le système Docker global
docker system prune -f
docker volume prune -f
docker image prune -f
```

---

## 🐛 Debugging

```bash
# Voir les erreurs d'un service
docker compose logs backend | grep -i error

# Inspecter un container
docker inspect app_backend

# Voir l'espace disque
docker system df

# Stats en temps réel
docker stats

# Vérifier la santé
docker compose exec backend php artisan db:monitor

# Test connectivité entre services
docker compose exec backend ping -c 3 db
docker compose exec frontend curl http://backend:80/api/
```

---

## 🌍 Production

```bash
# Démarrer prod
docker compose -f docker-compose.prod.yml \
  --env-file .env up -d --build

# Logs prod
docker compose -f docker-compose.prod.yml logs -f

# Status prod
docker compose -f docker-compose.prod.yml ps

# Arrêter prod
docker compose -f docker-compose.prod.yml down

# Migrations prod
docker compose -f docker-compose.prod.yml \
  exec backend php artisan migrate --force
```

---

## 🔑 Configuration

```bash
# Voir les variables d'env actuelles
docker compose config

# Générer une clé APP_KEY
docker run --rm php:8.2-cli \
  php -r "echo 'base64:'.base64_encode(random_bytes(32));"

# Vérifier un .env
grep -E "(APP_KEY|DB_PASSWORD|APP_DEBUG)" .env

# Éditer .env
nano .env

# Recharger après changement .env
docker compose down && docker compose up -d
```

---

## 📋 Makefile

Si `Makefile` est disponible:

```bash
make help              # Affiche l'aide
make init             # Init first-time
make up               # Démarrer
make down             # Arrêter
make logs             # Logs
make bash             # Terminal
make migrate          # Migrations
make artisan cmd="..." # Artisan
make npm cmd="..."     # NPM
make db-backup        # Backup
make clean            # Cleanup
make fresh            # Reset complet
```

---

## 🔄 Workflow Typique

### Morning Check

```bash
# 1. Démarrer les services
docker compose up -d

# 2. Vérifier le status
docker compose ps

# 3. Voir les logs
docker compose logs -f
```

### Code Changes

```bash
# 1. Faire les changements du code
# ... (edit files) ...

# 2. Recharger (hot reload en dev)
docker compose restart backend

# 3. Vérifier les logs
docker compose logs backend -f
```

### Migrations

```bash
# 1. Créer la migration
docker compose exec backend php artisan make:migration create_table

# 2. Éditer la migration
# ... (edit file) ...

# 3. Exécuter
docker compose exec backend php artisan migrate

# 4. Seed si nécessaire
docker compose exec backend php artisan db:seed
```

### New Dependency

```bash
# Backend
docker compose exec backend composer require vendor/package

# Frontend
docker compose exec frontend npm install package-name

# Restart si nécessaire
docker compose restart
```

### Backup Before Major Changes

```bash
# Créer un backup
docker compose exec db mysqldump -u app_user -p app_db \
  > backups/backup_before_changes.sql

# Faire les changements
# ...

# Si problème, restaurer
docker compose exec -T db mysql -u app_user -p app_db \
  < backups/backup_before_changes.sql
```

### Déployer en Prod

```bash
# 1. Pull le code
git pull origin main

# 2. Backup
docker compose -f docker-compose.prod.yml \
  exec db mysqldump -u app_user -p app_db \
  > backups/backup_before_update.sql

# 3. Rebuild et redémarrer
docker compose -f docker-compose.prod.yml up -d --build --no-deps

# 4. Vérifier
docker compose -f docker-compose.prod.yml logs -f

# 5. Vérifier la app
curl https://yourdomain.com
```

---

## 🎓 Tips & Tricks

### Voir beaucoup de logs

```bash
docker compose logs --tail=500 backend
```

### Suivre les logs avec grep

```bash
docker compose logs -f backend | grep error
```

### Exécuter une commande dans un container

```bash
docker compose exec backend ls -la /var/www/html
```

### Copier un fichier du container

```bash
docker compose cp app_backend:/var/www/html/file.txt .
```

### Copier un fichier au container

```bash
docker compose cp file.txt app_backend:/var/www/html/
```

### Exécuter un script

```bash
docker compose exec backend bash < script.sh
```

### Entrer comme root

```bash
docker compose exec -u root backend bash
```

### Voir les variables d'env du container

```bash
docker compose exec backend env
```

---

## 🚨 Erreurs Courantes

### "Cannot connect to database"

```bash
# Attendre que DB soit ready
docker compose logs db | tail -20

# Vérifier les credentials
grep DB_ .env

# Manuellement
docker compose exec backend php artisan db:monitor
```

### "Port already in use"

```bash
# Voir quel process utilise le port
lsof -i :8000          # ou 3000, 3306, etc.

# Tuer le process
kill -9 <PID>

# Ou changer le port dans docker-compose.yml
ports:
  - "8001:80"  # 8001 au lieu de 8000
```

### "Permission denied"

```bash
# Réparer les permissions
docker compose exec backend \
  chown -R www-data:www-data /var/www/html

docker compose exec backend \
  chmod -R 755 storage bootstrap/cache
```

### "Migrations pending"

```bash
docker compose exec backend php artisan migrate:status

# Exécuter les migrations
docker compose exec backend php artisan migrate
```

---

## 📞 Besoin d'aide?

1. Consulter [DOCKER_SETUP.md](DOCKER_SETUP.md)
2. Consulter [DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)
3. Voir les logs: `docker compose logs -f`
4. Rechercher le problème dans la documentation

---

**Dernière mise à jour**: 2025-01-14
