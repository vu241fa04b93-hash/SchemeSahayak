from rag.response_formatter import (
    format_sources,
    format_retrieved_context
)


def test_format_sources():

    results = [
        {
            "score": 0.91,
            "document": "Eligibility information",
            "page": 4,
            "chunk_id": 10
        },
        {
            "score": 0.84,
            "document": "Funding information",
            "page": 7,
            "chunk_id": 18
        }
    ]

    sources = format_sources(results)

    assert len(sources) == 2
    assert sources[0]["page"] == 4
    assert sources[1]["page"] == 7


def test_format_retrieved_context():

    results = [
        {
            "score": 0.91,
            "document": "Eligibility information",
            "page": 4,
            "chunk_id": 10
        }
    ]

    context = format_retrieved_context(results)

    assert len(context) == 1
    assert context[0]["page"] == 4
    assert context[0]["chunk_id"] == 10
    assert context[0]["text"] == "Eligibility information"