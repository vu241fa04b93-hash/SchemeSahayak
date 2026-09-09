from pathlib import Path

from rag.indexer import SchemeIndexer
from rag.retriever import Retriever


def test_cached_interface():

    pdf_path = "scheme_documents/scheme1.pdf"

    indexer = SchemeIndexer(
        pdf_path
    )

    embedding_model, vector_store = (
        indexer.load()
    )

    retriever = Retriever(
        embedding_model,
        vector_store
    )

    results = retriever.retrieve(
        "What are the eligibility conditions?",
        top_k=3
    )

    assert Path(
        indexer.cache_file
    ).exists()

    assert len(results) > 0

    print("\n===== CACHED RAG TEST =====")
    print(
        "Cache:",
        indexer.cache_file
    )

    print(
        "Results:",
        len(results)
    )

    for result in results:

        print(
            "\nPage:",
            result.get("page")
        )

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