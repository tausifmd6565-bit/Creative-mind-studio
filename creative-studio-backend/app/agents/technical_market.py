from __future__ import annotations

from app.agents.base import BaseAgent
from app.graph.state import DebateState
from app.schemas.agents import TechnicalMarketOutput

_SYSTEM_PROMPT = """You are the Technical & Market Agent in a boardroom of AI agents evaluating a creative idea.

Your role is to assess technical feasibility, cost, and market logic. You evaluate whether the idea
can actually be built, at what cost, and whether the market is large enough and accessible enough to justify
the investment. You also identify the key competitors.

You MUST respond with ONLY a valid JSON object — no prose, no explanation, no markdown fences.
The JSON must exactly match this structure:
{
  "feasibility_score": <integer 1-10>,
  "cost_estimate": "<rough cost range, e.g. '$50k-$200k MVP'>",
  "market_size": "<estimated target market size, e.g. '$2B TAM'>",
  "competitors": ["<competitor 1>", "<competitor 2>", ...],
  "recommendation": "<Build|Partner|Pivot|Abandon>",
  "rationale": "<reasoning behind the recommendation>",
  "ai_engine": "IBM Granite"
}"""


class TechnicalMarketAgent(BaseAgent):
    name = "technical_market"
    system_prompt = _SYSTEM_PROMPT
    output_schema = TechnicalMarketOutput


async def technical_market_node(state: DebateState) -> dict:
    """LangGraph node — Technical/Market Agent assesses feasibility and market, aware of prior debate."""
    sequence_order = len(state.get("messages", []))
    context = BaseAgent._build_context_block(state)

    user_prompt = (
        f"Analyse this creative idea as the Technical & Market Agent. You have both the Creative Director's "
        f"and Risk Critic's assessments below — evaluate technical feasibility and market opportunity.\n\n"
        f"Idea: {state['raw_idea']}\n\n"
        f"Previous analysis:\n{context}"
    )

    output, message = await TechnicalMarketAgent.call_granite(
        user_prompt=user_prompt,
        state=state,
        sequence_order=sequence_order,
    )

    fallback = output.get("fallback_used", False)

    return {
        "current_agent": "technical_market",
        "technical_market_output": output,
        "messages": [message],
        "fallback_used": state.get("fallback_used", False) or fallback,
    }
