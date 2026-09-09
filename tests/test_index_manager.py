from rag.index_manager import SchemeIndexManager
from rag.scheme_registry import SchemeRegistry


def test_multiple_scheme_indexes():

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

    results_s001 = manager.retrieve(
        scheme_id="S001",
        query="eligibility",
        top_k=3
    )

    results_s002 = manager.retrieve(
        scheme_id="S002",
        query="eligibility",
        top_k=3
    )

    assert results_s001
    assert results_s002

    assert "S001" in manager.indexers
    assert "S002" in manager.indexers