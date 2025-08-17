from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.shortcuts import render
import json
import os
import requests
from dotenv import load_dotenv
from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Job, Resume
from .serializer import JobSerializer, ResumeSerializer
from .utils import extract_text_from_pdf
import tempfile


@csrf_exempt
def groq_match_resume_job(request):
    if request.method == "POST":
        # Accepts multipart/form-data: resume file and job_description
        resume_file = request.FILES.get("resume")
        job_description = request.POST.get("job_description")
        if not resume_file or not job_description:
            return JsonResponse(
                {"error": "Missing resume file or job description."}, status=400
            )

        # Save the uploaded resume temporarily

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            for chunk in resume_file.chunks():
                tmp.write(chunk)
            resume_path = tmp.name

        try:
            resume_text = extract_text_from_pdf(resume_path)
        except Exception as e:
            return JsonResponse(
                {"error": f"Failed to extract text from resume: {str(e)}"}, status=400
            )
        finally:
            os.remove(resume_path)

        GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        prompt = f"""
        You are an advanced ATS (Applicant Tracking System) assistant specializing in software and IT jobs.
        Read the resume and job description, then return a detailed JSON analysis with the following:

        1. rank → Match score from 0–100 showing how well the resume fits the job.
        2. skills → List of all hard (technical) and soft skills found in the resume.
        3. total_experience → Total professional experience in years (approximate if needed).
        4. project_category → Categories or domains of projects in the resume (e.g., AI, Web Development, Cloud, Data Science, Mobile Apps, etc.).
        5. missing_skills → List of important skills in the job description that are not clearly mentioned in the resume.
        6. improvement_suggestions → Actionable ways the candidate can improve the resume for better ATS and recruiter match rates.

        Resume:
        {resume_text}

        Job Description:
        {job_description}

        Respond ONLY with valid JSON in the exact structure below:
        {{
            "rank": <number>,
            "skills": ["skill1", "skill2", ...],
            "total_experience": <number>,
            "project_category": ["category1", "category2", ...],
            "missing_skills": ["skill1", "skill2", ...],
            "improvement_suggestions": ["suggestion1", "suggestion2", ...]
        }}
        """

        payload = {
            "model": "deepseek-r1-distill-llama-70b",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a highly accurate and concise job matching assistant.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"},
        }

        groq_resp = requests.post(url, headers=headers, json=payload)
        print("Groq API raw response:", groq_resp.text)

        try:
            match = groq_resp.json()["choices"][0]["message"]["content"]
        except Exception:
            match = (
                f"Could not get a response from Groq. Raw response: {groq_resp.text}"
            )

        return JsonResponse({"match": match})


@csrf_exempt
def paginated_jobs(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            page_no = int(data.get("page_no", 1))
            page_size = int(data.get("page_size", 10))
            if page_no < 1 or page_size < 1:
                return JsonResponse(
                    {"error": "page_no and page_size must be positive integers."},
                    status=400,
                )
            start = (page_no - 1) * page_size
            end = start + page_size
            jobs = Job.objects.all()[start:end]
            jobs_data = [
                {
                    "id": job.pk,
                    "title": job.title,
                    "company": job.company,
                    "location": job.location,
                    "description": job.description,
                }
                for job in jobs
            ]
            return JsonResponse(
                {"jobs": jobs_data, "page_no": page_no, "page_size": page_size},
                status=200,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Only POST requests are allowed."}, status=405)


# Load environment variables from .env file
load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
)


# Using the utility function from utils.py instead


@csrf_exempt
def groq_match(request):
    if request.method == "POST":
        data = json.loads(request.body)
        resume_id = data.get("resume_id")
        job_id = data.get("job_id")
        try:
            resume = Resume.objects.get(id=resume_id)
            job = Job.objects.get(id=job_id)
            resume_text = extract_text_from_pdf(resume.file.path)
            job_text = f"{job.title}\n{job.company}\n{job.location}\n{job.description}"
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

        GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        prompt = f"""
        You are an advanced ATS (Applicant Tracking System) assistant specializing in software and IT jobs.
        Read the resume and job description, then return a detailed JSON analysis with the following:

        1. rank → Match score from 0–100 showing how well the resume fits the job.
        2. skills → List of all hard (technical) and soft skills found in the resume.
        3. total_experience → Total professional experience in years (approximate if needed).
        4. project_category → Categories or domains of projects in the resume (e.g., AI, Web Development, Cloud, Data Science, Mobile Apps, etc.).
        5. missing_skills → List of important skills in the job description that are not clearly mentioned in the resume.
        6. improvement_suggestions → Actionable ways the candidate can improve the resume for better ATS and recruiter match rates.

        Resume:
        {resume_text}

        Job Description:
        {job_text}

        Respond ONLY with valid JSON in the exact structure below:
        {{
            "rank": <number>,
            "skills": ["skill1", "skill2", ...],
            "total_experience": <number>,
            "project_category": ["category1", "category2", ...],
            "missing_skills": ["skill1", "skill2", ...],
            "improvement_suggestions": ["suggestion1", "suggestion2", ...]
        }}
        """

        payload = {
            "model": "deepseek-r1-distill-llama-70b",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a highly accurate and concise job matching assistant.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"},
        }

        groq_resp = requests.post(url, headers=headers, json=payload)
        print("Groq API raw response:", groq_resp.text)

        try:
            match = groq_resp.json()["choices"][0]["message"]["content"]
        except Exception:
            match = (
                f"Could not get a response from Groq. Raw response: {groq_resp.text}"
            )

        return JsonResponse({"match": match})
    else:
        return JsonResponse({"error": "Only POST requests are allowed."}, status=405)


def compatible_jobs_page(request):
    return render(request, "find_jobs.html")


class ResumeUploadView(generics.CreateAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
