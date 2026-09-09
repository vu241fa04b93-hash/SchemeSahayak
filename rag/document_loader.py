from pathlib import Path
import re

from pypdf import PdfReader


def clean_text(text: str) -> str:
    """
    Clean extracted PDF text.
    """

    # Replace multiple spaces/tabs with one space
    text = re.sub(r"[ \t]+", " ", text)

    # Reduce excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    return text.strip()


def load_pdf(file_path: str) -> str:
    """
    Extract and clean text from a PDF file.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"PDF not found: {file_path}"
        )

    if path.suffix.lower() != ".pdf":
        raise ValueError(
            f"Expected a PDF file, got: {path.suffix}"
        )

    reader = PdfReader(str(path))

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    full_text = "\n".join(pages)

    return clean_text(full_text)