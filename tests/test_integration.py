from integration.service import SchemeSahayakService


def test_service_initialization():
    service = SchemeSahayakService()
    assert service is not None


def test_complete_integration_pipeline(monkeypatch):

    service = SchemeSahayakService()

    # Mock Gemini
    monkeypatch.setattr(
        "integration.service.extract_user_profile",
        lambda _: {
            "age": 28,
            "state": "Andhra Pradesh",
            "business_type": "manufacturing",
            "has_existing_business": False,
            "required_funding": 500000,
            "investment_amount": 500000
        }
    )

    result = service.analyze_user(
        "I want to start a manufacturing business in Andhra Pradesh."
    )

    # Main output
    assert "profile" in result
    assert "profile_dict" in result
    assert "recommendations" in result

    recommendations = result["recommendations"]

    assert isinstance(recommendations, list)
    assert len(recommendations) > 0

    # Check enrichment
    first = recommendations[0]

    assert "scheme_id" in first
    assert "scheme_name" in first
    assert "eligible" in first
    assert "score" in first
    assert "documents" in first
    assert "application_process" in first
    assert "finance" in first
    assert "rag" in first

    print("\nIntegration pipeline working")
    print("Recommendations:", len(recommendations))
    print("Top scheme:", first["scheme_name"])