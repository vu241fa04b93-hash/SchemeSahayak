from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database.database import (
    get_all_schemes,
    get_financial_rules,
    supabase,
)
from matching.profile_adapter import profile_to_dict
from matching.ranking import rank_schemes


app = FastAPI(
    title="SchemeSahayak API",
    description="Backend API for SchemeSahayak",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    user_input: str


class ApplicantProfile(BaseModel):
    full_name: str | None = None
    age: int | None = None
    gender: str | None = None
    category: str | None = None
    education: str | None = None
    state: str | None = None
    district: str | None = None
    business_type: str | None = None
    trade: str | None = None
    enterprise_status: str | None = None
    enterprise_size: str | None = None
    ownership_percent: float | None = None
    previous_subsidy: bool | None = None
    has_collateral: bool | None = None
    has_third_party_guarantee: bool | None = None
    project_cost: float | None = None
    own_contribution: float | None = None
    monthly_income: float | None = None
    preferred_tenure_years: float | None = None
    updated_at: str | None = None


# ---------------------------------------------------------
# AUTHENTICATION MODELS
# ---------------------------------------------------------

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


# ---------------------------------------------------------
# HELPER FOR SUPABASE AUTH USER
# ---------------------------------------------------------

def format_auth_user(user, session=None):
    metadata = user.user_metadata or {}

    return {
        "id": user.id,
        "email": user.email,
        "full_name": metadata.get("full_name", ""),
        "phone": metadata.get("phone"),
        "created_at": user.created_at,
        "token": session.access_token if session else None,
    }


# ---------------------------------------------------------
# BASIC ROUTES
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "SchemeSahayak API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "SchemeSahayak Backend"
    }


# ---------------------------------------------------------
# AUTHENTICATION
# ---------------------------------------------------------

@app.post("/api/auth/register")
def register(request: RegisterRequest):
    try:
        response = supabase.auth.sign_up({
            "email": request.email.strip().lower(),
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name.strip(),
                    "phone": request.phone,
                }
            }
        })

        user = response.user

        if user is None:
            raise HTTPException(
                status_code=400,
                detail="Unable to create account."
            )

        return format_auth_user(user, response.session)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@app.post("/api/auth/login")
def login(request: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email.strip().lower(),
            "password": request.password,
        })

        user = response.user

        if user is None or response.session is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        return format_auth_user(user, response.session)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )


# ---------------------------------------------------------
# AI ANALYZE
# ---------------------------------------------------------

@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    from integration.service import SchemeSahayakService

    service = SchemeSahayakService()
    result = service.analyze_user(request.user_input)

    return result


# ---------------------------------------------------------
# SCHEME MATCHING
# ---------------------------------------------------------

@app.post("/api/schemes/match")
def match_schemes(profile: ApplicantProfile) -> List[Dict[str, Any]]:
    """
    Match the frontend ApplicantProfile against all schemes
    using the existing backend eligibility and scoring engine.
    """

    # Convert Pydantic model to dictionary
    frontend_profile = profile.model_dump(exclude_none=True)

    # Convert frontend field names to backend-compatible names
    backend_profile = {
        "name": frontend_profile.get("full_name"),
        "age": frontend_profile.get("age"),
        "gender": frontend_profile.get("gender"),
        "category": frontend_profile.get("category"),
        "education": frontend_profile.get("education"),
        "state": frontend_profile.get("state"),
        "district": frontend_profile.get("district"),
        "business_type": frontend_profile.get("business_type"),
        "trade": frontend_profile.get("trade"),
        "enterprise_status": frontend_profile.get("enterprise_status"),
        "enterprise_size": frontend_profile.get("enterprise_size"),
        "ownership_percent": frontend_profile.get("ownership_percent"),
        "previous_subsidy": frontend_profile.get("previous_subsidy"),
        "has_collateral": frontend_profile.get("has_collateral"),
        "has_third_party_guarantee": frontend_profile.get(
            "has_third_party_guarantee"
        ),
        "project_cost": frontend_profile.get("project_cost"),
        "own_contribution": frontend_profile.get("own_contribution"),
        "monthly_income": frontend_profile.get("monthly_income"),
        "preferred_tenure_years": frontend_profile.get(
            "preferred_tenure_years"
        ),
    }

    # Remove fields that were not supplied
    backend_profile = {
        key: value
        for key, value in backend_profile.items()
        if value is not None
    }

    # Existing backend adapter adds aliases required by the
    # eligibility engine.
    backend_profile = profile_to_dict(backend_profile)

    # Get all schemes from Supabase
    schemes = get_all_schemes()

    # Use the existing Member 3 matching/ranking logic
    ranked_results = rank_schemes(
        backend_profile,
        schemes
    )

    response = []

    for result in ranked_results:

        scheme_id = result["scheme_id"]

        # Find the complete scheme object
        scheme = next(
            (
                item
                for item in schemes
                if item.get("scheme_id") == scheme_id
            ),
            None
        )

        if scheme is None:
            continue

        # Get financial rule for this scheme
        financial_rules = get_financial_rules(scheme_id)

        financial_rule = (
            financial_rules[0]
            if financial_rules
            else None
        )

        matched_rules = result.get(
            "matched_rules",
            []
        )

        failed_rules = result.get(
            "failed_rules",
            []
        )

        # Convert backend boolean result into the
        # three frontend statuses.
        if result.get("eligible"):
            status = "eligible"
        elif matched_rules:
            status = "partial"
        else:
            status = "not_eligible"

        # Criteria expected by the frontend.
        criteria = []

        for reason in matched_rules:
            criteria.append({
                "label": reason,
                "status": "passed"
            })

        for reason in failed_rules:
            criteria.append({
                "label": reason,
                "status": "failed"
            })

        response.append({
            "scheme_id": scheme_id,
            "scheme": scheme,
            "financial_rule": financial_rule,
            "status": status,
            "match_score": result.get("score", 0),
            "criteria": criteria,
            "reasons": matched_rules,
            "remedies": failed_rules,
        })

    return response