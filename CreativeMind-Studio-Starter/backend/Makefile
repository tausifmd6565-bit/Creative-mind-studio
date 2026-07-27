.PHONY: install dev test lint migrate migration clean

# Install all dependencies including dev extras
install:
	pip install -e ".[dev]"

# Run the development server with hot-reload
dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run all tests (no live DB or IBM credentials needed)
test:
	pytest tests/ -v

# Run linter and formatter check
lint:
	ruff check app/ tests/
	ruff format --check app/ tests/

# Apply all pending Alembic migrations
migrate:
	alembic upgrade head

# Create a new Alembic migration (usage: make migration msg="your message")
migration:
	alembic revision --autogenerate -m "$(msg)"

# Clean compiled Python files
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
