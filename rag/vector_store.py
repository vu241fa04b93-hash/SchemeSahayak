import faiss
import numpy as np


class VectorStore:
    """
    FAISS-based vector store for scheme document chunks.
    """

    def __init__(self, dimension: int):

        self.dimension = dimension

        # Inner Product works as cosine similarity
        # because our embeddings are normalized.
        self.index = faiss.IndexFlatIP(dimension)

        self.documents = []

    def add(self, embeddings, documents):

        embeddings = np.asarray(
            embeddings,
            dtype="float32"
        )

        self.index.add(embeddings)

        self.documents.extend(documents)

    def search(self, query_embedding, top_k: int = 5):

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

            results.append({
                "score": float(score),
                "document": self.documents[index]
            })

        return results