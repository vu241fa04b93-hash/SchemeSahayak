from rag.document_loader import load_pdf


def test_pdf_loader():

    text = load_pdf("scheme_documents/scheme1.pdf")

    assert isinstance(text, str)
    assert len(text) > 0

    print("\nExtracted characters:", len(text))
    print("\nFirst 1000 characters:")
    print(text[:1000])