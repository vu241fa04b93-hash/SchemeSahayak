from rag.embeddings import EmbeddingModel


def test_embeddings():

    model = EmbeddingModel()

    texts = [
        "Women entrepreneurs can receive financial assistance.",
        "Applicants must submit identity documents."
    ]

    embeddings = model.encode(texts)

    assert embeddings.shape[0] == 2
    assert embeddings.shape[1] > 0

    print("\nEmbedding shape:", embeddings.shape)