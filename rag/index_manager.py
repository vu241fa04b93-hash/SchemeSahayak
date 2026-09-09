from pathlib import Path

from rag.indexer import SchemeIndexer
from rag.retriever import Retriever
from rag.scheme_registry import SchemeRegistry


class SchemeIndexManager:
    """
    Manages RAG indexes for multiple government schemes.

    Each scheme gets its own cached vector index.
    """

    def __init__(
        self,
        registry: SchemeRegistry,
        cache_dir: str = "rag_cache"
    ):
        self.registry = registry

        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        self.indexers = {}

    def get_index(
        self,
        scheme_id: str
    ):
        """
        Get or create the vector index for a scheme.
        """

        if not self.registry.has_scheme(scheme_id):
            raise KeyError(
                f"Scheme not found: {scheme_id}"
            )

        pdf_path = self.registry.get_pdf_path(
            scheme_id
        )

        if scheme_id not in self.indexers:

            scheme_cache_dir = (
                self.cache_dir / scheme_id
            )

            self.indexers[scheme_id] = SchemeIndexer(
                pdf_path=pdf_path,
                cache_dir=str(scheme_cache_dir)
            )

        return self.indexers[scheme_id].load()

    def get_retriever(
        self,
        scheme_id: str
    ):
        """
        Return a Retriever for a specific scheme.
        """

        embedding_model, vector_store = (
            self.get_index(scheme_id)
        )

        return Retriever(
            embedding_model,
            vector_store
        )

    def retrieve(
        self,
        scheme_id: str,
        query: str,
        top_k: int = 5
    ):
        """
        Retrieve relevant chunks from a specific scheme.
        """

        retriever = self.get_retriever(
            scheme_id
        )

        return retriever.retrieve(
            query,
            top_k=top_k
        )

    def retrieve_multiple(
        self,
        scheme_ids,
        query: str,
        top_k: int = 5
    ):
        """
        Retrieve relevant information from multiple schemes.

        Returns results grouped by scheme ID.
        """

        if not scheme_ids:
            return {}

        results = {}

        for scheme_id in scheme_ids:

            scheme_results = self.retrieve(
                scheme_id=scheme_id,
                query=query,
                top_k=top_k
            )

            results[scheme_id] = scheme_results

        return results