from ai.gemini_service import extract_user_profile
from matching.profile_adapter import profile_to_dict
from matching.ranking import rank_schemes
from database.database import (
    get_all_schemes,
    get_scheme_documents,
    get_application_process
)
from Finance.calculator import calculate_finance_for_scheme


class SchemeSahayakService:

    def __init__(self, rag_ai=None):
        self.rag_ai = rag_ai

    def analyze_user(self, user_input: str):

        # 1. Extract user profile
        profile = extract_user_profile(user_input)

        # 2. Convert profile for matching engine
        profile_dict = profile_to_dict(profile)

        # 3. Load schemes from database
        schemes = get_all_schemes()

        # 4. Check eligibility + calculate scores + rank
        ranked_schemes = rank_schemes(
            profile_dict,
            schemes
        )

        recommendations = []

        # 5. Enrich each recommendation
        for result in ranked_schemes:

            scheme_id = result["scheme_id"]

            # Documents
            documents = get_scheme_documents(scheme_id)

            # Application process
            application_process = get_application_process(scheme_id)

            # Finance
            finance_result = None

            try:
                finance_result = calculate_finance_for_scheme(
                    scheme_id=scheme_id,
                    project_cost=profile_dict.get("investment_amount"),
                    loan_amount=profile_dict.get("required_funding")
                )
            except Exception as error:
                finance_result = {
                    "error": str(error)
                }

            result["documents"] = documents
            result["application_process"] = application_process
            result["finance"] = finance_result

            # RAG
            if (
                self.rag_ai is not None
                and self.rag_ai.registry.has_scheme(scheme_id)
            ):
                try:
                    rag_result = self.rag_ai.ask_scheme(
                        user_input=user_input,
                        question="Explain this scheme and why it may be relevant to this user.",
                        scheme_id=scheme_id
                    )
                    result["rag"] = rag_result

                except Exception as error:
                    result["rag"] = {
                        "error": str(error)
                    }
            else:
                result["rag"] = {
                    "status": "Official PDF unavailable"
                }

            recommendations.append(result)

        return {
            "profile": profile,
            "profile_dict": profile_dict,
            "recommendations": recommendations
        }