from ai.gemini_service import extract_user_profile

from rag.document_loader import load_pdf
from rag.chunker import chunk_text
from rag.embeddings import EmbeddingModel
from rag.vector_store import VectorStore
from rag.retriever import Retriever
from rag.rag_service import RAGService


def test_end_to_end():

    # Change this to your actual PDF filename
    pdf_path = "scheme_documents/scheme1.pdf"

    # ------------------------------------------------
    # STEP 1: User input
    # ------------------------------------------------

    user_input = """
    I am a 28 year old woman from Guntur, Andhra Pradesh.
    I want to start a tailoring business.
    I need around 5 lakh rupees funding.
    """

    # ------------------------------------------------
    # STEP 2: Extract user profile using Gemini
    # ------------------------------------------------

    profile = extract_user_profile(user_input)

    print("\n===== EXTRACTED PROFILE =====")
    print(profile)

    assert profile.age == 28
    assert profile.gender is not None
    assert profile.district == "Guntur"
    assert profile.required_funding == 500000

    # ------------------------------------------------
    # STEP 3: Load scheme PDF
    # ------------------------------------------------

    text = load_pdf(pdf_path)

    assert len(text) > 0

    # ------------------------------------------------
    # STEP 4: Create chunks
    # ------------------------------------------------

    chunks = chunk_text(text)

    assert len(chunks) > 0

    # ------------------------------------------------
    # STEP 5: Generate embeddings
    # ------------------------------------------------

    model = EmbeddingModel()

    embeddings = model.encode(chunks)

    # ------------------------------------------------
    # STEP 6: Create vector store
    # ------------------------------------------------

    store = VectorStore(
        embeddings.shape[1]
    )

    store.add(
        embeddings,
        chunks
    )

    # ------------------------------------------------
    # STEP 7: Create retriever
    # ------------------------------------------------

    retriever = Retriever(
        model,
        store
    )

    # ------------------------------------------------
    # STEP 8: Create RAG service
    # ------------------------------------------------

    rag_service = RAGService(retriever)

    # ------------------------------------------------
    # STEP 9: Ask personalized question
    # ------------------------------------------------

    answer = rag_service.answer_question(
        "Based on my profile, why may I be suitable for this scheme?",
        profile=profile,
        top_k=3
    )

    print("\n===== FINAL AI ANSWER =====")
    print(answer)

    assert answer
    assert len(answer) > 20