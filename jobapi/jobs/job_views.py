from django.http import JsonResponse
from .models import Job


def get_job(request):
    job_id = request.GET.get("job_id")
    try:
        job = Job.objects.get(id=job_id)
        text = f"Title: {job.title}\nCompany: {job.company}\nLocation: {job.location}\n\nDescription:\n{job.description}"
    except Exception as e:
        text = f"Error: {str(e)}"
    return JsonResponse({"text": text})
