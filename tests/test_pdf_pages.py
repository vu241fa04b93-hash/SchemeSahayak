from rag.document_loader import load_pdf_pages


def test_load_pdf_pages():

    # Change this to your actual PDF filename
    pdf_path = "scheme_documents/scheme1.pdf"

    pages = load_pdf_pages(pdf_path)

    assert len(pages) > 0

    print("\n===== PDF PAGES =====")
    print("Total pages:", len(pages))

    for page in pages[:3]:
        print("\nPage:", page["page"])
        print(page["text"][:300])

        assert "page" in page
        assert "text" in page