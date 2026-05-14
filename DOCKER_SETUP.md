# 🐳 Infrastructure Docker — Guide d'utilisation

## 📋 Structure créée

```
project/
├── .env.example              ← À copier en .env
├── docker-compose.yml        ← Développement
├── docker-compose.prod.yml   ← Production
│
├── backend/
│   ├── Dockerfile
│   ├── docker/
│   │   ├── nginx.conf
│   │   ├── supervisord.conf
│   │   └── entrypoint.sh
│   └── ... (code Laravel)
│
└── frontend/
    ├── Dockerfile
    ├── docker/
    │   └── nginx.conf
    └── ... (code React)
```

---

## 🚀 Démarrage en développement

### 1️⃣ Préparation initiale

```bash
# Copier l'env example
cp .env.example .env

# Générer une clé APP_KEY
docker run --rm php:8.2-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"

# Copier la clé générée dans .env
nano .env
```

### 2️⃣ Démarrer les containers

```bash
docker compose up -d --build
```

Services disponibles:

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **PhpMyAdmin**: http://localhost:8080
- **Base de données**: localhost:3306

### 3️⃣ Vérifier le statut

```bash
docker compose ps
docker compose logs backend --tail=20
```

---

## 📊 Commandes utiles au quotidien

### Voir les logs en temps réel

```bash
docker compose logs backend -f    # Backend
docker compose logs frontend -f   # Frontend
docker compose logs db -f         # MySQL
```

### Accéder aux containers

```bash
# Terminal bash dans Laravel
docker compose exec backend bash

# MySQL depuis le container
docker compose exec db mysql -u app_user -p app_db

# Node/NPM dans frontend
docker compose exec frontend sh
```

### Commandes Artisan

```bash
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan queue:work
docker compose exec backend php artisan tinker
```

### Npm commands

```bash
docker compose exec frontend npm install package-name
docker compose exec frontend npm run build
```

### Sauvegarder la base de données

```bash
docker compose exec db mysqldump -u app_user -p app_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurer une sauvegarde

```bash
docker compose exec -T db mysql -u app_user -p app_db < backup_20250114.sql
```

---

## 🔧 Arrêt et nettoyage

```bash
# Arrêter sans supprimer les données
docker compose down

# Arrêter et supprimer tout (⚠️ perte de données)
docker compose down -v

# Supprimer les images
docker compose down --rmi all
```

---

## 🌍 Déploiement en production

### 1️⃣ Sur le serveur

```bash
# Cloner le projet
git clone https://github.com/ton-repo/projet.git
cd projet

# Créer le .env
cp .env.example .env
nano .env  # Éditer avec les vraies valeurs

# Générer APP_KEY
docker run --rm php:8.2-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"

# Copier la clé dans .env

# Démarrer
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### 2️⃣ Mettre à jour le code

```bash
# Pull les changements
git pull origin main

# Rebuild et redémarrer (sans downtime)
docker compose -f docker-compose.prod.yml --env-file .env up -d --build --no-deps

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f
```

### 3️⃣ Backup réguliers

```bash
# Quotidien
docker compose -f docker-compose.prod.yml \
  exec db mysqldump -u app_user -p app_db \
  > /backups/backup_$(date +%Y%m%d).sql

# Avec cron (tous les jours à 2h du matin)
0 2 * * * cd /chemin/vers/projet && docker compose -f docker-compose.prod.yml exec db mysqldump -u app_user -p app_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

---

## ✅ Checklist avant livraison

- [ ] APP_KEY généré et renseigné dans .env
- [ ] Mots de passe DB forts dans .env
- [ ] APP_DEBUG=false en prod
- [ ] VITE_API_URL pointe vers le bon domaine
- [ ] Migrations exécutées (`php artisan migrate`)
- [ ] Images Docker buildées sans erreur
- [ ] Volumes db_data et storage_data persistants
- [ ] Ports 80 (frontend) et 8000 (backend) ouverts au firewall
- [ ] Backup initial de la BDD effectué
- [ ] Test de restauration du backup effectué

---

## 🐛 Troubleshooting

### Container s'arrête immédiatement

```bash
# Voir les logs d'erreur
docker compose logs backend
```

### Base de données connexion refusée

```bash
# Vérifier que db a démarré
docker compose ps db

# Vérifier les identifiants dans .env
# Attendre quelques secondes et réessayer
```

### Permission denied sur storage

```bash
# Réappliquer les permissions
docker compose exec backend chmod -R 755 storage bootstrap/cache
```

### NPM dependencies outdated

```bash
# Forcer la réinstallation
docker compose exec frontend rm -rf node_modules package-lock.json
docker compose exec frontend npm install
```

---

## 📖 Documentation supplémentaire

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Laravel Docker](https://laravel.com/docs/deployment)
- [Vite Frontend](https://vitejs.dev/)
