def format_sources(results):
    """
    Extract clean source information from
    retrieved RAG results.
    """

    sources = []

    for result in results:
        page = result.get("page")
        chunk_id = result.get("chunk_id")
        score = result.get("score")

        sources.append({
            "page": page,
            "chunk_id": chunk_id,
            "score": score
        })

    return sources


def format_retrieved_context(results):
    """
    Convert retrieved results into clean context
    for the AI prompt.
    """

    context_parts = []

    for result in results:

        page = result.get("page")
        chunk_id = result.get("chunk_id")
        document = result.get("document", "")

        context_parts.append({
            "page": page,
            "chunk_id": chunk_id,
            "text": document
        })

    return context_parts