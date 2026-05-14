# 🐳 Makefile — BizOS Docker Commands

.PHONY: help init up down logs bash artisan npm db-backup db-restore

# Variables
COMPOSE_FILE := docker-compose.yml
COMPOSE_PROD := docker-compose.prod.yml
BACKEND := app_backend
FRONTEND := app_frontend
DB := app_db

help: ## 📖 Afficher cette aide
	@echo "╔════════════════════════════════════════════════════════╗"
	@echo "║          🐳 BizOS — Docker Makefile Commands          ║"
	@echo "╚════════════════════════════════════════════════════════╝"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'
	@echo ""

# ─────────────────────────────────────────────────────────────────────────
# 🚀 Initialization
# ─────────────────────────────────────────────────────────────────────────

init: ## 🔧 Initialiser le projet (first-time setup)
	@bash init-docker.sh

build: ## 🔨 Builder les images
	docker compose -f $(COMPOSE_FILE) build

# ─────────────────────────────────────────────────────────────────────────
# ▶️ Lifecycle
# ─────────────────────────────────────────────────────────────────────────

up: ## ▶️  Démarrer les containers
	docker compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Services running:"
	@echo "   Backend:   http://localhost:8000"
	@echo "   Frontend:  http://localhost:3000"

down: ## ⏹️  Arrêter les containers
	docker compose -f $(COMPOSE_FILE) down

restart: ## 🔄 Redémarrer
	docker compose -f $(COMPOSE_FILE) restart

# ─────────────────────────────────────────────────────────────────────────
# 📊 Logs & Status
# ─────────────────────────────────────────────────────────────────────────

ps: ## 📊 Afficher le statut des containers
	docker compose -f $(COMPOSE_FILE) ps

logs: ## 📋 Afficher les logs (tout)
	docker compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## 📋 Logs du backend
	docker compose -f $(COMPOSE_FILE) logs backend -f

logs-frontend: ## 📋 Logs du frontend
	docker compose -f $(COMPOSE_FILE) logs frontend -f

logs-db: ## 📋 Logs de la base de données
	docker compose -f $(COMPOSE_FILE) logs db -f

# ─────────────────────────────────────────────────────────────────────────
# 🔧 Shell Access
# ─────────────────────────────────────────────────────────────────────────

bash: ## 💻 Terminal dans le backend
	docker compose -f $(COMPOSE_FILE) exec $(BACKEND) bash

bash-frontend: ## 💻 Terminal dans le frontend
	docker compose -f $(COMPOSE_FILE) exec $(FRONTEND) sh

mysql: ## 🗄️  MySQL CLI
	docker compose -f $(COMPOSE_FILE) exec $(DB) mysql -u app_user -p app_db

# ─────────────────────────────────────────────────────────────────────────
# 🎯 Laravel / Artisan
# ─────────────────────────────────────────────────────────────────────────

artisan: ## php artisan (usage: make artisan cmd="migrate")
	docker compose -f $(COMPOSE_FILE) exec $(BACKEND) php artisan $(cmd)

migrate: ## ⬆️  Exécuter les migrations
	docker compose -f $(COMPOSE_FILE) exec $(BACKEND) php artisan migrate

migrate-seed: ## ⬆️  Migrations + seeding
	docker compose -f $(COMPOSE_FILE) exec $(BACKEND) php artisan migrate --seed

seed: ## 🌱 Seeder la base de données
	docker compose -f $(COMPOSE_FILE) exec $(BACKEND) php artisan db:seed

cache-clear: ## 🗑️  Vider le cache
	docker compose -f $(COMPOSE_FILE) exec $(BACKEND) php artisan cache:clear

tinker: ## 🔮 Tinker (REPL)
	docker compose -f $(COMPOSE_FILE) exec $(BACKEND) php artisan tinker

# ─────────────────────────────────────────────────────────────────────────
# 📦 NPM / Frontend
# ─────────────────────────────────────────────────────────────────────────

npm: ## npm install/update (usage: make npm cmd="install package-name")
	docker compose -f $(COMPOSE_FILE) exec $(FRONTEND) npm $(cmd)

npm-install: ## npm install
	docker compose -f $(COMPOSE_FILE) exec $(FRONTEND) npm install

npm-build: ## npm run build
	docker compose -f $(COMPOSE_FILE) exec $(FRONTEND) npm run build

# ─────────────────────────────────────────────────────────────────────────
# 💾 Database
# ─────────────────────────────────────────────────────────────────────────

db-backup: ## 💾 Sauvegarder la base de données
	@mkdir -p backups
	docker compose -f $(COMPOSE_FILE) exec $(DB) mysqldump -u app_user -p app_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup créé: backups/backup_$$(date +%Y%m%d).sql"

db-restore: ## ♻️  Restaurer la base (usage: make db-restore file="backups/backup_20250114.sql")
	docker compose -f $(COMPOSE_FILE) exec -T $(DB) mysql -u app_user -p app_db < $(file)
	@echo "✅ Base restaurée depuis $(file)"

db-shell: ## 🔧 Shell MySQL interactif
	docker compose -f $(COMPOSE_FILE) exec $(DB) mysql -u app_user -p app_db

# ─────────────────────────────────────────────────────────────────────────
# 🚀 Production
# ─────────────────────────────────────────────────────────────────────────

prod-up: ## 🚀 Démarrer en production
	docker compose -f $(COMPOSE_PROD) --env-file .env up -d --build

prod-down: ## ⏹️  Arrêter la production
	docker compose -f $(COMPOSE_PROD) down

prod-logs: ## 📋 Logs production
	docker compose -f $(COMPOSE_PROD) logs -f

prod-ps: ## 📊 Statut production
	docker compose -f $(COMPOSE_PROD) ps

# ─────────────────────────────────────────────────────────────────────────
# 🐳 Docker Hub & Deployment
# ─────────────────────────────────────────────────────────────────────────

build-and-push: ## 🐳 Build & Push Docker Hub (usage: make build-and-push cmd="v1.0.0")
	@bash build-and-push.sh $(cmd)

release: ## 🏷️  Créer une release (usage: make release cmd="v1.0.0")
	@bash release.sh $(cmd)

docker-login: ## 🔑 Se connecter à Docker Hub
	docker login

docker-pull-prod: ## 📥 Télécharger les images prod
	docker compose -f $(COMPOSE_PROD) pull

# ─────────────────────────────────────────────────────────────────────────
# 🧹 Cleanup
# ─────────────────────────────────────────────────────────────────────────

clean: ## 🧹 Arrêter et nettoyer
	docker compose -f $(COMPOSE_FILE) down

clean-all: ## 🧹 Supprimer tout (⚠️ perte de données!)
	docker compose -f $(COMPOSE_FILE) down -v --rmi all

prune: ## 🧹 Nettoyer les images/volumes inutilisés
	docker system prune -f

# ─────────────────────────────────────────────────────────────────────────
# ✨ Utilities
# ─────────────────────────────────────────────────────────────────────────

fresh: down up migrate-seed ## 🔄 Reset complet: down + up + migrate + seed

status: ps logs-backend ## 📊 Status rapide
