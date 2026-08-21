.PHONY: up down logs test test-backend test-frontend

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

test: test-backend test-frontend

test-backend:
	cd backend && ./mvnw verify

test-frontend:
	cd frontend && npm ci && npm test && npm run build && npm run lint
