# 🚀 Docker Deployment Guide

## Structure Simple

```
├── docker-compose.yml   ← Orchestration unique
├── backend/
│   ├── Dockerfile       ← PHP 8.2 + Laravel
│   ├── docker/
│   │   ├── entrypoint.sh     (migrations auto)
│   │   ├── nginx.conf        (configuration Nginx)
│   │   └── supervisord.conf  (gestion processus)
│   └── ... (Laravel files)
│
├── frontend/
│   ├── Dockerfile       ← Node build + Nginx
│   ├── docker/
│   │   ├── entrypoint.sh     (injection config API)
│   │   └── nginx.conf        (React routing)
│   └── ... (React files)
```

---

## ⚡ Démarrage rapide

### Prérequis

- Docker & Docker Compose
- Port 3000 (frontend), 8000 (backend), 3306 (MySQL) libres

### Lancer l'application

```bash
docker compose up --build
```

**Voilà !** L'application se lance automatiquement :

- 🎨 **Frontend** : http://localhost:3000
- 📡 **Backend API** : http://localhost:8000/api
- 🗄️ **MySQL** : localhost:3306

---

## 🔧 Configuration

### Variables d'environnement (docker-compose.yml)

#### Frontend

```yaml
environment:
  API_URL: http://backend:80 # Depuis le container
```

#### Backend

```yaml
environment:
  APP_ENV: local
  APP_DEBUG: true
  DB_HOST: db # Nom du service MySQL
  DB_USERNAME: user
  DB_PASSWORD: password
```

### Identifiants MySQL

- **Host** : localhost
- **User** : user / password
- **Root** : root / root
- **Database** : backoffice

---

## 📝 Comment utiliser l'API dans React

### Méthode recommandée

```javascript
import { getApiUrl, fetchApi } from "@/api/config";

// Usage simple
const data = await fetchApi("/api/products");

// Ou URL personnalisée
const baseUrl = getApiUrl();
const url = `${baseUrl}/api/categories`;
```

### Détails techniques

- ✅ En dev : `http://localhost:8000`
- ✅ En prod : URL depuis `window.__VITE_API_URL__` (injectée au démarrage)
- ✅ Pas de proxy Vite en production

---

## 🔄 Workflow

### Développement local

```bash
# Terminal 1 : Containers
docker compose up

# Terminal 2 : Frontend (optionnel - pour HMR)
cd frontend
npm install
npm run dev
```

### Arrêter tout

```bash
docker compose down          # Arrête les containers
docker compose down -v       # Arrête + supprime les volumes (données)
```

### Voir les logs

```bash
docker compose logs -f backend    # Logs backend
docker compose logs -f frontend   # Logs frontend
docker compose logs -f db         # Logs MySQL
```

---

## ✅ Checklist

- [x] MySQL se lance et attend les connexions
- [x] Migrations Laravel au démarrage automatique
- [x] Backend prêt après migrations
- [x] Frontend construction + Nginx
- [x] Communication frontend → backend en place
- [x] Config API injectée au runtime

---

## 🚨 Troubleshooting

### "Connection refused port 3306"

```bash
# MySQL met du temps. Attendre 10s ou vérifier les logs
docker compose logs db
```

### Frontend ne peut pas atteindre l'API

```bash
# Vérifier dans la console navigateur
console.log(window.__VITE_API_URL__);

# Ou tester depuis le container frontend
docker compose exec frontend curl http://backend:80
```

### Migrations échouent

```bash
# Vérifier les logs Laravel
docker compose logs backend

# Relancer les migrations manuellement
docker compose exec backend php artisan migrate --fresh
```

### Réinitialiser complètement

```bash
docker compose down -v
docker compose up --build
```

---

## 📦 Production (déploiement simple)

Pour une vraie production :

1. **Modifier .env** → `APP_ENV=production`, `APP_DEBUG=false`
2. **Changer les identifiants** → user/password en DB
3. **Ajouter volumes** pour la persistance :
   ```yaml
   backend:
     volumes:
       - ./storage:/var/www/html/storage
   ```

---

## 💡 Notes

- **Pas de CI/CD** : C'est juste Docker
- **Pas de Kubernetes** : C'est local/simple
- **Volumes** : Les changements de code se reflètent live en dev
- **Migrations auto** : Pas besoin de `php artisan migrate` manuel
- **MySQL persiste** : Via le volume `db_data`

**Fait ! Ton app est prête à la livraison.** 🎉
