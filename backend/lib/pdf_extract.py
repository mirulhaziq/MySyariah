import io

import pypdf


def extract_pdf_text(contents: bytes) -> str:
    """Extract all text from a PDF byte payload."""
    reader = pypdf.PdfReader(io.BytesIO(contents))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())
    return "\n\n".join(pages)
