from rag.index_manager import SchemeIndexManager
from rag.scheme_registry import SchemeRegistry


def test_retrieve_multiple_schemes():

    registry = SchemeRegistry()

    registry.add_scheme(
        "S001",
        "scheme_documents/scheme1.pdf"
    )

    registry.add_scheme(
        "S002",
        "scheme_documents/scheme1.pdf"
    )

    manager = SchemeIndexManager(
        registry=registry,
        cache_dir="test_rag_cache"
    )

    results = manager.retrieve_multiple(
        scheme_ids=["S001", "S002"],
        query="eligibility",
        top_k=2
    )

    assert "S001" in results
    assert "S002" in results

    assert results["S001"]
    assert results["S002"]