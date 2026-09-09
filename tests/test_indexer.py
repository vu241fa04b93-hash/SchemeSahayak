from pathlib import Path

from rag.indexer import SchemeIndexer
from rag.retriever import Retriever


def test_scheme_indexer():

    # Use your actual PDF filename
    pdf_path = "scheme_documents/scheme1.pdf"

    # Create indexer
    indexer = SchemeIndexer(
        pdf_path
    )

    # Build/load cached index
    embedding_model, vector_store = (
        indexer.load()
    )

    # Create retriever
    retriever = Retriever(
        embedding_model,
        vector_store
    )

    # Search the scheme
    results = retriever.retrieve(
        "Who is eligible for this scheme?",
        top_k=3
    )

    # Verify results
    assert len(results) > 0

    # Verify cache was created
    assert Path(
        indexer.cache_file
    ).exists()

    print("\n===== INDEXER TEST =====")

    print(
        "Cache file:",
        indexer.cache_file
    )

    print(
        "Cache exists:",
        Path(indexer.cache_file).exists()
    )

    print(
        "Number of results:",
        len(results)
    )

    for result in results:

        print("\nPage:", result.get("page"))

        print(
            "Chunk:",
            result.get("chunk_id")
        )

        print(
            "Score:",
            result["score"]
        )

        print(
            "Text:",
            result["document"][:200]
        )