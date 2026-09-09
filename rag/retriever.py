class Retriever:
    """
    Retrieves relevant scheme document chunks
    along with their metadata.
    """

    def __init__(self, embedding_model, vector_store):
        self.embedding_model = embedding_model
        self.vector_store = vector_store

    def retrieve(
        self,
        query: str,
        top_k: int = 5
    ):
        if not query or not query.strip():
            return []

        query_embedding = self.embedding_model.encode(
            [query]
        )

        results = self.vector_store.search(
            query_embedding,
            top_k=top_k
        )

        return results