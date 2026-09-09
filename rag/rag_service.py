from rag.retriever import Retriever
from rag.index_manager import SchemeIndexManager
from rag.response_formatter import format_sources
from ai.gemini_service import generate_response
from ai.prompts import SCHEME_EXPLANATION_PROMPT


class RAGService:
    """
    Combines multi-scheme document retrieval
    with Gemini to generate grounded explanations.
    """

    def __init__(
        self,
        retriever: Retriever = None,
        index_manager: SchemeIndexManager = None
    ):
        self.retriever = retriever
        self.index_manager = index_manager

    def answer_question(
        self,
        question: str,
        profile=None,
        top_k: int = 5,
        scheme_id: str = None,
        pdf_path: str = None
    ):
        """
        Answer a question using a specific scheme.
        """

        # Use multi-scheme manager when scheme_id
        # and pdf_path are provided.
        if scheme_id and pdf_path:

            if self.index_manager is None:
                raise ValueError(
                    "index_manager is required "
                    "for multi-scheme retrieval"
                )

            results = self.index_manager.retrieve(
                scheme_id=scheme_id,
                pdf_path=pdf_path,
                query=question,
                top_k=top_k
            )

        # Keep backward compatibility with
        # the existing Retriever interface.
        elif self.retriever is not None:

            results = self.retriever.retrieve(
                question,
                top_k=top_k
            )

        else:
            raise ValueError(
                "Either retriever or index_manager "
                "must be provided"
            )

        if not results:
            return (
                "I could not find relevant information "
                "in the available scheme documents."
            )

        scheme_parts = []

        for result in results:

            page = result.get("page")
            chunk_id = result.get("chunk_id")
            document = result["document"]

            source_info = (
                f"[Page: {page}, Chunk: {chunk_id}]"
            )

            scheme_parts.append(
                f"{source_info}\n{document}"
            )

        scheme_information = "\n\n".join(
            scheme_parts
        )

        profile_text = (
            str(profile)
            if profile is not None
            else "No user profile provided."
        )

        prompt = SCHEME_EXPLANATION_PROMPT.format(
            profile=profile_text,
            scheme_information=scheme_information
        )

        answer = generate_response(prompt)

        return answer.strip()

def answer_for_scheme(
    user_input: str,
    question: str,
    scheme_id: str,
    index_manager: SchemeIndexManager,
    top_k: int = 5
):
    """
    Public interface for the multi-scheme AI + RAG system.

    Returns a stable response structure that can be
    directly consumed by the UI and integration layer.
    """

    from ai.gemini_service import extract_user_profile

    if index_manager is None:
        raise ValueError(
            "index_manager is required"
        )

    # 1. Extract user profile
    profile = extract_user_profile(
        user_input
    )

    # 2. Retrieve relevant scheme information
    results = index_manager.retrieve(
        scheme_id=scheme_id,
        query=question,
        top_k=top_k
    )

    # 3. Handle no relevant information
    if not results:
        return {
    "scheme_id": scheme_id,
    "profile": profile,
    "answer": (
        "I could not find relevant information "
        "in the available scheme document."
    ),
    "sources": []
}

    # 4. Prepare retrieved information for Gemini
    scheme_parts = []

    for result in results:

        page = result.get("page")
        chunk_id = result.get("chunk_id")
        document = result.get("document", "")

        source_info = (
            f"[Page: {page}, Chunk: {chunk_id}]"
        )

        scheme_parts.append(
            f"{source_info}\n{document}"
        )

    scheme_information = "\n\n".join(
        scheme_parts
    )

    # 5. Prepare user profile
    profile_text = str(profile)

    # 6. Create grounded AI prompt
    prompt = SCHEME_EXPLANATION_PROMPT.format(
        profile=profile_text,
        scheme_information=scheme_information
    )

    # 7. Generate explanation
    explanation = generate_response(
        prompt
    )

    # 8. Format source information
    sources = format_sources(
        results
    )

    # 9. Return stable API response
    return {
    "scheme_id": scheme_id,
    "profile": profile,
    "answer": explanation.strip(),
    "sources": sources
}

def answer_for_multiple_schemes(
    user_input: str,
    question: str,
    scheme_ids,
    index_manager: SchemeIndexManager,
    top_k: int = 5
):
    """
    Generate AI explanations for multiple schemes.

    Each scheme keeps its own retrieved sources
    and AI-generated explanation.
    """

    from ai.gemini_service import extract_user_profile

    if index_manager is None:
        raise ValueError(
            "index_manager is required"
        )

    if not scheme_ids:
        return []

    # Extract the user profile only once
    profile = extract_user_profile(
        user_input
    )

    results = []

    for scheme_id in scheme_ids:

        retrieved = index_manager.retrieve(
            scheme_id=scheme_id,
            query=question,
            top_k=top_k
        )

        if not retrieved:
            results.append({
                "scheme_id": scheme_id,
                "profile": profile,
                "answer": (
                    "I could not find relevant information "
                    "in the available scheme document."
                ),
                "sources": []
            })
            continue

        scheme_parts = []

        for result in retrieved:

            page = result.get("page")
            chunk_id = result.get("chunk_id")
            document = result.get("document", "")

            source_info = (
                f"[Page: {page}, Chunk: {chunk_id}]"
            )

            scheme_parts.append(
                f"{source_info}\n{document}"
            )

        scheme_information = "\n\n".join(
            scheme_parts
        )

        prompt = SCHEME_EXPLANATION_PROMPT.format(
            profile=str(profile),
            scheme_information=scheme_information
        )

        explanation = generate_response(
            prompt
        )

        sources = format_sources(
            retrieved
        )

        results.append({
            "scheme_id": scheme_id,
            "profile": profile,
            "answer": explanation.strip(),
            "sources": sources
        })

    return results