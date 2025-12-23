# Makefile for common development tasks

.PHONY: help build up down restart logs test migrate init clean

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs
	docker-compose logs -f

logs-api: ## Show API logs only
	docker-compose logs -f api

logs-db: ## Show database logs only
	docker-compose logs -f db

test: ## Run tests
	docker-compose exec api pytest tests/ -v

test-unit: ## Run unit tests only
	docker-compose exec api pytest tests/unit/ -v

test-integration: ## Run integration tests only
	docker-compose exec api pytest tests/integration/ -v

test-coverage: ## Run tests with coverage
	docker-compose exec api pytest --cov=app --cov-report=html --cov-report=term

migrate: ## Run database migrations
	docker-compose exec api alembic upgrade head

migrate-create: ## Create a new migration (use: make migrate-create MSG="description")
	docker-compose exec api alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Rollback last migration
	docker-compose exec api alembic downgrade -1

init: ## Initialize database with admin user
	docker-compose exec api python scripts/init_db.py

shell: ## Open Python shell in API container
	docker-compose exec api python

db-shell: ## Open PostgreSQL shell
	docker-compose exec db psql -U influencer_user -d influencers_platform

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all

format: ## Format code with black
	docker-compose exec api black app/ tests/

lint: ## Lint code with flake8
	docker-compose exec api flake8 app/ tests/

setup: build up migrate init ## Complete setup (build, up, migrate, init)
	@echo "✅ Setup complete! API running at http://localhost:8000"
	@echo "📚 Docs available at http://localhost:8000/docs"
