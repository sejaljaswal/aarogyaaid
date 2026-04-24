import os
import json
import uuid
import fitz  # PyMuPDF
import google.generativeai as genai
from langchain.text_splitter import RecursiveCharacterTextSplitter
from vectorstore.chroma_client import get_or_create_collection
from config import settings

# Configure official client for embeddings
genai.configure(api_key=settings.GOOGLE_API_KEY)
EMBEDDING_MODEL = "models/gemini-embedding-001"

def _chunk_and_store(text_data: list[tuple[str, dict]], policy_name: str, insurer: str, file_path: str, collection_name: str):
    """
    text_data: a list of tuples containing (text, metadata_dict)
    """
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    
    docs = []
    metadatas = []
    ids = []
    
    source_file_name = os.path.basename(file_path)
    
    for content, meta in text_data:
        chunks = splitter.split_text(content)
        for chunk in chunks:
            docs.append(chunk)
            chunk_meta = {
                "policy_name": policy_name,
                "insurer": insurer,
                "source_file": source_file_name,
            }
            if meta:
                chunk_meta.update(meta)
            metadatas.append(chunk_meta)
            ids.append(str(uuid.uuid4()))
            
    if docs:
        col = get_or_create_collection(collection_name)
        
        # Generate embeddings using the official SDK
        try:
            print(f"Generating embeddings for {len(docs)} chunks using {EMBEDDING_MODEL}")
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=docs,
                task_type="retrieval_document",
                title=policy_name
            )
            emb_vectors = result['embedding']
            
            col.add(
                ids=ids,
                embeddings=emb_vectors,
                metadatas=metadatas,
                documents=docs
            )
            print(f"Successfully stored {len(docs)} chunks in ChromaDB")
        except Exception as e:
            print(f"[EMBEDDING ERROR] Failed to generate/store embeddings: {str(e)}")
            raise e

def ingest_pdf(file_path: str, policy_name: str, insurer: str, collection_name: str):
    doc = fitz.open(file_path)
    text_data = []
    for i in range(len(doc)):
        page = doc[i]
        text_content = page.get_text("text")
        if text_content.strip():
            text_data.append((text_content, {"page_number": i + 1}))
    _chunk_and_store(text_data, policy_name, insurer, file_path, collection_name)

def ingest_json(file_path: str, policy_name: str, insurer: str, collection_name: str):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    content = json.dumps(data, indent=2)
    _chunk_and_store([(content, {})], policy_name, insurer, file_path, collection_name)

def ingest_txt(file_path: str, policy_name: str, insurer: str, collection_name: str):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    _chunk_and_store([(content, {})], policy_name, insurer, file_path, collection_name)

def retrieve_chunks(query: str, collection_name: str, n_results=5) -> list[dict]:
    """Retrieves chunks by generating a query embedding using the official SDK."""
    col = get_or_create_collection(collection_name)
    
    # Generate query embedding
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=query,
        task_type="retrieval_query"
    )
    query_emb = result['embedding']
    
    results = col.query(
        query_embeddings=[query_emb],
        n_results=n_results
    )
    
    retrieved = []
    if results and results.get('documents') and len(results['documents']) > 0:
        docs = results['documents'][0]
        metas = results['metadatas'][0]
        distances = results['distances'][0]
        for idx in range(len(docs)):
            retrieved.append({
                "text": docs[idx],
                "metadata": metas[idx],
                "score": distances[idx]
            })
    return retrieved
