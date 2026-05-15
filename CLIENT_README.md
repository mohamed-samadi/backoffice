# 🐳 BizOS — Installation et Déploiement

Bienvenue! Ce document explique comment installer et utiliser l'application BizOS avec Docker.

---

## 📋 Prérequis

- **Docker Desktop** installé: https://www.docker.com/products/docker-desktop
  - Windows, macOS ou Linux
  - Toute version récente (2023 ou plus)

**C'est tout ce qu'il faut!** Le reste est inclus dans les images Docker.

---

## 🚀 Installation (5 minutes)

### Étape 1 — Créer le fichier .env

```bash
cp .env.example .env
```

### Étape 2 — Configurer les variables d'environnement

Ouvrir le fichier `.env` et renseigner les valeurs:

```env
# Obligatoire
APP_KEY=base64:...                    # ← Laisser tel quel
DB_PASSWORD=votre_mot_de_passe_fort  # ← Changer ABSOLUMENT
APP_URL=https://votre-domaine.com    # ← Votre domaine
VITE_API_URL=https://votre-domaine.com/api
VITE_STORAGE_URL=https://votre-domaine.com/storage

# Docker Hub (fourni par nous)
DOCKER_USERNAME=mon-username           # ← Nous vous le donnerons
IMAGE_TAG=v1.0.0                       # ← Version (ex: v1.0.0, v1.1.0)
```

### Étape 3 — Démarrer l'application

```bash
docker compose -f docker-compose.prod.yml up -d
```

Attendez 30 secondes (initialisation de la base de données).

### Étape 4 — Vérifier que tout fonctionne

```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs

# Vérifier les services
docker compose -f docker-compose.prod.yml ps
```

Tous les services doivent être `Up`.

---

## ✅ Accès à l'Application

| Service                  | URL                           |
| ------------------------ | ----------------------------- |
| **Application Frontend** | https://votre-domaine.com     |
| **API Backend**          | https://votre-domaine.com/api |

---

## 🔄 Mises à Jour

Quand une nouvelle version est disponible:

### Option 1 — Simple (Recommandée)

```bash
# 1. Télécharger les dernières images
docker compose -f docker-compose.prod.yml pull

# 2. Redémarrer avec les nouvelles images
docker compose -f docker-compose.prod.yml up -d

# 3. Vérifier que tout fonctionne
docker compose -f docker-compose.prod.yml logs
```

### Option 2 — Avec changement de version

Si la version change (ex: v1.0.0 → v1.1.0):

```bash
# 1. Éditer .env
nano .env
# Changer: IMAGE_TAG=v1.1.0

# 2. Redémarrer
docker compose -f docker-compose.prod.yml up -d --pull always

# 3. Vérifier
docker compose -f docker-compose.prod.yml logs
```

---

## 🆘 Dépannage

### L'application ne démarre pas

```bash
# Voir les erreurs
docker compose -f docker-compose.prod.yml logs

# Chercher "ERROR" ou "Exception" dans les logs
```

### "Connection refused" ou erreur base de données

```bash
# Attendre 60 secondes (init DB)
# Puis réessayer

# Ou redémarrer
docker compose -f docker-compose.prod.yml restart
```

### Oublier .env ou erreur de configuration

```bash
# 1. Vérifier .env existe
ls -la .env

# 2. Vérifier les variables
grep "APP_KEY\|DB_PASSWORD\|APP_URL" .env

# 3. Éditer si nécessaire
nano .env

# 4. Redémarrer
docker compose -f docker-compose.prod.yml restart
```

### Impossible de se connecter à l'app

```bash
# Vérifier que le port 80 est ouvert
# Si derrière un reverse proxy (Nginx), vérifier la configuration

# Vérifier la connectivité
curl http://localhost:8000/api   # Backend interne
```

---

## 💾 Sauvegardes

### Créer une sauvegarde de la base de données

```bash
docker compose -f docker-compose.prod.yml exec db mysqldump \
  -u app_user -p app_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

Vous serez invité à entrer le mot de passe (= valeur de `DB_PASSWORD` dans `.env`).

### Restaurer une sauvegarde

```bash
docker compose -f docker-compose.prod.yml exec -T db mysql \
  -u app_user -p app_db < backup_20250114_120000.sql
```

---

## 📊 Commandes Utiles

```bash
# Voir les logs en temps réel
docker compose -f docker-compose.prod.yml logs -f

# Voir uniquement les erreurs
docker compose -f docker-compose.prod.yml logs | grep -i error

# Arrêter (proprement)
docker compose -f docker-compose.prod.yml down

# Arrêter et supprimer tout (⚠️ perte de données)
docker compose -f docker-compose.prod.yml down -v
```

---

## 📞 Support

Si vous rencontrez un problème:

1. **Vérifiez les logs**: `docker compose logs -f`
2. **Vérifiez les variables .env**: `cat .env`
3. **Contactez le support** avec:
   - Les logs d'erreur
   - Les étapes que vous avez suivies
   - Votre configuration (.env sanisé, sans mots de passe)

---

## 🔐 Sécurité

- ✅ Gardez `.env` sécurisé (jamais en ligne)
- ✅ Utilisez des mots de passe forts dans `.env`
- ✅ Changez régulièrement les mots de passe
- ✅ Faites des sauvegardes régulières
- ✅ Mettez à jour régulièrement (nouvelles versions)

---

## 📚 Documentation Complète

Pour plus de détails techniques, consultez:

- **DOCKER_SETUP.md** — Guide complet
- **QUICK_REFERENCE.md** — Commandes courantes
- **DEPLOYMENT_CHECKLIST.md** — Checklist de sécurité

---

## ✨ Résumé

```bash
# 1. Configuration (une fois)
cp .env.example .env
nano .env  # Renseigner vos valeurs

# 2. Démarrer (une fois)
docker compose -f docker-compose.prod.yml up -d

# 3. Accéder
# https://votre-domaine.com

# 4. Mettre à jour (quand nouvelleversion)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

**Questions?** Consultez le support ou la documentation complète.

**Bonne utilisation!** 🚀
