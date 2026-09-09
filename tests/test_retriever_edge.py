from rag.retriever import Retriever


class FakeEmbeddingModel:

    def encode(self, texts):
        raise AssertionError(
            "Embedding model should not be called for an empty query"
        )


class FakeVectorStore:

    def search(self, query_embedding, top_k=5):
        raise AssertionError(
            "Vector store should not be called for an empty query"
        )


def test_empty_query():

    retriever = Retriever(
        FakeEmbeddingModel(),
        FakeVectorStore()
    )

    result = retriever.retrieve("")

    assert result == []