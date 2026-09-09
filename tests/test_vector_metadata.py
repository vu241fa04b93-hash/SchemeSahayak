import numpy as np

from rag.vector_store import VectorStore


def test_vector_store_metadata():

    documents = [
        {
            "chunk_id": 0,
            "page": 1,
            "text": "Women entrepreneurs can receive financial assistance."
        },
        {
            "chunk_id": 1,
            "page": 3,
            "text": "Applicants need identity proof."
        },
        {
            "chunk_id": 2,
            "page": 5,
            "text": "The scheme provides business loans."
        }
    ]

    embeddings = np.array(
        [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0]
        ],
        dtype="float32"
    )

    store = VectorStore(
        embeddings.shape[1]
    )

    store.add(
        embeddings,
        documents
    )

    query = np.array(
        [[1.0, 0.0, 0.0]],
        dtype="float32"
    )

    results = store.search(
        query,
        top_k=2
    )

    assert len(results) == 2

    print("\n===== METADATA RESULTS =====")

    for result in results:

        print("\nScore:", result["score"])
        print("Page:", result["page"])
        print("Chunk ID:", result["chunk_id"])
        print("Document:", result["document"])

        assert "page" in result
        assert "chunk_id" in result
        assert "document" in result
        assert "score" in result