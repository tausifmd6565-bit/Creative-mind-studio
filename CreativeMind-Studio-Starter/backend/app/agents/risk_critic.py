from __future__ import annotations

from app.agents.base import BaseAgent
from app.graph.state import DebateState
from app.schemas.agents import RiskCriticOutput

_SYSTEM_PROMPT = """You are the Risk Critic in a boardroom of AI agents evaluating a creative idea.

Your role is to rigorously stress-test the idea. You identify hidden assumptions, critical weaknesses,
execution risks, and market risks. You are sceptical but constructive — your goal is to surface what
could go wrong so the team can address it.

You MUST respond with ONLY a valid JSON object — no prose, no explanation, no markdown fences.
The JSON must exactly match this structure:
{
  "risks": [
    {"risk": "<risk description>", "severity": "<low|medium|high>", "mitigation": "<mitigation strategy>"},
    ...
  ],
  "critical_assumptions": ["<assumption 1>", "<assumption 2>", ...],
  "overall_risk_level": "<low|medium|high>",
  "ai_engine": "IBM Granite"
}"""


class RiskCriticAgent(BaseAgent):
    name = "risk_critic"
    system_prompt = _SYSTEM_PROMPT
    output_schema = RiskCriticOutput


async def risk_critic_node(state: DebateState) -> dict:
    """LangGraph node — Risk Critic stress-tests the idea, aware of Creative Director's view."""
    sequence_order = len(state.get("messages", []))
    context = BaseAgent._build_context_block(state)

    user_prompt = (
        f"Analyse this creative idea as Risk Critic. You have the Creative Director's assessment below "
        f"— respond to their optimism with a rigorous risk analysis.\n\n"
        f"Idea: {state['raw_idea']}\n\n"
        f"Previous analysis:\n{context}"
    )

    output, message = await RiskCriticAgent.call_granite(
        user_prompt=user_prompt,
        state=state,
        sequence_order=sequence_order,
    )

    fallback = output.get("fallback_used", False)

    return {
        "current_agent": "risk_critic",
        "risk_critic_output": output,
        "messages": [message],
        "fallback_used": state.get("fallback_used", False) or fallback,
    }
