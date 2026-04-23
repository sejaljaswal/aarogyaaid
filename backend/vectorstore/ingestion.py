import os
import json
import uuid
import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from vectorstore.chroma_client import get_or_create_collection
from config import settings

# Initialize Embeddings
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", 
    google_api_key=settings.GOOGLE_API_KEY
)

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
        # We manually embed the documents to ensure we are using the requested model
        emb_vectors = embeddings.embed_documents(docs)
        
        col.add(
            ids=ids,
            embeddings=emb_vectors,
            metadatas=metadatas,
            documents=docs
        )
        print(f"Stored {len(docs)} chunks in collection {collection_name}")

def ingest_pdf(file_path: str, policy_name: str, insurer: str, collection_name: str):
    print(f"Ingesting PDF: {file_path}")
    doc = fitz.open(file_path)
    text_data = []
    for i in range(len(doc)):
        page = doc[i]
        text_content = page.get_text("text")
        if text_content.strip():
            text_data.append((text_content, {"page_number": i + 1}))
    _chunk_and_store(text_data, policy_name, insurer, file_path, collection_name)

def ingest_json(file_path: str, policy_name: str, insurer: str, collection_name: str):
    print(f"Ingesting JSON: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    content = json.dumps(data, indent=2)
    _chunk_and_store([(content, {})], policy_name, insurer, file_path, collection_name)

def ingest_txt(file_path: str, policy_name: str, insurer: str, collection_name: str):
    print(f"Ingesting TXT: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    _chunk_and_store([(content, {})], policy_name, insurer, file_path, collection_name)

def retrieve_chunks(query: str, collection_name: str, n_results=5) -> list[dict]:
    col = get_or_create_collection(collection_name)
    query_emb = embeddings.embed_query(query)
    
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
