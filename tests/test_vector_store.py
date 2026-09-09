from rag.embeddings import EmbeddingModel
from rag.vector_store import VectorStore


def test_vector_store():

    model = EmbeddingModel()

    documents = [
        "Women entrepreneurs can receive financial assistance.",
        "Applicants need identity proof and address proof.",
        "The scheme provides loans for small businesses.",
        "Farmers can receive agricultural subsidies."
    ]

    embeddings = model.encode(documents)

    dimension = embeddings.shape[1]

    store = VectorStore(dimension)

    store.add(
        embeddings,
        documents
    )

    query = "financial support for women entrepreneurs"

    query_embedding = model.encode([query])

    results = store.search(
        query_embedding,
        top_k=2
    )

    assert len(results) == 2

    print("\nSEARCH RESULTS")

    for result in results:

        print("\nScore:", result["score"])
        print("Document:", result["document"])