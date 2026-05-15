# 🎯 Backoffice Full-Stack Application

> **Démarrage simple : `docker compose up --build`**

## 🚀 Quick Start

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- ~5GB d'espace disque
- Ports 3000, 8000, 3306 libres

### Lancer l'application

```bash
docker compose up --build
```

Puis ouvrir les URLs :

- 🎨 **Frontend** : http://localhost:3000
- 📡 **API Backend** : http://localhost:8000
- 🗄️ **MySQL** : localhost:3306 (user/password)

**C'est tout ! ✨**

---

## 📚 Documentation

| Document                                                         | Description                                                |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| **[DOCKER_START_HERE.md](./DOCKER_START_HERE.md)**               | 👈 **À lire en PREMIER** - Le strict minimum pour démarrer |
| [DOCKER_DEPLOYMENT_SIMPLE.md](./DOCKER_DEPLOYMENT_SIMPLE.md)     | Guide complet avec troubleshooting                         |
| [DELIVERY_CHECKLIST.md](./DELIVERY_CHECKLIST.md)                 | Checklist avant livraison client                           |
| [frontend/src/api/examples.jsx](./frontend/src/api/examples.jsx) | Exemples React d'appels API                                |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
├─────────────────────────────────────────┤
│                                         │
│  Frontend          Backend       MySQL  │
│  (React+Nginx)    (Laravel)      (8.0)│
│  :3000            :8000         :3306 │
│                                         │
└─────────────────────────────────────────┘
```

### Services

#### Frontend (React + Vite)

- 📦 Build Vite multi-stage
- 🌐 Nginx alpine pour servir le SPA
- 🔄 Configuration API au runtime
- 📱 React Router compatible

#### Backend (Laravel API)

- 🐘 PHP 8.2 FPM Alpine
- 🧬 Laravel avec Eloquent ORM
- 🔄 Supervisord (PHP-FPM + Nginx)
- 🗄️ MySQL 8.0 via Docker network
- 🚀 Migrations auto au démarrage

#### Database (MySQL)

- 🗃️ Volume persistant
- 🏥 Healthcheck intégré
- 💾 Données sauvegardées entre redémarrages

---

## 🔐 Configuration par défaut

| Variable     | Valeur                  |
| ------------ | ----------------------- |
| MySQL User   | `user` / `password`     |
| MySQL Root   | `root` / `root`         |
| Database     | `backoffice`            |
| API Base URL | `http://localhost:8000` |

---

## 💻 Commandes courantes

```bash
# Démarrer
docker compose up --build

# Arrêter
docker compose down

# Arrêter + nettoyer les données
docker compose down -v

# Voir les logs
docker compose logs -f

# Terminal dans un container
docker compose exec backend bash
docker compose exec frontend sh

# Migrations Laravel
docker compose exec backend php artisan migrate:fresh --seed

# Optimiser pour production
docker compose exec backend php artisan config:cache
```

---

## 🔗 Utiliser l'API depuis React

Importer et utiliser la configuration d'API :

```javascript
import { fetchApi } from "@/api/config";

// Ça marche partout : dev ET production
const products = await fetchApi("/api/products");
const created = await fetchApi("/api/products", {
  method: "POST",
  body: JSON.stringify({ name: "Product" }),
});
```

**Pas de hardcoding d'URLs**, pas de proxy Vite en production = magie ! ✨

---

## 🧪 Validation

Vérifier que la configuration Docker est correcte :

```bash
# Linux/Mac
bash validate-docker.sh

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File validate-docker.ps1
```

---

## 📦 Stack technologique

| Composant   | Version | Rôle                   |
| ----------- | ------- | ---------------------- |
| **React**   | 19.x    | Frontend SPA           |
| **Vite**    | 8.x     | Build & dev server     |
| **Laravel** | 11.x    | Backend API            |
| **PHP**     | 8.2     | Runtime backend        |
| **MySQL**   | 8.0     | Database               |
| **Nginx**   | Alpine  | Reverse proxy & static |
| **Docker**  | Latest  | Containerisation       |

---

## 🚀 Déploiement

### Local/Dev

```bash
docker compose up --build
```

### Production (simple)

```bash
# Sur un VPS
docker compose up --build -d
```

### Production (avec reverse proxy)

Voir [DOCKER_DEPLOYMENT_SIMPLE.md](./DOCKER_DEPLOYMENT_SIMPLE.md#-production)

---

## 🐛 Troubleshooting

### "Port 3000 already in use"

```bash
# Tuer le process
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Frontend ne peut pas atteindre le backend

```bash
# Vérifier depuis le container frontend
docker compose exec frontend curl http://backend:80/api
```

### Migrations échouent

```bash
# Vérifier les logs
docker compose logs backend

# Relancer les migrations
docker compose exec backend php artisan migrate --fresh
```

### Réinitialiser complètement

```bash
docker compose down -v
docker compose up --build
```

---

## 📞 Support

- 📖 Lire [DOCKER_DEPLOYMENT_SIMPLE.md](./DOCKER_DEPLOYMENT_SIMPLE.md) en premier
- 🐛 Vérifier les logs : `docker compose logs`
- 🔍 Vérifier la configuration dans `docker-compose.yml`

---

## 📝 License

Propriétaire - Utilisation interne uniquement

---

## ✅ Prêt à partir !

```bash
docker compose up --build
```

Puis aller sur http://localhost:3000 🎉
