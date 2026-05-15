# 🔐 Variables d'Environnement — Documentation

## 📋 Vue d'ensemble

Le fichier `.env` contient toutes les configurations sensibles et spécifiques à votre environnement.

⚠️ **Important**: Ne jamais commiter `.env` dans Git. Il contient des mots de passe et clés secrètes.

---

## 🔑 Variables Backend

### App Configuration

| Variable    | Valeur Dev              | Valeur Prod                | Description                                |
| ----------- | ----------------------- | -------------------------- | ------------------------------------------ |
| `APP_KEY`   | Généré automatiquement  | À générer                  | Clé de chiffrement Laravel (obligatoire)   |
| `APP_NAME`  | `BizOS`                 | `BizOS`                    | Nom de l'application                       |
| `APP_ENV`   | `local`                 | `production`               | Environnement (local, staging, production) |
| `APP_DEBUG` | `true`                  | `false`                    | Mode debug (affiche les erreurs)           |
| `APP_URL`   | `http://localhost:8000` | `https://votredomaine.com` | URL de base du backend                     |

### Database Configuration

| Variable           | Valeur Dev     | Valeur Prod          | Description                 |
| ------------------ | -------------- | -------------------- | --------------------------- |
| `DB_CONNECTION`    | `mysql`        | `mysql`              | Type de base de données     |
| `DB_HOST`          | `db`           | `db`                 | Nom du service Docker ou IP |
| `DB_PORT`          | `3306`         | `3306`               | Port MySQL                  |
| `DB_DATABASE`      | `app_db`       | `app_db`             | Nom de la base de données   |
| `DB_USERNAME`      | `app_user`     | `app_user`           | Utilisateur MySQL           |
| `DB_PASSWORD`      | `app_password` | `**changé en prod**` | Mot de passe MySQL          |
| `DB_ROOT_PASSWORD` | `rootpassword` | `**fort en prod**`   | Mot de passe root MySQL     |

### File Storage

| Variable          | Valeur   | Description                                           |
| ----------------- | -------- | ----------------------------------------------------- |
| `FILESYSTEM_DISK` | `public` | Disque de stockage par défaut (fichiers utilisateurs) |

---

## 🎨 Variables Frontend

| Variable           | Valeur Dev                      | Valeur Prod                        | Description                               |
| ------------------ | ------------------------------- | ---------------------------------- | ----------------------------------------- |
| `VITE_API_URL`     | `http://localhost:8000/api`     | `https://votredomaine.com/api`     | URL de l'API (utilisée par Vite au build) |
| `VITE_STORAGE_URL` | `http://localhost:8000/storage` | `https://votredomaine.com/storage` | URL du storage (images, uploads)          |

---

## ⚙️ Configuration avancée (optionnel)

### Cache & Session

```env
# Redis (pour cache/sessions/queue)
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### Mail

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=xxx
MAIL_PASSWORD=xxx
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="BizOS"
```

### Logging

```env
LOG_CHANNEL=stack
LOG_LEVEL=debug  # local: debug | prod: warning
```

---

## 🔒 Sécurité en Production

### ✅ Checklist avant déploiement

1. **APP_KEY**: Générer une nouvelle clé unique

   ```bash
   docker run --rm php:8.2-cli php -r "echo 'base64:'.base64_encode(random_bytes(32));"
   ```

2. **Mots de passe forts**:
   - `DB_PASSWORD`: Au minimum 20 caractères aléatoires
   - `DB_ROOT_PASSWORD`: Stocké sécurisé, jamais utilisé en production normale

3. **URLs correctes**:
   - `APP_URL`: Votre domaine réel (https)
   - `VITE_API_URL`: Même domaine (https)
   - `VITE_STORAGE_URL`: Même domaine (https)

4. **APP_DEBUG**: Toujours `false` en production

5. **Permissions .env**:

   ```bash
   chmod 600 .env
   ```

6. **Logs sécurisés**:
   - Limiter l'accès aux logs
   - Monitorer les erreurs en production

---

## 🐳 Variables Docker

Ces variables sont lues automatiquement par Docker Compose:

```env
# Docker ignore ces variables, elles viennent de docker-compose.yml
# Mais parfois il faut les définir manuellement:

COMPOSE_PROJECT_NAME=bizos
```

---

## 🔧 Comment générer une clé APP_KEY?

### Option 1: Automatiquement (init-docker.sh)

```bash
bash init-docker.sh
# La clé est générée et écrite automatiquement
```

### Option 2: Manuellement

```bash
# Générer
docker run --rm php:8.2-cli php -r "echo 'base64:'.base64_encode(random_bytes(32));"

# Puis écrire dans .env:
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option 3: Depuis un container actif

```bash
docker compose exec backend php artisan key:generate --show
docker compose exec backend php artisan key:generate
```

---

## 🌍 Exemple de configuration par environnement

### Development (.env)

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_HOST=db
DB_PASSWORD=app_password

VITE_API_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

### Staging (.env.staging)

```env
APP_ENV=staging
APP_DEBUG=true
APP_URL=https://staging.example.com

DB_HOST=db.staging
DB_PASSWORD=<strong_password>

VITE_API_URL=https://staging.example.com/api
VITE_STORAGE_URL=https://staging.example.com/storage
```

### Production (.env.production)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://example.com

DB_HOST=db.production
DB_PASSWORD=<very_strong_password>

VITE_API_URL=https://example.com/api
VITE_STORAGE_URL=https://example.com/storage
```

---

## 📝 Validation du .env

Avant de démarrer, vérifiez:

```bash
# Les variables essentielles sont définies
grep -E "(APP_KEY|DB_PASSWORD|APP_URL|VITE_API_URL)" .env

# Le .env n'est pas commité
git status | grep .env  # Ne doit rien afficher
```

---

## 🚨 Troubleshooting

### APP_KEY non défini

```
LogicException: No application encryption key has been specified.
```

→ Générer avec: `docker compose exec backend php artisan key:generate`

### Impossible de se connecter à la base

```
SQLSTATE[HY000] [2002] Connection refused
```

→ Vérifier `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`
→ Attendre que le container db soit healthy

### CORS ou API unreachable

```
CORS blocked / Cannot reach API
```

→ Vérifier `VITE_API_URL` en frontend
→ Vérifier `APP_URL` en backend

---

## 💡 Bonnes pratiques

1. **Ne jamais** hardcoder les secrets dans le code
2. **Toujours** utiliser des variables d'environnement
3. **Jamais** commiter `.env` (uniquement `.env.example`)
4. **Régulièrement** changer les mots de passe en production
5. **Documenter** toute nouvelle variable d'env utilisée
6. **Limiter** l'accès au fichier `.env` (chmod 600)
