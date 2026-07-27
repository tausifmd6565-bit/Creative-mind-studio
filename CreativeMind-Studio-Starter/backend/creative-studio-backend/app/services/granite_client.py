from __future__ import annotations

"""
granite_client.py — Multi-provider AI client (Groq, Grok/OpenAI, Replicate, WatsonX)
----------------------------------------------------------------------------------
Supports multiple AI providers specified by AI_PROVIDER in .env:

  groq       — Groq (FREE — https://console.groq.com)
  openai     — OpenAI / Grok / xAI / compatible API
  replicate  — Replicate API
  watsonx    — IBM watsonx.ai
"""

import asyncio
import json
import logging
import re
from typing import Any

from app.config import settings
from app.schemas.granite import GraniteResponse

logger = logging.getLogger(__name__)


class GraniteResponseError(Exception):
    def __init__(self, message: str, raw: str = "") -> None:
        super().__init__(message)
        self.raw = raw


# ---------------------------------------------------------------------------
# JSON helpers
# ---------------------------------------------------------------------------
def _extract_json(text: str) -> str:
    text = text.strip()
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        candidate = match.group(0)
        try:
            json.loads(candidate)
            return candidate
        except json.JSONDecodeError:
            pass
        repaired = _repair_json(candidate)
        try:
            json.loads(repaired)
            return repaired
        except json.JSONDecodeError:
            pass
    raise GraniteResponseError(
        f"Could not extract valid JSON. Raw (first 300): {text[:300]}", raw=text
    )


def _repair_json(text: str) -> str:
    text = re.sub(r"```(?:json)?", "", text).strip()
    text = re.sub(r",\s*([}\]])", r"\1", text)
    text = text.replace("'", '"')
    text = re.sub(r"[\x00-\x1f\x7f]", " ", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Provider: Groq  (FREE — https://console.groq.com)
# ---------------------------------------------------------------------------
async def _call_groq(system: str, prompt: str) -> str:
    try:
        from groq import Groq  # type: ignore
    except ImportError:
        raise GraniteResponseError("groq not installed. Run: pip install groq")

    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise GraniteResponseError("GROQ_API_KEY is not set in .env. Get a free key at https://console.groq.com")

    client = Groq(api_key=api_key)
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    def _call():
        resp = client.chat.completions.create(
            model=settings.GROQ_MODEL or "llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=settings.GRANITE_MAX_NEW_TOKENS,
            temperature=settings.GRANITE_TEMPERATURE,
        )
        return resp.choices[0].message.content

    return await asyncio.get_event_loop().run_in_executor(None, _call)


# ---------------------------------------------------------------------------
# Provider: OpenAI / Grok / Compatible Endpoint
# ---------------------------------------------------------------------------
async def _call_openai(system: str, prompt: str) -> str:
    try:
        from openai import OpenAI  # type: ignore
    except ImportError:
        raise GraniteResponseError("openai not installed. Run: pip install openai")

    api_key = getattr(settings, "OPENAI_API_KEY", "") or getattr(settings, "GROK_API_KEY", "")
    if not api_key:
        raise GraniteResponseError("OPENAI_API_KEY or GROK_API_KEY is not set in .env")

    base_url = getattr(settings, "OPENAI_BASE_URL", None)
    client = OpenAI(api_key=api_key, base_url=base_url if base_url else None)
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    def _call():
        resp = client.chat.completions.create(
            model=getattr(settings, "OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            temperature=settings.GRANITE_TEMPERATURE,
        )
        return resp.choices[0].message.content

    return await asyncio.get_event_loop().run_in_executor(None, _call)


# ---------------------------------------------------------------------------
# Provider: IBM Granite via Replicate  (FREE — https://replicate.com)
# ---------------------------------------------------------------------------
async def _call_replicate(system: str, prompt: str) -> str:
    try:
        import replicate  # type: ignore
    except ImportError:
        raise GraniteResponseError("replicate not installed. Run: pip install replicate")

    import os
    if not settings.REPLICATE_API_TOKEN:
        raise GraniteResponseError("REPLICATE_API_TOKEN is not set in .env")

    os.environ["REPLICATE_API_TOKEN"] = settings.REPLICATE_API_TOKEN
    full = f"<|system|>\n{system}\n<|user|>\n{prompt}\n<|assistant|>" if system else prompt

    def _call():
        out = replicate.run(
            settings.REPLICATE_MODEL,
            input={
                "prompt": full,
                "max_new_tokens": settings.GRANITE_MAX_NEW_TOKENS,
                "temperature": settings.GRANITE_TEMPERATURE,
            },
        )
        return "".join(str(c) for c in out) if hasattr(out, "__iter__") else str(out)

    return await asyncio.get_event_loop().run_in_executor(None, _call)


# ---------------------------------------------------------------------------
# Provider: IBM watsonx.ai
# ---------------------------------------------------------------------------
_wx_model = None


def _get_model():
    return _get_wx()


def _get_wx():
    global _wx_model
    if _wx_model is None:
        from ibm_watsonx_ai import Credentials  # type: ignore
        from ibm_watsonx_ai.foundation_models import ModelInference  # type: ignore
        url = settings.WATSONX_URL
        if "dataplatform.cloud.ibm.com" in url or "/wx/home" in url:
            url = "https://us-south.ml.cloud.ibm.com"
        _wx_model = ModelInference(
            model_id=settings.WATSONX_MODEL_ID,
            credentials=Credentials(url=url, api_key=settings.WATSONX_API_KEY),
            project_id=settings.WATSONX_PROJECT_ID,
            params={"max_tokens": settings.GRANITE_MAX_NEW_TOKENS, "temperature": settings.GRANITE_TEMPERATURE},
        )
    return _wx_model


async def _call_watsonx(system: str, prompt: str) -> str:
    model = _get_wx()
    full = f"{system}\n\n{prompt}".strip() if system else prompt

    def _call():
        try:
            msgs = [{"role": "system", "content": system}] if system else []
            msgs.append({"role": "user", "content": prompt})
            return model.chat(messages=msgs)["choices"][0]["message"]["content"]
        except Exception:
            return model.generate_text(prompt=full)

    return await asyncio.wait_for(
        asyncio.get_event_loop().run_in_executor(None, _call),
        timeout=settings.GRANITE_TIMEOUT_SECONDS,
    )


def _engine_label() -> str:
    p = settings.AI_PROVIDER.lower()
    if p == "groq":
        return "IBM Granite / Llama-3 (Groq)"
    elif p == "openai":
        return "GPT-4 / Grok AI"
    return "IBM Granite"


async def generate(
    prompt: str,
    system: str = "",
    override_params: dict[str, Any] | None = None,
) -> GraniteResponse:
    provider = settings.AI_PROVIDER.lower()
    last_error: Exception | None = None

    # Try selected provider first, then try Groq or WatsonX as fallback if available
    providers_to_try = [provider]
    if provider == "watsonx":
        if settings.GROQ_API_KEY:
            providers_to_try.append("groq")
    elif provider == "groq":
        if settings.WATSONX_API_KEY:
            providers_to_try.append("watsonx")

    for current_provider in providers_to_try:
        try:
            logger.debug("AI call attempt — provider: %s", current_provider)
            if current_provider == "groq":
                raw = await _call_groq(system, prompt)
            elif current_provider in ["openai", "grok"]:
                raw = await _call_openai(system, prompt)
            elif current_provider == "replicate":
                raw = await _call_replicate(system, prompt)
            else:
                raw = await _call_watsonx(system, prompt)

            json_content = _extract_json(raw) if "JSON" in system or "json" in system else raw
            return GraniteResponse(content=json_content, raw=raw, fallback_used=False, ai_engine=_engine_label())

        except Exception as exc:
            logger.warning("AI provider %s error: %s", current_provider, exc)
            last_error = exc

    raise GraniteResponseError(f"AI Provider failed: {last_error}", raw="")