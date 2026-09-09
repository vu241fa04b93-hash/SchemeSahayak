def chunk_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200
):
    if not text:
        return []

    if overlap >= chunk_size:
        raise ValueError(
            "overlap must be smaller than chunk_size"
        )

    chunks = []
    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


def chunk_pages(
    pages,
    chunk_size: int = 1000,
    overlap: int = 200
):
    """
    Create chunks while preserving page numbers.
    """

    if overlap >= chunk_size:
        raise ValueError(
            "overlap must be smaller than chunk_size"
        )

    chunks = []
    chunk_id = 0

    for page_data in pages:

        page_number = page_data["page"]
        text = page_data["text"]

        page_chunks = chunk_text(
            text,
            chunk_size=chunk_size,
            overlap=overlap
        )

        for chunk in page_chunks:

            chunks.append({
                "chunk_id": chunk_id,
                "page": page_number,
                "text": chunk
            })

            chunk_id += 1

    return chunks