from rag.document_loader import load_pdf
from rag.chunker import chunk_text
from rag.embeddings import EmbeddingModel
from rag.vector_store import VectorStore
from rag.retriever import Retriever


def test_real_scheme_retrieval():

    pdf_path = "scheme_documents/scheme1.pdf"

    # Load PDF
    text = load_pdf(pdf_path)

    assert len(text) > 0

    # Create chunks
    chunks = chunk_text(text)

    assert len(chunks) > 0

    print("\nTotal characters:", len(text))
    print("Total chunks:", len(chunks))

    # Generate embeddings
    model = EmbeddingModel()

    embeddings = model.encode(chunks)

    print("Embedding shape:", embeddings.shape)

    # Create vector store
    store = VectorStore(
        embeddings.shape[1]
    )

    # Store chunks
    store.add(
        embeddings,
        chunks
    )

    # Create retriever
    retriever = Retriever(
        model,
        store
    )

    # Search
    query = "Who is eligible for this scheme?"

    results = retriever.retrieve(
        query,
        top_k=3
    )

    assert len(results) > 0

    print("\nRELEVANT SCHEME INFORMATION")

    for i, result in enumerate(results):

        print(f"\nRESULT {i + 1}")
        print("Score:", result["score"])
        print(result["document"][:500])