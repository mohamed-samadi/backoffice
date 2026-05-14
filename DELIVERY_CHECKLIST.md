# 📋 Checklist de Livraison Client

## 🎯 Avant la livraison

### Vérifications techniques

- [ ] `docker compose up --build` démarre sans erreurs
- [ ] Pas de secrets/credentials dans le code (\*.env)
- [ ] Frontend se charge sur http://localhost:3000
- [ ] Backend API répond sur http://localhost:8000
- [ ] Base de données fonctionnelle
- [ ] Migrations Laravel exécutées automatiquement
- [ ] Les appels API frontend vers backend marchent
- [ ] Les volumes Docker persistent les données

### Vérifications de code

- [ ] `frontend/src/api/config.js` utilisé pour tous les appels API
- [ ] Pas de hardcoding d'URLs (localhost:8000, etc.) en production
- [ ] Variables d'environnement correctement définies dans docker-compose.yml

### Tests côté client

- [ ] CRUD complet (Create, Read, Update, Delete) testé
- [ ] Téléchargement de fichiers (s'il existe)
- [ ] Édition de données
- [ ] Navigation principales
- [ ] Recherche/filtrage si existant
- [ ] Messages d'erreur affichés correctement

---

## 📦 Fichiers à livrer

```
✅ docker-compose.yml         (orchestration unique)
✅ backend/Dockerfile         (Laravel + PHP 8.2)
✅ backend/docker/            (configurations)
✅ frontend/Dockerfile        (React + Nginx)
✅ frontend/docker/           (configurations)
✅ DOCKER_START_HERE.md       (ce qu'il FAUT lire)
✅ DOCKER_DEPLOYMENT_SIMPLE.md (guide complet)
✅ README.md                   (mis à jour avec Docker)
```

---

## 📖 Documentation à fournir

### Pour le client (minimal)

1. **[DOCKER_START_HERE.md](./DOCKER_START_HERE.md)** ← À lire en PREMIER
   - Démarrage en 1 commande
   - URLs où accéder
   - Credentials
   - Commandes basiques (arrêt, logs)

2. **Fichier texte : "INSTRUCTIONS.txt"** (optionnel, super simple)
   ```
   Pour démarrer :
   1. Installer Docker & Docker Compose
   2. Ouvrir terminal dans le dossier du projet
   3. Taper : docker compose up --build
   4. Attendre 15 secondes
   5. Ouvrir http://localhost:3000
   ```

### Pour support/maintenance (si client a un tech)

- **[DOCKER_DEPLOYMENT_SIMPLE.md](./DOCKER_DEPLOYMENT_SIMPLE.md)** ← Guide complet
- **[frontend/src/api/examples.jsx](./frontend/src/api/examples.jsx)** ← Comment utiliser l'API

---

## 🔒 Sécurité avant production

**⚠️ À faire AVANT de mettre en vrai production :**

### Secrets & Credentials

```bash
# ❌ NE PAS utiliser en production
DB_PASSWORD: password

# ✅ UTILISER en production
DB_PASSWORD: $(openssl rand -base64 32)
```

### Variables d'environnement (`.env`)

```bash
# Ne jamais commiter .env
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Créer .env depuis .env.example
cp backend/.env.example backend/.env

# Changer les valeurs en production
APP_ENV=production
APP_DEBUG=false
DB_PASSWORD=<secure_random_password>
```

### Autres

- [ ] Vérifier les permissions des fichiers (storage, bootstrap/cache)
- [ ] S'assurer que les logs ne contiennent pas de infos sensibles
- [ ] Tester les uploads de fichiers
- [ ] Vérifier les limites de fichiers (actuellement 10M)

---

## 🚀 Déploiement simple (si le client héberge)

### Option 1 : VPS simple (Hetzner, Linode, DigitalOcean, Scaleway)

```bash
# Sur le VPS
ssh user@vps.example.com
cd /var/www/app
docker compose up --build -d

# Accès : http://vps_ip:3000
```

### Option 2 : Avec un reverse proxy (Nginx/Caddy)

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
    }
}
```

---

## ✨ Checklist finale (Avant go-live)

- [ ] Client reçoit les fichiers
- [ ] Client test `docker compose up --build`
- [ ] Client peut accéder à l'app complètement
- [ ] Client ne voit pas les dépots en commande
- [ ] Documentation est claire et accessible
- [ ] Support après livraison documenté
- [ ] Backup plan en place (données MySQL)

---

## 📞 Support client

### Si ça ne démarre pas

1. Vérifier Docker & Compose : `docker --version && docker compose --version`
2. Vérifier ports libres : `netstat -an | grep 3000` (Windows) ou `lsof -i :3000` (Mac/Linux)
3. Lire les logs : `docker compose logs`
4. Relancer : `docker compose down -v && docker compose up --build`

### Si ça démarre mais API ne marche pas

1. Vérifier logs backend : `docker compose logs backend`
2. Vérifier migrations : `docker compose exec backend php artisan migrate:status`
3. Vérifier MySQL : `docker compose logs db`

---

## 🎉 Livraison !

**Envoyer au client :**

1. Les sources du projet (git clone ou zip)
2. **[DOCKER_START_HERE.md](./DOCKER_START_HERE.md)** en évidence
3. Contact pour support (email, Slack, etc.)

**Le client doit pouvoir faire :**

```bash
docker compose up --build
```

**Et c'est tout ! 🚀**
