# -*- coding: utf-8 -*-
"""
validate_env.py - Run this script to verify your .env is complete and correct.
Usage: python validate_env.py
"""

import os
import sys
from pathlib import Path

# Load .env manually (no external deps required)
env_path = Path(__file__).parent / ".env"
if not env_path.exists():
    print("FAIL  .env file not found. Copy .env.example to .env and fill in your values.")
    sys.exit(1)

with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#"):
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

# ── Required variables and their validation rules ──────────────────────────────

REQUIRED = {
    # IBM watsonx.ai
    "WATSONX_API_KEY": {
        "desc": "IBM Cloud API key",
        "bad_values": ["your_ibm_cloud_api_key_here", ""],
        "hint": "IBM Cloud -> Manage -> Access (IAM) -> API Keys",
    },
    "WATSONX_PROJECT_ID": {
        "desc": "watsonx.ai Project ID",
        "bad_values": ["your_watsonx_project_id_here", ""],
        "hint": "watsonx.ai -> Projects -> your project -> Manage -> Project ID",
    },
    "WATSONX_URL": {
        "desc": "watsonx.ai regional endpoint",
        "bad_values": ["", "https://dataplatform.cloud.ibm.com/wx/home?context=wx"],
        "must_start": "https://",
        "must_contain": "ml.cloud.ibm.com",
        "hint": "Use the API endpoint e.g. https://us-south.ml.cloud.ibm.com — NOT the dashboard URL",
    },
    "WATSONX_MODEL_ID": {
        "desc": "Granite model ID",
        "bad_values": [""],
        "hint": "e.g. ibm/granite-3-8b-instruct",
    },
    # Supabase
    "SUPABASE_URL": {
        "desc": "Supabase project URL",
        "bad_values": ["https://your-project-ref.supabase.co", ""],
        "must_start": "https://",
        "hint": "Supabase dashboard -> Settings -> API -> Project URL",
    },
    "SUPABASE_SERVICE_KEY": {
        "desc": "Supabase service role key",
        "bad_values": ["your_supabase_service_role_key_here", ""],
        "hint": "Supabase dashboard -> Settings -> API -> service_role key",
    },
    "DATABASE_URL": {
        "desc": "Async PostgreSQL connection string",
        "bad_values": [""],
        "must_contain": "postgresql",
        "must_not_contain": "[YOUR-PASSWORD]",
        "hint": "Supabase -> Settings -> Database -> Connection string (Direct). Replace [YOUR-PASSWORD].",
    },
    "DATABASE_URL_SYNC": {
        "desc": "Sync PostgreSQL connection string (for Alembic)",
        "bad_values": [""],
        "must_contain": "postgresql",
        "must_not_contain": "[YOUR-PASSWORD]",
        "hint": "Same as DATABASE_URL but without +asyncpg driver prefix.",
    },
    # App
    "APP_ENV": {
        "desc": "Runtime environment",
        "bad_values": [""],
        "allowed_values": ["development", "staging", "production"],
        "hint": "Use: development | staging | production",
    },
}

OPTIONAL = {
    "GRANITE_TIMEOUT_SECONDS": "60",
    "GRANITE_MAX_NEW_TOKENS": "1024",
    "GRANITE_TEMPERATURE": "0.7",
    "DEBUG": "true",
    "CORS_ORIGINS": "http://localhost:3000",
    "APP_VERSION": "0.1.0",
}

# ── Run checks ─────────────────────────────────────────────────────────────────

errors = []
warnings = []
ok = []

for key, rules in REQUIRED.items():
    value = os.environ.get(key, "")

    if not value or value in rules.get("bad_values", []):
        errors.append(f"  [FAIL] {key} - not set or still a placeholder\n         Hint: {rules['hint']}")
        continue

    if "must_start" in rules and not value.startswith(rules["must_start"]):
        errors.append(f"  [FAIL] {key} - must start with '{rules['must_start']}' (got: {value[:40]})\n         Hint: {rules['hint']}")
        continue

    if "must_contain" in rules and rules["must_contain"] not in value:
        errors.append(f"  [FAIL] {key} - must contain '{rules['must_contain']}'\n         Hint: {rules['hint']}")
        continue

    if "must_not_contain" in rules and rules["must_not_contain"] in value:
        errors.append(f"  [FAIL] {key} - still contains placeholder '{rules['must_not_contain']}'\n         Hint: {rules['hint']}")
        continue

    if "allowed_values" in rules and value not in rules["allowed_values"]:
        errors.append(f"  [FAIL] {key} - must be one of {rules['allowed_values']} (got: {value})\n         Hint: {rules['hint']}")
        continue

    ok.append(f"  [OK] {key}")

for key, default in OPTIONAL.items():
    value = os.environ.get(key, "")
    if not value:
        warnings.append(f"  [WARN] {key} - not set, will use default: {default}")
    else:
        ok.append(f"  [OK] {key}")

# ── Print report ───────────────────────────────────────────────────────────────

print("\n==========================================")
print("  CreativeMind Studio - .env Validator")
print("==========================================\n")

if ok:
    print("PASSED:")
    print("\n".join(ok))
    print()

if warnings:
    print("WARNINGS (optional - defaults will be used):")
    print("\n".join(warnings))
    print()

if errors:
    print("ERRORS (must fix before running the app):")
    print("\n".join(errors))
    print()
    print(f"[FAIL]  {len(errors)} error(s) found. Fix them in your .env file.")
    sys.exit(1)
else:
    print(f"[OK]  All required variables are set. Your .env looks good!")
    print("      You are ready to proceed with Sub-Task 1 (project scaffold).\n")
