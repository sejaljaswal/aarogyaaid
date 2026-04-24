from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Dict, List
import logging

from database import get_db
from models.db import UserSession, PolicyDocument
from agents.chat_agent import get_chat_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Simple in-memory history store mapping session_id to message dictionary lists
# Format: { "session_id": [{"role": "user", "content": "..."}, {"role": "ai", "content": "..."}] }
in_memory_chat_history: Dict[str, List[Dict[str, str]]] = {}

class ChatRequest(BaseModel):
    session_id: str = Field(...)
    message: str = Field(...)

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
def invoke_chat(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id
    user_msg = request.message
    
    # 1. Load the UserSession from DB
    user_session = db.query(UserSession).filter(UserSession.id == session_id).first()
    if not user_session:
        raise HTTPException(status_code=404, detail="Active user session not found")
        
    profile = user_session.profile
    recommended_policy_name = user_session.recommended_policy_id
    
    # Get collection name based on policy name to strictly scope the chat tool
    doc = db.query(PolicyDocument).filter(PolicyDocument.policy_name == recommended_policy_name).first()
    collection_name = doc.chroma_collection_id if doc else ""
    
    # 2. Maintain chat history in memory
    if session_id not in in_memory_chat_history:
        in_memory_chat_history[session_id] = []
        
    history = in_memory_chat_history[session_id]
    
    # 3. Call the agent processing engine
    try:
        response_text = get_chat_response(
            message=user_msg, 
            profile=profile, 
            recommended_policy=recommended_policy_name, 
            collection_name=collection_name, 
            chat_history=history
        )
        
        # Check if it was a fallback from logic
        # (Since get_chat_response now returns a string regardless of LLM success)
        print(f"[CHAT SUCCESS/FALLBACK] Reply generated")
        ai_response_text = response_text
    except Exception as e:
        logger.error(f"[CHAT ERROR] {str(e)}")
        ai_response_text = "I'm having a bit of trouble with my AI engine, but I'm still here to help with basic policy details."

    
    # 4. Append the new turns to the history buffer
    history.append({"role": "user", "content": user_msg})
    history.append({"role": "ai", "content": ai_response_text})
    
    return ChatResponse(response=ai_response_text)
