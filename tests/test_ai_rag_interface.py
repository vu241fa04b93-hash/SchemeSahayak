from ai_rag_interface import SchemeSahayakAI


def test_ai_rag_interface():

    schemes = {
        "S001": "scheme_documents/scheme1.pdf",
        "S002": "scheme_documents/scheme1.pdf"
    }

    system = SchemeSahayakAI(
        schemes=schemes
    )

    assert system.registry.has_scheme("S001")
    assert system.registry.has_scheme("S002")

    results = system.index_manager.retrieve(
        scheme_id="S001",
        query="eligibility",
        top_k=3
    )

    assert results