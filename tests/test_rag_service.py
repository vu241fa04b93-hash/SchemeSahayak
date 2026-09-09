from rag.document_loader import load_pdf
from rag.chunker import chunk_text
from rag.embeddings import EmbeddingModel
from rag.vector_store import VectorStore
from rag.retriever import Retriever
from rag.rag_service import RAGService
from ai.schemas import UserProfile


def test_rag_service():

    # Change this to your actual PDF filename
    pdf_path = "scheme_documents/scheme1.pdf"

    # Load PDF
    text = load_pdf(pdf_path)
    assert len(text) > 0

    # Create chunks
    chunks = chunk_text(text)
    assert len(chunks) > 0

    # Create embeddings
    model = EmbeddingModel()
    embeddings = model.encode(chunks)

    # Create vector store
    store = VectorStore(embeddings.shape[1])

    store.add(
        embeddings,
        chunks
    )

    # Create retriever
    retriever = Retriever(
        model,
        store
    )

    # Create RAG service
    rag_service = RAGService(retriever)

    # Create actual UserProfile
    profile = UserProfile(
        age=28,
        gender="female",
        state="Andhra Pradesh",
        district="Guntur",
        business_type="tailoring",
        required_funding=500000
    )

    # Ask a question using the profile
    answer = rag_service.answer_question(
        "Why is this scheme suitable for me and what are its eligibility conditions?",
        profile=profile,
        top_k=3
    )

    print("\n===== RAG ANSWER =====")
    print(answer)

    assert answer
    assert len(answer) > 20