from rag.rag_service import answer_for_multiple_schemes
from rag.index_manager import SchemeIndexManager
from rag.scheme_registry import SchemeRegistry


def test_multi_scheme_ai_rag(monkeypatch):

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

    def fake_extract_user_profile(user_input):
        return {
            "name": "Test User",
            "state": "Andhra Pradesh",
            "category": "General"
        }

    def fake_generate_response(prompt):
        return (
            "This is a mocked grounded explanation "
            "for the selected scheme."
        )

    monkeypatch.setattr(
        "ai.gemini_service.extract_user_profile",
        fake_extract_user_profile
    )

    monkeypatch.setattr(
        "rag.rag_service.generate_response",
        fake_generate_response
    )

    results = answer_for_multiple_schemes(
        user_input="I am an entrepreneur from Andhra Pradesh.",
        question="What are the eligibility conditions?",
        scheme_ids=["S001", "S002"],
        index_manager=manager,
        top_k=2
    )

    assert len(results) == 2

    assert results[0]["scheme_id"] == "S001"
    assert results[1]["scheme_id"] == "S002"

    assert results[0]["answer"]
    assert results[1]["answer"]

    assert results[0]["sources"]
    assert results[1]["sources"]