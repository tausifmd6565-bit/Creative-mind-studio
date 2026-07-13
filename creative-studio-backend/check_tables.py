"""Quick script to verify all tables were created in Supabase."""
import asyncio
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

from sqlalchemy import text
from app.db.client import engine


async def check():
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")
        )
        tables = [row[0] for row in result]
        print(f"Found {len(tables)} table(s) in Supabase public schema:")
        for t in tables:
            print(f"  {t}")

        expected = {"projects", "boardroom_sessions", "agent_messages", "scorecards", "idea_versions", "follow_ups", "alembic_version"}
        found = set(tables)
        missing = expected - found
        if missing:
            print(f"\nMISSING tables: {missing}")
        else:
            print("\nAll expected tables present!")

asyncio.run(check())
