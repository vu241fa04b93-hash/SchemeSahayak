from rag.document_loader import load_pdf_pages
from rag.chunker import chunk_pages


def test_page_chunks():

    # Change this to your actual PDF filename
    pdf_path = "scheme_documents/scheme1.pdf"

    pages = load_pdf_pages(pdf_path)

    chunks = chunk_pages(pages)

    assert len(chunks) > 0

    print("\n===== PAGE-AWARE CHUNKS =====")
    print("Total chunks:", len(chunks))

    for chunk in chunks[:5]:

        print("\nChunk ID:", chunk["chunk_id"])
        print("Page:", chunk["page"])
        print("Text:", chunk["text"][:300])

        assert "chunk_id" in chunk
        assert "page" in chunk
        assert "text" in chunk