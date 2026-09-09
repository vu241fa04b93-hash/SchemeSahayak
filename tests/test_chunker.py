from rag.chunker import chunk_text


def test_chunker():

    text = "Government scheme information. " * 200

    chunks = chunk_text(text)

    assert len(chunks) > 1

    for chunk in chunks:
        assert len(chunk) > 0

    print("\nNumber of chunks:", len(chunks))

    for i, chunk in enumerate(chunks[:3]):

        print(f"\nCHUNK {i + 1}")
        print("-" * 50)
        print(chunk[:300])