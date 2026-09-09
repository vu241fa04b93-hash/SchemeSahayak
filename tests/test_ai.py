from ai.gemini_service import extract_user_profile


def test_complete_profile():

    user_input = """
    My name is Ravi Kumar.
    I am 28 years old.
    I live in Guntur, Andhra Pradesh.
    I belong to OBC category.
    I want to start a tailoring business.
    My annual income is 2 lakh rupees.
    I can invest 1 lakh myself.
    I need 5 lakh funding.
    """

    profile = extract_user_profile(user_input)

    assert profile.name == "Ravi Kumar"
    assert profile.age == 28
    assert profile.state == "Andhra Pradesh"
    assert profile.category == "OBC"
    assert profile.annual_income == 200000
    assert profile.required_funding == 500000