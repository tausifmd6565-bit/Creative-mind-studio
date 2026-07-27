"""add_research_packs_and_creative_blueprints

Revision ID: 0003_research_and_blueprints
Revises: 0002_workflow_fields
Create Date: 2026-07-18

Adds two new tables that power the Research Lab and Creative Blueprint
workspace tabs:

  research_packs
  ──────────────
  Stores IBM Granite-generated research packs per project.
  One-to-one with projects (latest pack replaces previous).

  creative_blueprints
  ───────────────────
  Stores IBM Granite-generated creative blueprints per project.
  One-to-one with projects (latest blueprint replaces previous).
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# ── Revision identifiers ──────────────────────────────────────────────────────
revision = "0003_research_and_blueprints"
down_revision = "0002_workflow_fields"
branch_labels = None
depends_on = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _text_array():
    """Return a JSON column — portable across SQLite (dev) and Postgres (prod)."""
    return sa.JSON()


# ── Upgrade ───────────────────────────────────────────────────────────────────

def upgrade() -> None:
    # ── research_packs ────────────────────────────────────────────────────────
    op.create_table(
        "research_packs",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "project_id",
            sa.Integer,
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
            index=True,
        ),
        sa.Column("questions",        sa.JSON(),   nullable=False, server_default="[]"),
        sa.Column("sources",          sa.JSON(),   nullable=False, server_default="[]"),
        sa.Column("claims",           sa.JSON(),   nullable=False, server_default="[]"),
        sa.Column("confidence_score", sa.Float,    nullable=False, server_default="0.0"),
        sa.Column("raw_granite",      sa.Text,     nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
    )

    # ── creative_blueprints ───────────────────────────────────────────────────
    op.create_table(
        "creative_blueprints",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "project_id",
            sa.Integer,
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
            index=True,
        ),
        sa.Column("narrative",         sa.Text,   nullable=True),
        sa.Column("script",            sa.Text,   nullable=True),
        sa.Column("scenes",            sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("broll_suggestions", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("motion_graphics",   sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("editing_notes",     sa.Text,   nullable=True),
        sa.Column("platforms",         sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("timeline",          sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("raw_granite",       sa.Text,   nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
    )


# ── Downgrade ─────────────────────────────────────────────────────────────────

def downgrade() -> None:
    op.drop_table("creative_blueprints")
    op.drop_table("research_packs")
