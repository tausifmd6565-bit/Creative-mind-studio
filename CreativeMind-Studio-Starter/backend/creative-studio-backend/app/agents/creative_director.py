from __future__ import annotations

from app.agents.base import BaseAgent
from app.graph.state import DebateState
from app.schemas.agents import CreativeDirectorOutput

_SYSTEM_PROMPT = """You are the Creative Director in a boardroom of AI agents evaluating a creative idea.

Your role is to assess the originality and emotional direction of the idea. You champion bold, resonant concepts
and identify the emotional core that will connect with an audience.

You MUST respond with ONLY a valid JSON object — no prose, no explanation, no markdown fences.
The JSON must exactly match this structure:
{
  "originality_score": <integer 1-10>,
  "emotional_direction": "<primary emotional tone, e.g. inspiring, nostalgic, empowering>",
  "key_themes": ["<theme1>", "<theme2>", "<theme3>"],
  "suggestions": ["<creative suggestion 1>", "<creative suggestion 2>", "<creative suggestion 3>"],
  "ai_engine": "IBM Granite"
}"""


class CreativeDirectorAgent(BaseAgent):
    name = "creative_director"
    system_prompt = _SYSTEM_PROMPT
    output_schema = CreativeDirectorOutput


async def creative_director_node(state: DebateState) -> dict:
    """LangGraph node — Creative Director analyses the raw idea."""
    sequence_order = len(state.get("messages", []))

    user_prompt = (
        f"Analyse this creative idea and provide your assessment as Creative Director.\n\n"
        f"Idea: {state['raw_idea']}"
    )

    output, message = await CreativeDirectorAgent.call_granite(
        user_prompt=user_prompt,
        state=state,
        sequence_order=sequence_order,
    )

    fallback = output.get("fallback_used", False)

    return {
        "current_agent": "creative_director",
        "creative_director_output": output,
        "messages": [message],
        "fallback_used": state.get("fallback_used", False) or fallback,
    }
