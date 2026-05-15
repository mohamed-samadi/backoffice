# 🚀 Commandes essentielles - Aide-mémoire

## 🎯 Pour démarrer

```bash
# Démarrer les containers en foreground (voir les logs)
docker compose up --build

# Démarrer en arrière-plan
docker compose up --build -d

# Arrêter
docker compose down

# Arrêter et supprimer tout (données aussi)
docker compose down -v
```

---

## 📝 Logs

```bash
# Tous les logs
docker compose logs -f

# Juste le backend
docker compose logs -f backend

# Juste le frontend
docker compose logs -f frontend

# Juste la DB
docker compose logs -f db

# Les 100 dernières lignes du backend
docker compose logs backend --tail=100
```

---

## 💻 Accès aux containers

```bash
# Terminal bash dans le backend (Linux-like)
docker compose exec backend bash

# Terminal sh dans le frontend (Alpine)
docker compose exec frontend sh

# Terminal dans la DB
docker compose exec db mysql -uuser -ppassword backoffice

# Exécuter une commande unique
docker compose exec backend php artisan migrate:status
docker compose exec backend php artisan cache:clear
```

---

## 📦 Laravel (Backend)

```bash
# Migrations
docker compose exec backend php artisan migrate
docker compose exec backend php artisan migrate:fresh
docker compose exec backend php artisan migrate:fresh --seed

# Cache
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan cache:clear

# Tinker (REPL)
docker compose exec backend php artisan tinker

# Queues (si utilisées)
docker compose exec backend php artisan queue:work

# Symlinks
docker compose exec backend php artisan storage:link
```

---

## 🌐 Frontend (React)

```bash
# Voir la version de node en prod
docker compose exec frontend node --version

# NPM commands
docker compose exec frontend npm install
docker compose exec frontend npm run build
docker compose exec frontend npm test
```

---

## 🗄️ Base de données

```bash
# Se connecter à MySQL
docker compose exec db mysql -uuser -ppassword backoffice

# Commandes SQL utiles:
# > SHOW TABLES;
# > DESCRIBE products;
# > SELECT * FROM users LIMIT 10;
# > exit;

# Backup (dump)
docker compose exec db mysqldump -uuser -ppassword backoffice > backup.sql

# Restore
docker compose exec -T db mysql -uuser -ppassword backoffice < backup.sql
```

---

## 🧪 Tests

```bash
# PHPUnit (Backend)
docker compose exec backend php artisan test

# Jest (Frontend)
docker compose exec frontend npm test
```

---

## 🔍 Debugging

```bash
# Voir les images
docker images

# Voir les containers
docker ps

# Voir les networks
docker network ls

# Inspecter un container
docker inspect app_backend

# Voir les volumes
docker volume ls

# Nettoyer les ressources inutilisées
docker system prune
docker system prune -a  # Avec les images aussi

# Limiter l'espace disk utilisé
docker system df
```

---

## ⚡ Raccourcis pratiques

```bash
# Redémarrer rapide (sans rebuild)
docker compose restart

# Redémarrer un service spécifique
docker compose restart backend

# Reconstruire une image (sans démarrer)
docker compose build backend

# Reconstruire et démarrer
docker compose up --build backend

# Arrêter sans supprimer
docker compose stop

# Redémarrer les services arrêtés
docker compose start
```

---

## 🆘 En cas de problème

```bash
# Voir l'erreur exacte
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Relancer complètement à zéro
docker compose down -v
docker system prune -a  # Attention: supprime tout
docker compose up --build

# Vérifier la santé des services
docker compose ps

# Voir si les ports sont occupés
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

---

## 📝 Makefile (optionnel)

Si vous avez un Makefile :

```bash
make help           # Voir toutes les commandes
make up            # Démarrer
make down          # Arrêter
make logs          # Voir les logs
make bash          # Terminal backend
```

---

## 💡 Tips

```bash
# Voir en direct ce qu'il se passe
watch -n 1 'docker compose ps'  # Rafraîchit chaque 1s

# Exécuter une commande et quitter
docker compose exec -T backend php artisan route:list

# Persister les logs dans un fichier
docker compose logs > logs.txt

# Voir la consommation de ressources
docker stats
```

---

## 🚀 Production (quick reference)

```bash
# Démarrer en arrière-plan
docker compose up -d

# Mise à jour code
git pull
docker compose up --build -d

# Migrations
docker compose exec -T backend php artisan migrate --force

# Logs persistants
docker compose logs -f > app.log &
```

---

## 📞 Quick Help

| Besoin           | Commande                                          |
| ---------------- | ------------------------------------------------- |
| Démarrer         | `docker compose up --build`                       |
| Arrêter          | `docker compose down`                             |
| Logs             | `docker compose logs -f`                          |
| Terminal backend | `docker compose exec backend bash`                |
| Migrations       | `docker compose exec backend php artisan migrate` |
| Reconstruire     | `docker compose up --build`                       |
| Tout nettoyer    | `docker compose down -v`                          |
