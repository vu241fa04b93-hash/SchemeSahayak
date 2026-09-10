from pathlib import Path
import requests


def download_pdf(url: str, destination: str) -> str:
    """
    Download a PDF from an official source URL
    and save it locally.

    The downloaded content must start with the
    PDF file signature (%PDF).
    """

    if not url:
        raise ValueError("PDF URL is required")

    destination_path = Path(destination)

    destination_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "Chrome/140.0 Safari/537.36"
        ),
        "Accept": "application/pdf,*/*"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()

    content = response.content

    if not content:
        raise ValueError(
            f"Downloaded file is empty: {url}"
        )

    # -------------------------------------------------
    # Validate PDF file signature
    # -------------------------------------------------

    if not content.startswith(b"%PDF"):
        raise ValueError(
            f"URL did not return a valid PDF: {url}"
        )

    destination_path.write_bytes(content)

    return str(destination_path)