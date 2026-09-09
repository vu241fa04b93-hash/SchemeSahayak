class Retriever:
    """
    Retrieves relevant scheme document chunks.
    """

    def __init__(self, embedding_model, vector_store):

        self.embedding_model = embedding_model
        self.vector_store = vector_store

    def retrieve(
        self,
        query: str,
        top_k: int = 5
    ):

        query_embedding = self.embedding_model.encode(
            [query]
        )

        return self.vector_store.search(
            query_embedding,
            top_k=top_k
        )