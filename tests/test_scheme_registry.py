from rag.scheme_registry import SchemeRegistry


def test_scheme_registry():

    registry = SchemeRegistry()

    registry.add_scheme(
        "S001",
        "scheme_documents/scheme1.pdf"
    )

    registry.add_scheme(
        "S002",
        "scheme_documents/scheme2.pdf"
    )

    assert registry.has_scheme("S001")
    assert registry.has_scheme("S002")

    assert (
        registry.get_pdf_path("S001")
        == "scheme_documents/scheme1.pdf"
    )

    assert len(
        registry.get_all_schemes()
    ) == 2