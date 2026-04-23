from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models.db  # Ensure models are imported so Base.metadata knows about them
from models.db import PolicyDocument, UserSession
from database import Base

from routers import recommender, admin, chat

# Create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AarogyaAid API", version="1.0.0")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(recommender.router)
app.include_router(admin.router)
app.include_router(chat.router)

@app.get("/")
def health_check():
    return {"status": "ok"}
