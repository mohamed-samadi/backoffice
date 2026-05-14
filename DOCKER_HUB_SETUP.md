# Configuration de Docker Hub

Pour livrer votre projet vers Docker Hub et automatiser avec GitHub, suivez ces étapes:

## 1. Configuration Docker Hub

### A. Créer les dépôts

1. Connectez-vous à [Docker Hub](https://hub.docker.com)
2. Créez deux dépôts:
   - `redamohamedberhouma/bizos-backend`
   - `redamohamedberhouma/bizos-frontend`

### B. Générer un token d'accès

1. Allez à **Account Settings** → **Security** → **Access Tokens**
2. Cliquez sur **New Access Token**
3. Créez un token avec:
   - Nom: `github-actions`
   - Permissions: `Read & Write`
4. Copiez le token (vous en aurez besoin)

## 2. Configuration GitHub Secrets

1. Allez à votre dépôt GitHub
2. Accédez à **Settings** → **Secrets and Variables** → **Actions**
3. Ajoutez ces secrets:

| Nom                | Valeur                                             |
| ------------------ | -------------------------------------------------- |
| `DOCKER_USERNAME`  | `redamohamedberhouma`                              |
| `DOCKER_TOKEN`     | Votre token Docker Hub                             |
| `VITE_API_URL`     | `https://api.votredomaine.com` (pour prod)         |
| `VITE_STORAGE_URL` | `https://api.votredomaine.com/storage` (pour prod) |

### Exemple pour développement:

```
VITE_API_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

## 3. Configuration locale (pour tests manuels)

### Sur votre ordinateur:

```bash
# 1. Définir les variables d'environnement
export DOCKER_USERNAME=redamohamedberhouma
export DOCKER_TOKEN=votre_token_docker_hub

# 2. Rendre le script exécutable
chmod +x deliver.sh

# 3. Lancer la livraison
./deliver.sh 1.0.0 production
```

## 4. Flux automatisé avec GitHub Actions

Le workflow GitHub Actions (`docker-build-and-push.yml`) automatise:

### Triggers:

- ✅ Push sur `main`, `develop`, `staging`
- ✅ Pull requests
- ✅ Manuellement via `workflow_dispatch`

### Actions:

1. ✅ Checkout du code
2. ✅ Build des images Docker
3. ✅ Login à Docker Hub
4. ✅ Push des images
5. ✅ Mise à jour de la description Docker Hub

### Tags générés automatiquement:

- `latest` (branche main uniquement)
- `develop` ou `main` (selon la branche)
- `sha-xxxxx` (hash du commit)
- Version sémantique (si vous créez une release)

## 5. Déploiement avec docker-compose

### A. Configuration de production

```bash
# 1. Créer .env pour production
cp .env.example .env.production

# 2. Éditer .env.production avec vos variables
# APP_ENV=production
# APP_DEBUG=false
# DB_PASSWORD=votre_mot_de_passe_fort
# etc.
```

### B. Lancer les services

```bash
# Télécharger et démarrer les images de Docker Hub
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Ou avec rebuild local:
docker compose up --build -d
```

### C. Vérifier le déploiement

```bash
# Voir les logs
docker compose logs -f

# Vérifier les services
docker compose ps

# Tester l'API
curl http://localhost:8000/api/health

# Tester le frontend
curl http://localhost:3000
```

## 6. Commandes utiles

### Build manuel

```bash
# Backend
docker build -f backend/Dockerfile -t redamohamedberhouma/bizos-backend:1.0.0 .

# Frontend
docker build -f frontend/Dockerfile \
  --build-arg VITE_API_URL=http://localhost:8000/api \
  --build-arg VITE_STORAGE_URL=http://localhost:8000/storage \
  -t redamohamedberhouma/bizos-frontend:1.0.0 .
```

### Push manuel

```bash
docker push redamohamedberhouma/bizos-backend:1.0.0
docker push redamohamedberhouma/bizos-frontend:1.0.0
```

### Utiliser les images de Docker Hub

```bash
# Modifier docker-compose.yml
# backend:
#   image: redamohamedberhouma/bizos-backend:1.0.0
# frontend:
#   image: redamohamedberhouma/bizos-frontend:1.0.0

docker compose pull
docker compose up -d
```

## 7. Bonnes pratiques

### Versioning

- Utilisez des versions sémantiques: `1.0.0`, `1.0.1`, `1.1.0`, `2.0.0`
- Maintenez une branche `main` stable
- Utilisez `develop` pour le développement
- Utilisez `staging` pour les tests avant production

### Sécurité

- ✅ Ne commitez jamais `.env`
- ✅ Utilisez les secrets GitHub pour les tokens
- ✅ Régénérez votre token Docker Hub si compromise
- ✅ Limitez les permissions du token d'accès

### Performance

- ✅ Les images sont cachées pour les rebuilds rapides
- ✅ Les stages multi-layer réduisent la taille
- ✅ `.dockerignore` exclut les fichiers inutiles

## 8. Troubleshooting

### Les images ne se push pas

```bash
# Vérifier la connexion Docker Hub
docker login
# Entrer votre username et token

# Vérifier les permissions du token
# (Settings → Secrets → Vérifier DOCKER_TOKEN)
```

### Le build échoue sur GitHub Actions

1. Vérifiez les logs du workflow
2. Assurez-vous que `DOCKER_USERNAME` et `DOCKER_TOKEN` sont correctement définis
3. Testez le build local: `docker compose up --build`

### Les ports sont en conflit

```bash
# Changer les ports dans docker-compose.yml
# ou:
docker compose down  # arrêter les services
docker system prune  # nettoyer
```

## 9. Intégration CI/CD complète

Le workflow GitHub Actions inclut:

- ✅ Build sur chaque push
- ✅ Cache d'images pour les rebuilds rapides
- ✅ Push automatique vers Docker Hub
- ✅ Tags multiples (version, stage, latest)
- ✅ Mise à jour de la description sur Docker Hub

### Visualiser les workflows

```
GitHub → Actions → docker-build-and-push
```

## ✅ Checklist de déploiement

- [ ] Docker Hub dépôts créés
- [ ] Token Docker Hub généré
- [ ] Secrets GitHub configurés
- [ ] Local `.env` configuré
- [ ] `deliver.sh` exécutable et testé
- [ ] Workflow GitHub Actions activé
- [ ] Tests locaux: `docker compose up --build`
- [ ] Première livraison: `./deliver.sh 1.0.0 develop`
- [ ] Vérifier les images sur Docker Hub
- [ ] Production déployée avec docker-compose
