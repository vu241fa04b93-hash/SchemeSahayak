from rag.document_loader import load_pdf
from rag.chunker import chunk_text


def test_document_pipeline():

    pdf_path = "scheme_documents/scheme1.pdf"

    text = load_pdf(pdf_path)

    chunks = chunk_text(text)

    assert len(text) > 0
    assert len(chunks) > 0

    print("\nTotal characters:", len(text))
    print("Total chunks:", len(chunks))

    for i, chunk in enumerate(chunks[:3]):

        print(f"\nCHUNK {i + 1}")
        print("-" * 60)
        print(chunk[:500])