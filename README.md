# AarogyaAid 🛡️

## Project Overview
AarogyaAid is an AI-powered health insurance recommendation platform designed to demystify insurance for Indian users. It solves the critical problem of information overload and jargon confusion in the insurance sector by translating dense policy documents into simple, conversational explanations. By analyzing a user's health profile, income band, and specific needs, the platform provides tailored, trustworthy insurance recommendations that prioritize the user's actual coverage requirements over sales commissions.

## Tech Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Provides a blazing-fast, modern development experience and high-performance, responsive UI components necessary for a premium, engaging user flow. |
| **Backend** | FastAPI | Offers async support out-of-the-box, high throughput, and automatic OpenAPI documentation, making it ideal for a modern Python-based AI microservice. |
| **AI Agent** | LangChain with Google Gemini | Serves as the orchestration layer for the conversational agent and reasoning engine (see below for detailed justification). |
| **Vector Store** | ChromaDB | A lightweight, open-source embedding database that integrates seamlessly with LangChain for efficient semantic search of policy documents. |
| **Database** | PostgreSQL | A robust relational database for securely persisting structured user profiles, session histories, and platform metadata. |
| **PDF Parsing** | PyMuPDF + pdfplumber | Provides highly accurate text extraction from complex, multi-column Indian insurance brochures and policy wording documents. |

### Why LangChain for our AI Agent?
While the Google AI SDK offers direct access to the Gemini models, we deliberately chose to build our AI architecture on top of **LangChain**. LangChain was selected because it offers superior tool and agent composability, allowing us to easily string together complex reasoning loops out of modular components. Additionally, it features native, first-class support for Retrieval-Augmented Generation (RAG) pipelines including built-in document loaders for efficiently processing our policy PDFs. Crucially, LangChain natively supports diverse forms of session memory (chat history), and it boasts a much wider ecosystem for defining and registering custom tools, which gives the agent the strict guardrails necessary when answering sensitive financial and health queries.

## Setup Instructions

Follow these step-by-step instructions to get the AarogyaAid application running locally.

### 1. Clone the Repository and Configure Environment Variables
```bash
git clone https://github.com/sejaljaswal/aarogya.git
cd aarogyaaid
cp .env.example .env
```
*Open the newly created `.env` file and fill in your actual API keys (e.g., `GOOGLE_API_KEY`).*

### 2. Start the Backend Server (FastAPI)
Open a terminal instance and run:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*The API will be accessible at http://localhost:8000.*

### 3. Start the Frontend Server (React + Vite)
Open a **new** terminal instance and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will be accessible at http://localhost:5173.*

## Recommendation Logic
The core value of AarogyaAid lies in its intelligent matching engine. When a user submits their personal data through the frontend form, the AI agent performs a deep analysis of their profile against the ingested insurance data. The platform utilizes a Retrieval-Augmented Generation (RAG) architecture to semantically search the ChromaDB vector store and retrieve relevant document chunks from actual policy wordings. The agent then factors in the user's explicit profile traits (like age, city tier, and pre-existing conditions) alongside the retrieved policy rules to dynamically evaluate and score the policies. This hybrid approach—combining strict, weighted profile scoring with nuanced, RAG-retrieved policy text analysis—ensures that recommendations are mathematically sound while perfectly addressing complex nuances like disease waiting periods and coverage limitations. 

## Chunking Strategy
To ensure the LLM receives precise and relevant context during the RAG process, our document ingestion pipeline employs a meticulous chunking strategy. The raw insurance PDFs are initially parsed using PyMuPDF and pdfplumber to extract clean structural text. This text is then passed through LangChain's `RecursiveCharacterTextSplitter`. We configure the splitter to break the documents into **500-token chunks** with a **50-token overlap**. This specific size ensures that chunks are large enough to retain complete clauses or conditions, but small enough to maintain high semantic density during vector search. The overlap prevents critical sentences from being severed mid-thought. Finally, these chunks are embedded and stored in ChromaDB, heavily coupled with precise metadata (such as `policy_name`, `insurer`, and `file_type`), allowing our router to strictly filter context to the required policies during retrieval.

## Testing the Platform with Sample Policies

To see AarogyaAid's full potential, we've provided 3 realistic sample policy documents in the `/sample_policies` directory. You can use these to test the end-to-end flow from indexing to recommendation:

1.  **Star Health Comprehensive (`.txt`)**: A balanced, mid-range plan with a 2-year waiting period.
2.  **Care Freedom (`.json`)**: A budget-focused plan with longer waiting periods and higher co-pays (useful for testing "cautionary" AI advice).
3.  **Niva Bupa ReAssure 2.0 (`.txt`)**: A premium high-coverage plan with a short 1-year waiting period and no co-pays in metros.

### To load these policies:
1.  Navigate to http://localhost:5173/admin and log in with your credentials.
2.  In the **Upload Policy** section, select one of the sample files.
3.  Fill in the **Policy Name** and **Insurer** fields exactly as they appear in the filename.
4.  Click **Start Upload**. The AI will begin indexing the document into the vector store.
5.  Once indexed, go back to the home page (`/`) and submit a profile to see these policies being recommended and compared in real-time.

## Running Tests
To ensure the integrity of the recommendation engine and API endpoints, execute the following command from the `backend/` directory (with your virtual environment activated):

```bash
# Ensure PYTHONPATH is set so tests can find the internal modules
PYTHONPATH=. pytest
```
