import chromadb
from config import settings

# Initialize persistent ChromaDB client
print(f"Initializing ChromaDB client at {settings.CHROMA_PERSIST_DIR}")
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

def get_or_create_collection(collection_name: str):
    """Returns a ChromaDB collection, creating it if it doesn't exist."""
    return chroma_client.get_or_create_collection(name=collection_name)

def delete_collection(collection_name: str):
    """Deletes a ChromaDB collection."""
    try:
        chroma_client.delete_collection(name=collection_name)
        print(f"Successfully deleted collection: {collection_name}")
    except ValueError as e:
        print(f"Collection {collection_name} does not exist. {e}")
    except Exception as e:
        print(f"Error deleting collection {collection_name}: {e}")
