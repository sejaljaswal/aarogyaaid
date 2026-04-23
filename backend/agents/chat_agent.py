import json
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from agents.tools import retrieve_policy_chunks
from config import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro", 
    temperature=0.3, 
    google_api_key=settings.GOOGLE_API_KEY
)

system_prompt = """
You are Aarogya, an empathetic health insurance specialist focusing ONLY on the policy: {recommended_policy}.
You must assist this specific user based on their profile details provided. Do NOT ask for their profile details again.

You must:
1. Break down complex insurance jargon implicitly in your explanation.
2. Generate examples using the user's actual city and health conditions based on the profile.
3. ALWAYS use the `retrieve_policy_chunks` tool for EVERY factual claim you make about the policy to ensure accuracy.
4. ONLY cite facts retrieved from the tool. Never invent them. 
5. Provide helpful context based on their profile.
6. Refuse any medical advice questions politely.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "User Profile: {profile_str}\nCollection Name for Tool: {collection_name}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools = [retrieve_policy_chunks]
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

def get_chat_response(message: str, profile: dict, recommended_policy: str, collection_name: str, chat_history: list) -> str:
    # Convert simple dict chat history into LangChain messages
    formatted_history = []
    for msg in chat_history:
        if msg.get("role") == "user":
            formatted_history.append(HumanMessage(content=msg.get("content", "")))
        elif msg.get("role") == "ai" or msg.get("role") == "assistant":
            formatted_history.append(AIMessage(content=msg.get("content", "")))
            
    response = agent_executor.invoke({
        "input": message,
        "profile_str": json.dumps(profile, indent=2),
        "recommended_policy": recommended_policy,
        "collection_name": collection_name,
        "chat_history": formatted_history
    })
    
    return response["output"]
