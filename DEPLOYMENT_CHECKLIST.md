# 🚀 Checklist de Déploiement

Utilisez cette checklist pour chaque déploiement (dev/staging/prod).

---

## 📋 Pre-Deployment (Avant la construction)

### Code & Git

- [ ] Tous les changements sont commités
- [ ] `git log` montre les changements attendus
- [ ] Pas de fichiers non trackés sensibles
- [ ] `.env` est dans `.gitignore` (jamais commité)
- [ ] `.env.example` est à jour avec toutes les variables

### Configuration

- [ ] `.env` file existe et est complète
- [ ] APP_KEY est unique et valide (`base64:...`)
- [ ] DB credentials sont forts et uniques
- [ ] APP_DEBUG=false en production
- [ ] Tous les chemins/URLs sont corrects pour l'environnement

### Backend Laravel

- [ ] Aucune dépendance manquante: `composer install` passe
- [ ] `composer.lock` est commité
- [ ] Migrations sont à jour
- [ ] Tous les modèles/controllers existent
- [ ] Routes sont valides: `php artisan route:list`
- [ ] Pas d'erreurs PHP strictement

### Frontend React

- [ ] Aucune dépendance manquante: `npm ci` passe
- [ ] `package-lock.json` est commité
- [ ] Build passe sans erreur: `npm run build`
- [ ] Pas de console.error ou console.warn critiques
- [ ] Vite config est correcte pour l'environnement

---

## 🐳 Docker (Avant démarrage)

### Images

- [ ] Dockerfiles sont à jour et valides
- [ ] Pas d'erreurs de syntaxe
- [ ] Chemins COPY/ADD sont corrects
- [ ] Versions des images de base sont stables (pas `latest`)

### Compose Files

- [ ] Services sont correctement nommés
- [ ] Dépendances (`depends_on`) sont valides
- [ ] Ports ne sont pas en conflit (8000, 3000, 3306, 8080)
- [ ] Volumes sont nommés et persistants
- [ ] Networks sont configurées

### Configs

- [ ] nginx.conf pour backend valide
- [ ] nginx.conf pour frontend valide
- [ ] supervisord.conf valide
- [ ] entrypoint.sh est exécutable et valide

---

## 🔐 Sécurité

### Secrets & Passwords

- [ ] Tous les mots de passe sont forts (>20 chars, alphanumérique)
- [ ] APP_KEY est unique et non-réutilisé
- [ ] DB_ROOT_PASSWORD est stocké sécurisé (jamais en versionning)
- [ ] Pas de credentials hardcodées dans le code
- [ ] Fichiers sensibles ont permissions correctes (chmod 600)

### Ports & Firewall

- [ ] En production: Seuls 80 et 443 sont ouverts externally
- [ ] En production: 3306 (DB) est fermé externally
- [ ] En production: 8080 (PhpMyAdmin) n'est PAS exposé

### Logs & Monitoring

- [ ] Logs sont configurés et collectés
- [ ] APP_DEBUG=false en production
- [ ] Erreurs sensibles ne sont pas exposées
- [ ] Monitoring/alerting est en place

---

## 📊 Base de Données

### Schema & Data

- [ ] Migrations sont toutes appliquées
- [ ] Schema matches le code
- [ ] Donnée de seed existantes sont correctes
- [ ] Contraintes de clé étrangère sont valides
- [ ] Indexes de performance sont présents

### Backup

- [ ] Un backup récent existe
- [ ] Backup peut être restauré (testé)
- [ ] Backup est stocké sécurisé
- [ ] Stratégie de backup est documentée

---

## 🚀 Déploiement (Démarrage)

### Premier build

```bash
# Créer .env
cp .env.example .env

# Éditer .env avec les vraies valeurs
nano .env

# Générer APP_KEY (si non fait)
docker run --rm php:8.2-cli php -r "echo 'base64:'.base64_encode(random_bytes(32));"

# Build et démarrage
docker compose -f docker-compose.prod.yml up -d --build
```

- [ ] `docker compose ps` montre tous les services healthy
- [ ] Pas d'erreurs dans les logs: `docker compose logs`
- [ ] Backend répond: `curl http://localhost:8000/api`
- [ ] Frontend charge: `curl http://localhost:3000`

### Migrations & Setup

```bash
# Vérifier que entrypoint.sh a exécuté les migrations
docker compose logs backend | grep "Migrations"

# Sinon manuellement:
docker compose exec backend php artisan migrate --force
```

- [ ] Migrations ont réussi
- [ ] Lien symbolique storage: `docker compose exec backend php artisan storage:link`
- [ ] Cache est chaud: `docker compose exec backend php artisan config:cache`

---

## ✅ Post-Deployment (Après démarrage)

### Fonctionnalité

- [ ] Backend est accessible et répond
- [ ] Frontend charge et se connecte à l'API
- [ ] Login fonctionne
- [ ] Uploads/storage fonctionnent
- [ ] Requêtes API clés répondent correctement

### Performance

- [ ] Temps de réponse API acceptable (<500ms)
- [ ] Frontend charge rapidement
- [ ] Pas de fuites mémoire visibles
- [ ] CPU/Disk usage normal

### Monitoring

- [ ] Logs sont collectés normalement
- [ ] Pas d'erreurs 500 répétées
- [ ] Alertes ne se déclenchent pas sans raison
- [ ] Monitoring est opérationnel

### Backups

- [ ] Premiers backups sont créés
- [ ] Cron/scheduler pour backups est en place
- [ ] Restore procedure est testée

---

## 🔄 Mises à jour (Hot fixes / Releases)

### Avant

- [ ] Créer une branche feature/hotfix
- [ ] Tests localement (dev)
- [ ] Code review complète
- [ ] Tous les conflits Git résolus

### Pull (nouveau code)

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build --no-deps
```

- [ ] Build passe sans erreur
- [ ] Services redémarrent correctement
- [ ] Migrations s'exécutent (si new)
- [ ] Pas de downtime apparent

### Après

- [ ] Vérifier les logs: `docker compose logs -f`
- [ ] Tester les fonctionnalités critiques
- [ ] Vérifier les migrations: `docker compose exec backend php artisan migrate:status`
- [ ] Tester le rollback (si nécessaire)

---

## 🆘 Rollback Plan

Si quelque chose se casse:

```bash
# 1. Arrêter les containers
docker compose -f docker-compose.prod.yml down

# 2. Revenir au code précédent
git revert HEAD~1  # Ou git reset --hard <commit>

# 3. Restaurer la base de données
docker compose -f docker-compose.prod.yml exec -T db mysql -u app_user -p app_db < backup_20250114.sql

# 4. Redémarrer
docker compose -f docker-compose.prod.yml up -d --build
```

- [ ] Rollback a réussi
- [ ] Services fonctionnent post-rollback
- [ ] Données sont correctes

---

## 📝 Documentation

- [ ] DOCKER_SETUP.md est à jour
- [ ] ENV_DOCUMENTATION.md est à jour
- [ ] README.md inclut les instructions Docker
- [ ] Changements break-ing sont documentés
- [ ] Nouvelles variables env sont dans .env.example

---

## 🧹 Cleanup (Après confirmation)

```bash
# Supprimer les anciens containers/images
docker system prune -f

# Supprimer les volumes non utilisés
docker volume prune -f
```

- [ ] Espace disque libéré
- [ ] Pas d'orphan containers
- [ ] Pas d'images inutilisées

---

## 📞 Contacts d'urgence

En cas de problème critique:

- [ ] On sait qui contacter (devops/tech lead)
- [ ] Plan de communication est en place
- [ ] Numéro d'urgence est accessible

---

## ✨ Sign-off

**Date du déploiement**: ******\_\_\_******

**Déployé par**: ******\_\_\_******

**Approuvé par**: ******\_\_\_******

**Notes supplémentaires**:

```
[Espace pour notes]


```

---

**Dernière mise à jour**: 2025-01-14
