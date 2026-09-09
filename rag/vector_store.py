import faiss
import numpy as np


class VectorStore:
    """
    FAISS-based vector store for scheme document chunks.
    Supports both plain text documents and
    metadata-rich documents.
    """

    def __init__(self, dimension: int):
        self.dimension = dimension

        # Inner Product works as cosine similarity
        # because embeddings are normalized.
        self.index = faiss.IndexFlatIP(dimension)

        self.documents = []

    def add(self, embeddings, documents):

        embeddings = np.asarray(
            embeddings,
            dtype="float32"
        )

        self.index.add(embeddings)

        self.documents.extend(documents)

    def search(
        self,
        query_embedding,
        top_k: int = 5
    ):

        query_embedding = np.asarray(
            query_embedding,
            dtype="float32"
        )

        scores, indices = self.index.search(
            query_embedding,
            top_k
        )

        results = []

        for score, index in zip(
            scores[0],
            indices[0]
        ):

            if index == -1:
                continue

            document = self.documents[index]

            # Metadata-rich chunk
            if isinstance(document, dict):

                results.append({
                    "score": float(score),
                    "document": document["text"],
                    "page": document.get("page"),
                    "chunk_id": document.get("chunk_id")
                })

            # Backward compatibility with plain text
            else:

                results.append({
                    "score": float(score),
                    "document": document
                })

        return results