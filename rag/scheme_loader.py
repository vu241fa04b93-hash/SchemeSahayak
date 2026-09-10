from pathlib import Path

from database.database import (
    get_all_schemes,
    get_scheme_sources
)

from rag.pdf_downloader import download_pdf
from rag.scheme_registry import SchemeRegistry


# Existing local PDFs whose filenames do not yet
# match the database file_name.
LOCAL_PDF_OVERRIDES = {
    "S003": "scheme_documents/scheme1.pdf"
}


def load_scheme_registry(
    documents_dir: str = "scheme_documents"
):
    """
    Build a SchemeRegistry using scheme source
    information stored in Supabase.

    Existing local PDFs are reused.
    Missing PDFs are downloaded from official sources.
    """

    documents_path = Path(documents_dir)
    documents_path.mkdir(
        parents=True,
        exist_ok=True
    )

    registry = SchemeRegistry()

    schemes = get_all_schemes()

    for scheme in schemes:

        scheme_id = scheme.get("scheme_id")

        if not scheme_id:
            continue

        # -------------------------------------------------
        # 1. Check known local PDF override
        # -------------------------------------------------

        override_path = LOCAL_PDF_OVERRIDES.get(
            scheme_id
        )

        if override_path:
            local_path = Path(override_path)

            if local_path.exists():
                registry.add_scheme(
                    scheme_id,
                    str(local_path)
                )
                continue

        # -------------------------------------------------
        # 2. Get official source information
        # -------------------------------------------------

        sources = get_scheme_sources(
            scheme_id
        )

        official_source = next(
            (
                source
                for source in sources
                if source.get("is_official") is True
                and source.get("source_url")
            ),
            None
        )

        if not official_source:
            continue

        source_url = official_source.get(
            "source_url"
        )

        file_name = official_source.get(
            "file_name"
        )

        if not file_name:
            file_name = f"{scheme_id}.pdf"

        local_path = documents_path / file_name

        # -------------------------------------------------
        # 3. Reuse existing downloaded PDF
        # -------------------------------------------------

        if local_path.exists():
            registry.add_scheme(
                scheme_id,
                str(local_path)
            )
            continue

        # -------------------------------------------------
        # 4. Download official PDF
        # -------------------------------------------------

        try:
            downloaded_path = download_pdf(
                source_url,
                str(local_path)
            )

            registry.add_scheme(
                scheme_id,
                downloaded_path
            )

        except Exception as error:
            print(
                f"Could not load PDF for "
                f"{scheme_id}: {error}"
            )

    return registry