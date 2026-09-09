from rag.document_loader import load_pdf
from rag.chunker import chunk_text
from rag.embeddings import EmbeddingModel
from rag.vector_store import VectorStore
from rag.retriever import Retriever


def test_real_scheme_retrieval():

    # Change this to your actual PDF filename
    pdf_path = "scheme_documents/scheme1.pdf"

    # 1. Load PDF
    text = load_pdf(pdf_path)

    assert len(text) > 0

    # 2. Split into chunks
    chunks = chunk_text(text)

    assert len(chunks) > 0

    print("\nTotal characters:", len(text))
    print("Total chunks:", len(chunks))

    # 3. Generate embeddings
    model = EmbeddingModel()

    embeddings = model.encode(chunks)

    print("Embedding shape:", embeddings.shape)

    # 4. Create FAISS vector store
    store = VectorStore(
        embeddings.shape[1]
    )

    store.add(
        embeddings,
        chunks
    )

    # 5. Create retriever
    retriever = Retriever(
        model,
        store
    )

    # 6. Ask a question
    results = retriever.retrieve(
        "Who is eligible for this scheme?",
        top_k=3
    )

    assert len(results) > 0

    # 7. Display retrieved information
    print("\nRELEVANT SCHEME INFORMATION")

    for i, result in enumerate(results):

        print(f"\nRESULT {i + 1}")

        print("Score:", result["score"])

        print(result["document"][:500])