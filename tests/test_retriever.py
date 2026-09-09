from rag.embeddings import EmbeddingModel
from rag.vector_store import VectorStore
from rag.retriever import Retriever


def test_retriever():

    model = EmbeddingModel()

    documents = [
        "Women entrepreneurs can receive financial assistance.",
        "Applicants need identity proof.",
        "The scheme provides business loans.",
        "Farmers can receive agricultural subsidies."
    ]

    embeddings = model.encode(documents)

    store = VectorStore(
        embeddings.shape[1]
    )

    store.add(
        embeddings,
        documents
    )

    retriever = Retriever(
        model,
        store
    )

    results = retriever.retrieve(
        "financial support for women entrepreneurs",
        top_k=2
    )

    assert len(results) == 2

    print("\nRETRIEVED DOCUMENTS")

    for result in results:

        print("\nScore:", result["score"])
        print("Document:", result["document"])