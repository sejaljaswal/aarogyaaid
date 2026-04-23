from fastapi import FastAPI

app = FastAPI(title="AarogyaAid API")

@app.get("/")
def read_root():
    return {"message": "Welcome to AarogyaAid API"}
