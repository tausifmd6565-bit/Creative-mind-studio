# Intentionally empty — do not eagerly import app.main here.
# Alembic imports app.config and app.db.models directly; a top-level
# `from app.main import app` would trigger router registration and fail
# if optional API modules are not yet on sys.path.
#
# To get the FastAPI application instance use:
#   from app.main import app
