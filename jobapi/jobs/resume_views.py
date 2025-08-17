from django.http import JsonResponse
from .models import Resume
from .utils import extract_text_from_pdf


def get_resume(request):
    resume_id = request.GET.get("resume_id")
    print(f"resume id: ", resume_id)
    try:
        resume = Resume.objects.get(id=resume_id)
        file_path = resume.file.path

        if file_path.lower().endswith(".pdf"):
            text = extract_text_from_pdf(file_path)
        else:
            # fallback for non-pdf files
            text = open(file_path, encoding="utf-8").read()
    except Exception as e:
        text = f"Error: {str(e)}"
    return JsonResponse({"text": text})
