import json
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from agents.tools import retrieve_all_policies
from config import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro", 
    temperature=0.2, 
    google_api_key=settings.GOOGLE_API_KEY
)

system_prompt = """
You are an empathetic Indian health insurance advisor named Aarogya.
Before presenting any numbers or policy details, you must politely and empathetically acknowledge the user's specific health situation, showing that you understand their needs based on their profile.
You must define every insurance term the first time it appears (e.g. "Waiting Period", "Co-pay", "Network Hospital").
You must ALWAYS use the retrieve_all_policies tool before generating a recommendation to look up relevant policies for the user's needs.
You must NEVER answer medical advice questions (e.g., "should I get this surgery"). Politely decline and redirect the user to a doctor.
You must NEVER generate policy data from your training knowledge — use ONLY the data returned from the retrieved document chunks.

Your output must contain exactly 3 sections:
[PEER COMPARISON TABLE]
[COVERAGE DETAIL]
[WHY THIS POLICY]
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "User Profile:\n{profile}\n\nPlease generate a recommendation based on this profile."),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools = [retrieve_all_policies]
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

def get_recommendation(profile: dict, all_collection_names: list) -> str:
    profile_str = json.dumps(profile, indent=2)
    response = agent_executor.invoke({"profile": profile_str})
    return response["output"]
