import pdfplumber


def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF file using pdfplumber
    """
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
        return text.strip()
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"
