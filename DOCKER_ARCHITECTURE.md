# 🏗️ Architecture Docker — Guide complet

## 📐 Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Internet / Reverse Proxy                    │
│                      (Nginx, Cloudflare)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼──────┐             ┌──────▼────────┐
    │  Frontend   │             │   Backend     │
    │  (Nginx)    │             │  (Nginx+PHP)  │
    │  Port: 80   │             │  Port: 8000   │
    │  (React)    │             │  (Laravel)    │
    └─────┬──────┘             └──────┬────────┘
          │                            │
          │                    ┌───────▼────────┐
          │                    │   PHP-FPM      │
          │                    │   Port: 9000   │
          │                    └───────┬────────┘
          │                            │
          └────────────────┬───────────┘
                           │
                      ┌────▼─────┐
                      │  MySQL    │
                      │ Port 3306 │
                      │ (données) │
                      └───────────┘
```

---

## 🐳 Services Docker

### 1️⃣ Database (MySQL)

**Image**: `mysql:8.0`

**Responsabilités**:

- Stocker toutes les données applicatives
- Exécuter les migrations
- Maintenir l'intégrité référentielle

**Ports**:

- Interne: 3306
- Externe (dev uniquement): 3306

**Volumes**:

- `db_data:/var/lib/mysql` — Persistence des données

**Configuration**:

```yaml
DB_HOST: db # Nom du service Docker
DB_PORT: 3306
MYSQL_DATABASE: app_db
MYSQL_USER: app_user
MYSQL_PASSWORD: (depuis .env)
MYSQL_ROOT_PASSWORD: (depuis .env)
```

**Santé**:

- Healthcheck: `mysqladmin ping`
- Retry: 5 tentatives toutes les 10s
- Timeout: 10s

---

### 2️⃣ Backend (Laravel + PHP-FPM + Nginx)

**Image**: `php:8.2-fpm` (custom via Dockerfile)

**Composants**:

- **Nginx**: Web server (port 80 interne → 8000 externe)
- **PHP-FPM**: Application runtime
- **Supervisord**: Process manager pour les deux

**Responsabilités**:

- Exécuter le code Laravel
- Servir l'API (`/api/*`)
- Servir les fichiers statiques (`/storage/*`)
- Gérer les migrations et seeders

**Ports**:

- Interne: 80 (Nginx)
- Interne: 9000 (PHP-FPM, communication Nginx)
- Externe: 8000

**Volumes**:

- `./backend:/var/www/html` (dev) — Live reload du code
- `storage_data:/var/www/html/storage/app/public` — Fichiers persistants
- Pas de volume en production (image immuable)

**Workflow au démarrage**:

1. `entrypoint.sh` se lance
2. Attente santé DB
3. Migrations exécutées
4. Lien symbolique storage créé
5. Cache config/routes
6. Supervisord démarre Nginx + PHP-FPM

**Communication avec DB**:

```
Nginx → PHP-FPM (localhost:9000)
     ↓
   Laravel (Eloquent)
     ↓
   MySQL (host: db, port 3306)
```

---

### 3️⃣ Frontend (React + Vite + Nginx)

**Image**: `node:20-alpine` (build) → `nginx:alpine` (runtime)

**Stage 1 (Build)**:

- Node.js 20 Alpine
- Installe `npm ci` (dependencies)
- Build Vite: `npm run build`
- Génère `/dist` optimisé

**Stage 2 (Runtime)**:

- Nginx Alpine
- Serve `/dist` en tant qu'assets statiques
- Configuration SPA: toutes routes → `index.html`
- Gzip compression activée
- Cache-busting pour `/assets/`

**Ports**:

- Interne: 80
- Externe: 3000 (dev) ou 80 (prod)

**Build Args**:

```yaml
VITE_API_URL: http://localhost:8000/api # (dev)
VITE_STORAGE_URL: http://localhost:8000/storage
```

**Communication avec Backend**:

```
Navigateur
     ↓
React App (fetch/axios)
     ↓
Nginx (redirect /api/* vers backend)
     ↓
Backend API (port 8000)
```

**Exemple requête API**:

```javascript
// Dans le code React
fetch("http://localhost:8000/api/credits");

// Nginx redirige automatiquement si config CORS
// Ou le frontend demande via environment var:
fetch(`${import.meta.env.VITE_API_URL}/credits`);
```

---

### 4️⃣ PhpMyAdmin (Dev uniquement)

**Image**: `phpmyadmin:latest`

**Ports**:

- Interne: 80
- Externe: 8080

**Accès**:

- User: `app_user` (ou `root`)
- Password: valeur de `DB_PASSWORD` (ou `DB_ROOT_PASSWORD`)
- URL: http://localhost:8080

⚠️ **Jamais** en production (sécurité)

---

## 📡 Networking

### App Network Bridge

Tous les services sont sur le même réseau Docker `app_network`:

```yaml
networks:
  app_network:
    driver: bridge
```

**Avantages**:

- DNS interne: nom du service = hostname (ex: `db`, `backend`)
- Isolation réseau
- Communication inter-service

**DNS Resolution**:

```
backend → requête DNS interne → 172.20.0.2 (MySQL)
frontend → requête DNS interne → 172.20.0.3 (Backend)
```

### Ports (Dev)

| Service    | Port Interne | Port Externe | Accessible            |
| ---------- | ------------ | ------------ | --------------------- |
| Frontend   | 80           | 3000         | http://localhost:3000 |
| Backend    | 80           | 8000         | http://localhost:8000 |
| MySQL      | 3306         | 3306         | localhost:3306        |
| PhpMyAdmin | 80           | 8080         | http://localhost:8080 |

---

## 💾 Volumes

### Named Volumes (Persistence)

```yaml
volumes:
  db_data: # ← Données MySQL
  storage_data: # ← Fichiers utilisateurs (uploads)
```

**Localisation sur l'host**:

- Docker Desktop (macOS/Windows): Virtuelle (VM Docker)
- Linux: `/var/lib/docker/volumes/<name>/_data/`

**Commandes**:

```bash
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect app_db_data

# Sauvegarder un volume
docker run --rm -v app_db_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/db_backup.tar.gz -C /data .

# Restaurer un volume
docker run --rm -v app_db_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/db_backup.tar.gz -C /data
```

### Bind Mounts (Dev)

En développement, le code est bindé (partagé en temps réel):

```yaml
volumes:
  - ./backend:/var/www/html # Dev: hot reload
  - ./frontend:/app # Dev: watch mode
```

⚠️ **Pas de bind mount en production** — Image immuable

---

## 🔄 Lifecycle & Dependencies

### Ordre de démarrage

```
1. db (la première)
   ↓ healthcheck = ready
2. backend (attend db healthy)
   ↓ entrypoint.sh, migrations
3. frontend (attend backend ready)
4. phpmyadmin (attend db ready)
```

**Dépendances explicites**:

```yaml
depends_on:
  db:
    condition: service_healthy # ← Attend healthcheck
```

**Commandes de démarrage**:

```bash
# Dev: Démarrer avec logs
docker compose up

# Dev: En arrière-plan
docker compose up -d

# Prod: Avec build
docker compose -f docker-compose.prod.yml up -d --build

# Prod: Sans rebuild (code déjà en image)
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔒 Configuration Sécurité

### Développement (docker-compose.yml)

✅ **Permissif** (local development):

- Tous les ports exposés
- PhpMyAdmin accessible
- APP_DEBUG=true
- Volumes bindés (code changeable)

```yaml
environment:
  APP_ENV: local
  APP_DEBUG: "true"
```

### Production (docker-compose.prod.yml)

🔐 **Sécurisé**:

- Seuls ports 80 (frontend) et 8000 (backend) exposés
- Pas de PhpMyAdmin
- APP_DEBUG=false
- Pas de volumes bindés (image immuable)
- Healthchecks plus stricts

```yaml
environment:
  APP_ENV: production
  APP_DEBUG: "false"
```

---

## 🚀 Processus Entrypoint

Le fichier `backend/docker/entrypoint.sh` s'exécute au démarrage:

```bash
#!/bin/bash
# 1. Attendre que MySQL soit prêt
until php artisan db:monitor; do
  sleep 2
done

# 2. Exécuter les migrations
php artisan migrate --force

# 3. Créer lien symbolique storage
php artisan storage:link

# 4. Optimiser pour production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Démarrer Supervisord
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
```

**Supervisord** gère 2 processus:

- **Nginx**: Web server
- **PHP-FPM**: Application runtime

Les deux tournent dans le même container pour simplicité.

---

## 📊 Monitoring & Logs

### Logs

```bash
# Tous les services
docker compose logs

# Service spécifique
docker compose logs backend

# En temps réel
docker compose logs -f

# Dernières 50 lignes
docker compose logs --tail=50

# Avec timestamps
docker compose logs --timestamps
```

### Santé

```bash
# Vérifier l'état des containers
docker compose ps

# Logs de startup
docker compose logs backend | head -50

# Vérifier une connexion DB
docker compose exec backend php artisan db:monitor

# Vérifier la mémoire/CPU
docker stats
```

---

## 🔄 Updates & Maintenance

### Code Update

```bash
# 1. Pull le code
git pull origin main

# 2. Rebuild et redémarrer
docker compose -f docker-compose.prod.yml up -d --build --no-deps

# 3. Les migrations s'exécutent automatiquement (entrypoint.sh)
```

### Database Migration

```bash
# Les migrations s'exécutent automatiquement au démarrage
# Mais on peut aussi forcer manuellement:
docker compose exec backend php artisan migrate
docker compose exec backend php artisan migrate:rollback
docker compose exec backend php artisan migrate:refresh --seed
```

### Dependency Updates

```bash
# Backend
docker compose exec backend composer update
docker compose exec backend composer require vendor/package

# Frontend
docker compose exec frontend npm update
docker compose exec frontend npm install package-name
```

---

## ⚡ Performance Tips

### Frontend

- Build image est optimisé (multi-stage)
- Nginx sert les assets statiques rapidement
- Gzip compression activée

### Backend

- OPcache configuré (PHP)
- Config et routes cacheés (artisan)
- Database indexée (voir CATEGORY_OPTIMIZATION.md)

### Database

- Indexes sur clés étrangères
- Query optimization

---

## 🆘 Troubleshooting

### Container ne démarre pas

```bash
# Voir les erreurs
docker compose logs backend

# Vérifier le build
docker compose build --no-cache backend

# Reconstruire
docker compose down -v
docker compose up --build
```

### Permission denied

```bash
# Vérifier les permissions
docker compose exec backend ls -la /var/www/html

# Réparer si nécessaire
docker compose exec backend chown -R www-data:www-data /var/www/html
docker compose exec backend chmod -R 755 storage bootstrap/cache
```

### API unreachable

```bash
# Vérifier que backend est up
docker compose ps backend

# Tester connexion
docker compose exec frontend curl http://backend:80/api/

# Vérifier les logs
docker compose logs backend | grep -i error
```

---

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/development-best-practices/)
- [PHP-FPM Configuration](https://www.php.net/manual/en/install.fpm.configuration.php)
- [Nginx Configuration](https://nginx.org/en/docs/)
