import os

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase environment variables are missing.")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# -----------------------------
# Schemes
# -----------------------------

def get_all_schemes():
    response = (
        supabase
        .table("schemes")
        .select("*")
        .execute()
    )
    return response.data


def get_scheme_by_id(scheme_id):
    response = (
        supabase
        .table("schemes")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data


# -----------------------------
# Eligibility Rules
# -----------------------------

def get_eligibility_rules(scheme_id):
    response = (
        supabase
        .table("eligibility_rules")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data


# -----------------------------
# Financial Rules
# -----------------------------

def get_financial_rules(scheme_id):
    response = (
        supabase
        .table("financial_rules")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data


# -----------------------------
# Documents
# -----------------------------

def get_scheme_documents(scheme_id):
    response = (
        supabase
        .table("scheme_documents")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data


# -----------------------------
# Sources
# -----------------------------

def get_scheme_sources(scheme_id):
    response = (
        supabase
        .table("scheme_sources")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data

# -----------------------------
# Scheme Sources
# -----------------------------

def get_scheme_sources(scheme_id):
    response = (
        supabase
        .table("scheme_sources")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data


# -----------------------------
# Scheme Categories
# -----------------------------

def get_scheme_categories(scheme_id):
    response = (
        supabase
        .table("scheme_categories")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data


# -----------------------------
# Scheme Beneficiaries
# -----------------------------

def get_scheme_beneficiaries(scheme_id):
    response = (
        supabase
        .table("scheme_beneficiaries")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data


# -----------------------------
# Application Process
# -----------------------------

def get_application_process(scheme_id):
    response = (
        supabase
        .table("scheme_application_process")
        .select("*")
        .eq("scheme_id", scheme_id)
        .order("step_number")
        .execute()
    )
    return response.data


# -----------------------------
# Scheme States
# -----------------------------

def get_scheme_states(scheme_id):
    response = (
        supabase
        .table("scheme_states")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data


# -----------------------------
# Scheme Tags
# -----------------------------

def get_scheme_tags(scheme_id):
    response = (
        supabase
        .table("scheme_tags")
        .select("*")
        .eq("scheme_id", scheme_id)
        .execute()
    )
    return response.data