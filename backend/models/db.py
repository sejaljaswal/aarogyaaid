import uuid
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class PolicyDocument(Base):
    __tablename__ = "policy_documents"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    file_name = Column(String, index=True)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    file_type = Column(String)
    policy_name = Column(String, index=True)
    insurer = Column(String, index=True)
    chroma_collection_id = Column(String)

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    profile = Column(JSON)
    recommended_policy_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
