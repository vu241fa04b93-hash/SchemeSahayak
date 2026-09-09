from pathlib import Path
import pickle

from rag.document_loader import load_pdf_pages
from rag.chunker import chunk_pages
from rag.embeddings import EmbeddingModel
from rag.vector_store import VectorStore


class SchemeIndexer:
    """
    Creates and caches the vector index for a scheme PDF.
    Automatically rebuilds the cache if the source PDF
    has been modified.
    """

    def __init__(
        self,
        pdf_path: str,
        cache_dir: str = "rag_cache"
    ):
        self.pdf_path = pdf_path
        self.cache_dir = Path(cache_dir)

        self.cache_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        pdf_name = Path(pdf_path).stem

        self.cache_file = (
            self.cache_dir / f"{pdf_name}.pkl"
        )

    def build(self):

        # 1. Load PDF pages
        pages = load_pdf_pages(
            self.pdf_path
        )

        if not pages:
            raise ValueError(
                "No readable content found in PDF."
            )

        # 2. Create page-aware chunks
        chunks = chunk_pages(pages)

        if not chunks:
            raise ValueError(
                "No chunks created from PDF."
            )

        # 3. Generate embeddings
        embedding_model = EmbeddingModel()

        embeddings = embedding_model.encode(
            [chunk["text"] for chunk in chunks]
        )

        # 4. Create FAISS vector store
        vector_store = VectorStore(
            embeddings.shape[1]
        )

        vector_store.add(
            embeddings,
            chunks
        )

        # 5. Save cache metadata
        cache_data = {
            "embedding_model_name": "all-MiniLM-L6-v2",
            "pdf_modified_time": Path(
                self.pdf_path
            ).stat().st_mtime,
            "vector_store": vector_store
        }

        with open(
            self.cache_file,
            "wb"
        ) as file:

            pickle.dump(
                cache_data,
                file
            )

        return (
            embedding_model,
            vector_store
        )

    def load(self):

        # No cache → build
        if not self.cache_file.exists():
            return self.build()

        try:

            with open(
                self.cache_file,
                "rb"
            ) as file:

                data = pickle.load(file)

            cached_pdf_time = data.get(
                "pdf_modified_time"
            )

            current_pdf_time = Path(
                self.pdf_path
            ).stat().st_mtime

            # PDF changed → rebuild
            if (
                cached_pdf_time is None
                or current_pdf_time > cached_pdf_time
            ):
                return self.build()

            # Cache is valid
            embedding_model = EmbeddingModel(
                data["embedding_model_name"]
            )

            vector_store = data["vector_store"]

            return (
                embedding_model,
                vector_store
            )

        except (
            pickle.PickleError,
            KeyError,
            EOFError
        ):
            # Corrupted/invalid cache → rebuild
            return self.build()