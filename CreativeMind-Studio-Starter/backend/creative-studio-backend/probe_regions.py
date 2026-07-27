"""Probe all watsonx.ai regional endpoints to find the one that works for your project."""
import asyncio
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

from app.config import settings

REGIONS = [
    ("US South",    "https://us-south.ml.cloud.ibm.com"),
    ("EU (Germany)","https://eu-de.ml.cloud.ibm.com"),
    ("AP (Japan)",  "https://jp-tok.ml.cloud.ibm.com"),
    ("EU (UK)",     "https://eu-gb.ml.cloud.ibm.com"),
    ("AP (Sydney)", "https://au-syd.ml.cloud.ibm.com"),
    ("CA (Toronto)","https://ca-tor.ml.cloud.ibm.com"),
]


async def probe(name, url):
    import httpx
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{url}/ml/v1/foundation_model_specs?version=2024-01-15&limit=1",
                headers={"Authorization": f"Bearer __probe__"},
            )
            # 401 = endpoint exists but token invalid (expected)
            # 200 = endpoint works
            # connection error = wrong region
            if r.status_code in (200, 401, 403):
                return name, url, True, r.status_code
            return name, url, False, r.status_code
    except Exception as e:
        return name, url, False, str(e)


async def main():
    print(f"\nProbing watsonx.ai endpoints for project: {settings.WATSONX_PROJECT_ID}\n")
    results = await asyncio.gather(*[probe(n, u) for n, u in REGIONS])
    reachable = []
    for name, url, ok, code in results:
        status = "REACHABLE" if ok else "unreachable"
        print(f"  [{status:>11}]  {name:<15} {url}  (HTTP {code})")
        if ok:
            reachable.append((name, url))

    print()
    if reachable:
        print(f"Set in your .env:")
        for name, url in reachable:
            print(f"  WATSONX_URL={url}   # {name}")
    else:
        print("No endpoints reachable — check network/firewall.")

asyncio.run(main())
