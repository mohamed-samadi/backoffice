# 🎯 START HERE - Docker Full Stack

## 🚀 Une seule commande pour démarrer

```bash
docker compose up --build
```

**C'est tout !** L'application se lance. Attendez 10-15 secondes.

```
✅ MySQL prêt
✅ Migrations lancées
✅ Backend prêt
✅ Frontend prêt
```

---

## 📍 Où trouver quoi ?

| Composant            | URL                   | Port |
| -------------------- | --------------------- | ---- |
| **Frontend (React)** | http://localhost:3000 | 3000 |
| **Backend (API)**    | http://localhost:8000 | 8000 |
| **MySQL**            | localhost             | 3306 |

---

## 🔐 Identifiants par défaut

```
MySQL User: user
MySQL Pass: password

MySQL Root: root
MySQL Root Pass: root

Database: backoffice
```

---

## 📦 Arrêter / Nettoyer

```bash
# Arrêter les containers
docker compose down

# Arrêter + supprimer les données (recommencé à zéro)
docker compose down -v
```

---

## 🐛 Logs & Debug

```bash
# Voir tous les logs en direct
docker compose logs -f

# Voir logs d'un service spécifique
docker compose logs -f backend    # Laravel
docker compose logs -f frontend   # React/Nginx
docker compose logs -f db         # MySQL
```

---

## 💻 Accéder aux containers

```bash
# Terminal dans le backend
docker compose exec backend bash

# Terminal dans le frontend
docker compose exec frontend sh

# Terminal dans la DB
docker compose exec db mysql -uuser -ppassword backoffice
```

---

## 🔧 Configuration API Frontend

L'URL API est **automatiquement configurable** selon l'environnement :

```javascript
// Dans tes composants React :
import { fetchApi } from "@/api/config";

// Utilise directement, ça marche partout
const products = await fetchApi("/api/products");
```

### En développement (npm run dev)

→ Requête sur `http://localhost:8000` (proxy Vite)

### En production (docker)

→ Requête sur `http://backend:80` (injecté au runtime)

---

## 📚 Documentation complète

- **[DOCKER_DEPLOYMENT_SIMPLE.md](./DOCKER_DEPLOYMENT_SIMPLE.md)** ← Guide détaillé
- **[frontend/src/api/examples.jsx](./frontend/src/api/examples.jsx)** ← Exemples React

---

## ✅ Checklist avant de livrer

- [ ] `docker compose up --build` fonctionne
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Backend accessible sur http://localhost:8000
- [ ] Appels API fonctionnent (`fetchApi('/api/...')`)
- [ ] MySQL persiste (volume `db_data`)
- [ ] Logs propres (pas d'erreurs)

---

## 🎉 Prêt à livrer !

C'est aussi simple que ça. Aucune CI/CD, aucune complexité. Juste Docker.

**Questions ?** Voir [DOCKER_DEPLOYMENT_SIMPLE.md](./DOCKER_DEPLOYMENT_SIMPLE.md)
