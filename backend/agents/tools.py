import json
from langchain_core.tools import tool
from vectorstore.ingestion import retrieve_chunks
from vectorstore.chroma_client import chroma_client

@tool
def retrieve_policy_chunks(query: str, collection_name: str) -> str:
    """
    Use this tool to retrieve relevant clauses and data from a specific insurance policy document stored in the knowledge base. Always use this before making any recommendation.
    """
    results = retrieve_chunks(query, collection_name)
    if not results:
        return "No relevant chunks found."
    
    formatted = []
    for r in results:
        formatted.append(f"Content: {r['text']}\nMetadata: {json.dumps(r['metadata'])}\nScore: {r['score']}")
    return "\n\n---\n\n".join(formatted)

@tool
def retrieve_all_policies(query: str) -> str:
    """
    Use this tool to compare multiple policies. Retrieves relevant sections from all uploaded policy documents.
    """
    collections = chroma_client.list_collections()
    if not collections:
        return "No policy documents currently exist in the database."
        
    all_results = {}
    for col in collections:
        # ChromaDB list_collections() returns collection objects, so we safely get the name
        col_name = getattr(col, "name", str(col))
        
        results = retrieve_chunks(query, col_name, n_results=2)
        if results:
            # Try to extract policy name from metadata of first chunk
            policy_name = results[0].get("metadata", {}).get("policy_name", col_name)
            
            formatted_chunks = [f"Text: {r['text']}" for r in results]
            if policy_name not in all_results:
                all_results[policy_name] = []
            all_results[policy_name].extend(formatted_chunks)
            
    return json.dumps(all_results, indent=2)
