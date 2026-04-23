from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import recommender

app = FastAPI(title="AarogyaAid API")

# Add CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(recommender.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AarogyaAid API"}
