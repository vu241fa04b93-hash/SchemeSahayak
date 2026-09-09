from rag.rag_service import RAGService
from rag.index_manager import SchemeIndexManager
from rag.scheme_registry import SchemeRegistry


def test_rag_service_without_gemini(monkeypatch):

    registry = SchemeRegistry()

    registry.add_scheme(
        "S001",
        "scheme_documents/scheme1.pdf"
    )

    manager = SchemeIndexManager(
        registry=registry,
        cache_dir="test_rag_cache"
    )

    fake_answer = (
        "This scheme provides support to eligible "
        "micro and small enterprises."
    )

    def fake_generate_response(prompt):
        return fake_answer

    monkeypatch.setattr(
        "rag.rag_service.generate_response",
        fake_generate_response
    )

    service = RAGService(
        index_manager=manager
    )

    results = manager.retrieve(
        scheme_id="S001",
        query="eligibility",
        top_k=3
    )

    assert results

    scheme_parts = []

    for result in results:

        page = result.get("page")
        chunk_id = result.get("chunk_id")
        document = result["document"]

        scheme_parts.append(
            f"[Page: {page}, Chunk: {chunk_id}]\n"
            f"{document}"
        )

    scheme_information = "\n\n".join(
        scheme_parts
    )

    prompt = (
        "Explain the scheme using only "
        "the provided information."
    )

    answer = fake_generate_response(prompt)

    assert answer == fake_answer
    assert scheme_information