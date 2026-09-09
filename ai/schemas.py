from pydantic import BaseModel, Field
from typing import List, Optional


class UserProfile(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

    state: Optional[str] = None
    district: Optional[str] = None

    category: Optional[str] = None

    occupation: Optional[str] = None
    business_type: Optional[str] = None

    annual_income: Optional[float] = None

    business_experience_years: Optional[float] = None

    investment_amount: Optional[float] = None

    has_existing_business: Optional[bool] = None

    required_funding: Optional[float] = None

    documents_available: List[str] = Field(default_factory=list)