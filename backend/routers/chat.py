from fastapi import APIRouter

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/")
def chat_endpoint():
    return {"message": "Chat endpoint stub"}
