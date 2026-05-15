# 🐳 BizOS — Infrastructure Docker

Infrastructure complète Docker pour application Laravel + React.

> **Version**: 1.0.0  
> **Mise à jour**: 2025-01-14

---

## 🚀 Quick Start

```bash
# 1. Cloner et configurer
git clone <repo>
cd projet
bash init-docker.sh

# 2. Services disponibles
# Frontend:    http://localhost:3000
# Backend API: http://localhost:8000
# PhpMyAdmin:  http://localhost:8080

# 3. Arrêter quand terminé
docker compose down
```

---

## 📁 Structure du Projet

```
project/
├── .env.example              ← Variables d'environnement
├── .gitignore               ← Fichiers ignorés
├── docker-compose.yml       ← Dev (avec services optionnels)
├── docker-compose.prod.yml  ← Production
├── init-docker.sh          ← Script d'initialisation
├── Makefile                ← Commandes pratiques
│
├── DOCKER_SETUP.md          ← Guide d'utilisation
├── DOCKER_ARCHITECTURE.md   ← Architecture complète
├── ENV_DOCUMENTATION.md     ← Variables d'env
├── DEPLOYMENT_CHECKLIST.md  ← Checklist déploiement
│
├── backend/
│   ├── Dockerfile
│   ├── docker/
│   │   ├── nginx.conf       ← Configuration Nginx backend
│   │   ├── supervisord.conf ← Process manager
│   │   └── entrypoint.sh    ← Startup script
│   └── ... (code Laravel)
│
└── frontend/
    ├── Dockerfile
    ├── docker/
    │   └── nginx.conf       ← Configuration Nginx frontend
    └── ... (code React)
```

---

## 🎯 Technologies

| Component   | Version   | Role                     |
| ----------- | --------- | ------------------------ |
| **PHP**     | 8.2-fpm   | Application backend      |
| **Laravel** | 10.x      | Framework backend        |
| **React**   | 18.x      | Frontend framework       |
| **Vite**    | 5.x       | Frontend build tool      |
| **Node.js** | 20-alpine | Frontend runtime (build) |
| **MySQL**   | 8.0       | Base de données          |
| **Nginx**   | latest    | Web server               |
| **Docker**  | -         | Container orchestration  |

---

## 📖 Documentation

### Pour commencer

1. **[DOCKER_SETUP.md](DOCKER_SETUP.md)** — Guide complet d'utilisation
2. **[ENV_DOCUMENTATION.md](ENV_DOCUMENTATION.md)** — Variables d'environnement

### Pour comprendre

3. **[DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)** — Architecture détaillée

### Pour déployer

4. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** — Checklist pré/post-déploiement

---

## 🔧 Commandes Essentielles

### Makefile (Recommandé)

```bash
make help              # Affiche l'aide
make init             # Initialisation first-time
make up               # Démarrer
make down             # Arrêter
make logs             # Voir les logs
make bash             # Terminal backend
make migrate          # Exécuter migrations
make db-backup        # Backup BDD
```

### Docker Compose (Directement)

```bash
# Démarrer
docker compose up -d

# Logs
docker compose logs -f

# Terminal backend
docker compose exec backend bash

# Arrêter
docker compose down
```

---

## 🌍 Environnements

### Development

```bash
docker compose up -d
# Accès: http://localhost:3000, http://localhost:8000
```

### Production

```bash
docker compose -f docker-compose.prod.yml \
  --env-file .env up -d --build
# Accès: https://yourdomain.com
```

---

## 📊 Services

| Service         | Port                  | Usage         | Dev | Prod |
| --------------- | --------------------- | ------------- | --- | ---- |
| **Frontend**    | 3000 (dev), 80 (prod) | React App     | ✅  | ✅   |
| **Backend API** | 8000                  | Laravel API   | ✅  | ✅   |
| **Database**    | 3306                  | MySQL         | ✅  | ✅   |
| **phpMyAdmin**  | 8080                  | DB Management | ✅  | ❌   |

---

## 🔐 Configuration Sécurité

### Avant Déploiement

- [ ] APP_KEY générée et unique
- [ ] Mots de passe forts (>20 chars)
- [ ] APP_DEBUG=false en production
- [ ] URLs correctes (HTTPS)
- [ ] .env jamais commité
- [ ] Ports firewall configurés

Voir [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) pour la checklist complète.

---

## 🚀 Déploiement

### Premier déploiement

```bash
# 1. Cloner
git clone <repo> && cd projet

# 2. Configuration
cp .env.example .env
# Éditer .env avec vraies valeurs

# 3. Générer APP_KEY
docker run --rm php:8.2-cli \
  php -r "echo 'base64:'.base64_encode(random_bytes(32));"
# Copier dans .env

# 4. Démarrer
docker compose -f docker-compose.prod.yml up -d --build

# 5. Vérifier
docker compose -f docker-compose.prod.yml ps
```

### Mises à jour

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build --no-deps
```

### Backups

```bash
# Sauvegarder
docker compose exec db mysqldump -u app_user -p app_db \
  > backup_$(date +%Y%m%d).sql

# Restaurer
docker compose exec -T db mysql -u app_user -p app_db \
  < backup_20250114.sql
```

---

## 🛠️ Troubleshooting

### Container ne démarre pas

```bash
docker compose logs backend    # Voir les erreurs
docker compose build --no-cache backend
```

### API unreachable

```bash
docker compose ps              # Vérifier les services
docker compose exec backend curl http://backend:80/api/
```

### Permission denied

```bash
docker compose exec backend chmod -R 755 storage bootstrap/cache
```

Voir [DOCKER_SETUP.md](DOCKER_SETUP.md#troubleshooting) pour plus.

---

## 📚 Ressources

- **[Docker Docs](https://docs.docker.com/)**
- **[Docker Compose](https://docs.docker.com/compose/)**
- **[Laravel](https://laravel.com/)**
- **[React](https://react.dev/)**
- **[Vite](https://vitejs.dev/)**

---

## 🤝 Support

Pour les problèmes ou questions:

1. Consulter la documentation ([DOCKER_SETUP.md](DOCKER_SETUP.md))
2. Vérifier les logs: `docker compose logs -f`
3. Consulter [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
4. Contacter le team DevOps

---

## 📝 Checklist de Déploiement

Avant chaque déploiement, utiliser [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md):

- [ ] Code mergé et testé
- [ ] .env configuré correctement
- [ ] APP_KEY généré
- [ ] APP_DEBUG=false
- [ ] Backups créés
- [ ] Tests post-déploiement réussis

---

## 📄 License

Voir LICENSE file.

---

## ✨ Version History

| Version | Date       | Notes                            |
| ------- | ---------- | -------------------------------- |
| 1.0.0   | 2025-01-14 | Infrastructure initiale complète |

---

**Dernière mise à jour**: 2025-01-14  
**Maintenu par**: BizOS Team
