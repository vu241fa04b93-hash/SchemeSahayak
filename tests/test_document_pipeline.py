from rag.document_loader import load_pdf
from rag.chunker import chunk_text


def test_document_pipeline():

    text = load_pdf("scheme_documents/scheme1.pdf")

    chunks = chunk_text(text)

    assert len(text) > 0
    assert len(chunks) > 0

    print("\nTotal characters:", len(text))
    print("Total chunks:", len(chunks))

    for i, chunk in enumerate(chunks[:3]):
        print(f"\nCHUNK {i + 1}")
        print("-" * 50)
        print(chunk[:500])