from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
import uuid

from config import settings
from database import get_db
from models.db import PolicyDocument

router = APIRouter(prefix="/api/admin", tags=["Admin"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/admin/login")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    if username != settings.ADMIN_USERNAME:
        raise credentials_exception
    return username

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != settings.ADMIN_USERNAME or form_data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Stub: Save file to disk
    # In a real app, you would save it, parse it with PyMuPDF, chunk it, and store in Chroma
    # For now we'll just register it in the DB
    content = await file.read()
    
    # Save a stub record
    db_document = PolicyDocument(
        file_name=file.filename,
        file_type=file.content_type,
        policy_name=f"Generated from {file.filename}",
        insurer="Unknown",
        chroma_collection_id=str(uuid.uuid4())
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return {"message": "File uploaded successfully", "id": db_document.id}

@router.get("/documents")
def get_documents(admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    docs = db.query(PolicyDocument).all()
    return docs

@router.patch("/documents/{doc_id}")
def update_document(
    doc_id: str, 
    policy_name: str = None, 
    insurer: str = None,
    admin: str = Depends(get_current_admin), 
    db: Session = Depends(get_db)
):
    doc = db.query(PolicyDocument).filter(PolicyDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if policy_name:
        doc.policy_name = policy_name
    if insurer:
        doc.insurer = insurer
        
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    doc = db.query(PolicyDocument).filter(PolicyDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(doc)
    db.commit()
    # Stub: delete from Chroma as well
    return {"message": "Document deleted successfully"}
