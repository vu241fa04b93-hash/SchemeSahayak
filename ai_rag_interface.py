from rag.scheme_registry import SchemeRegistry
from rag.index_manager import SchemeIndexManager
from rag.rag_service import answer_for_scheme
from rag.scheme_loader import load_scheme_registry


class SchemeSahayakAI:
    """
    High-level interface for the SchemeSahayak
    AI + RAG system.

    Other team members can use this class without
    directly handling embeddings, FAISS, or PDFs.
    """

    def __init__(
        self,
        schemes=None,
        load_from_database=False
    ):
        # -------------------------------------------------
        # Registry
        # -------------------------------------------------

        if load_from_database:
            self.registry = load_scheme_registry()

        else:
            self.registry = SchemeRegistry(
                schemes=schemes
            )

        # -------------------------------------------------
        # Index manager
        # -------------------------------------------------

        self.index_manager = SchemeIndexManager(
            registry=self.registry
        )

    def add_scheme(
        self,
        scheme_id: str,
        pdf_path: str
    ):
        """
        Add a scheme dynamically.
        """

        self.registry.add_scheme(
            scheme_id,
            pdf_path
        )

    def ask_scheme(
        self,
        user_input: str,
        question: str,
        scheme_id: str,
        top_k: int = 5
    ):
        """
        Ask a question about a specific scheme.
        """

        return answer_for_scheme(
            user_input=user_input,
            question=question,
            scheme_id=scheme_id,
            index_manager=self.index_manager,
            top_k=top_k
        )