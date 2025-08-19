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
from django.views.decorators.http import require_http_methods


@csrf_exempt
def groq_match_resume_job(request):
    print("\n--- RESUME MATCHING API ENDPOINT CALLED ---")
    print(f"Request method: {request.method}")
    print(f"Content type: {request.content_type}")
    print(f"POST data keys: {list(request.POST.keys())}")
    print(f"FILES keys: {list(request.FILES.keys())}")

    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method == "POST":
        # Accepts multipart/form-data: resume file and job_description
        resume_file = request.FILES.get("resume")
        job_description = request.POST.get("job_description")

        print(f"Resume file received: {resume_file is not None}")
        if resume_file:
            print(
                f"Resume file name: {resume_file.name}, size: {resume_file.size} bytes"
            )
        print(f"Job description received: {job_description is not None}")
        if job_description:
            print(f"Job description length: {len(job_description)} characters")

        if not resume_file or not job_description:
            error_msg = f"Missing {'resume file' if not resume_file else ''}{' and ' if not resume_file and not job_description else ''}{'job description' if not job_description else ''}"
            print(f"ERROR: {error_msg}")
            return JsonResponse({"error": error_msg}, status=400)

        # Save the uploaded resume temporarily
        print("Saving resume to temporary file...")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            for chunk in resume_file.chunks():
                tmp.write(chunk)
            resume_path = tmp.name
            print(f"Resume saved to temporary file: {resume_path}")

        try:
            print("Extracting text from PDF...")
            resume_text = extract_text_from_pdf(resume_path)
            print(f"Successfully extracted {len(resume_text)} characters from resume")
        except Exception as e:
            error_msg = f"Failed to extract text from resume: {str(e)}"
            print(f"ERROR: {error_msg}")
            return JsonResponse({"error": error_msg}, status=400)
        finally:
            print(f"Removing temporary file: {resume_path}")
            os.remove(resume_path)

        print("Loading environment variables...")
        GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        print(f"GROQ API key loaded: {GROQ_API_KEY is not None}")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        print("API headers prepared")

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

        response = JsonResponse({"match": match})
        response["Access-Control-Allow-Origin"] = "*"
        return response


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
            # Save and return only the new Resume ID
            instance = serializer.save()
            return Response({"id": instance.id}, status=status.HTTP_201_CREATED)
        # Return validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@require_http_methods(["POST"])
def extract_job_data(request):
    """
    Endpoint for extracting structured job data from job descriptions using Groq API.

    Accepts POST requests with job description text and returns structured JSON data.
    """
    try:
        # Load environment variables
        load_dotenv()

        # Get the Groq API key
        groq_api_key = os.getenv("GROQ_API_KEY")

        if not groq_api_key:
            return JsonResponse(
                {"error": "GROQ API key not found in environment variables"}, status=500
            )

        # Parse the request body
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)

        # Get the job description from the request
        job_description = body.get("description", "")

        if not job_description:
            return JsonResponse({"error": "No job description provided"}, status=400)

        # Create the Groq API request
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json",
        }

        prompt = f"""
You are an information extraction system.  
Given a job description, return ONLY a valid JSON object with the following fields:  

{{
  "title": string,               // Exact official job title
  "description": string,         // Cleaned job description
  "salary": number,              // Minimum yearly salary if range exists, else 0
  "experienceLevel": number,     // 0 = Entry-level/Fresher, 1 = Mid-level, 2 = Senior
  "location": [string],          // Array of job locations
  "jobType": string,             // Example: "Full-time", "Part-time", "Internship", "Contract"
  "requirements": [string],      // Bullet points of qualifications/skills/experience
  "company": string              // Main company name
}}

Rules:
- Do not invent data. If missing, leave as 0, empty string, or empty array.
- Output must be valid JSON only (starting with {{ and ending with }}).
- Do not include metadata like djangoJobId, createdAt, updatedAt, applications, __v.
- Only return extracted values from the description.

Job Description:
{job_description}
"""

        payload = {
            "model": "llama3-70b-8192",  # Using Llama 3 70B model for structured extraction
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,  # Lower temperature for more deterministic output
            "max_tokens": 2048,
        }

        # Make the API request to Groq
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )

        # Check for successful response
        if response.status_code == 200:
            response_data = response.json()
            extracted_data = response_data["choices"][0]["message"]["content"]

            # Clean the response to ensure it's valid JSON
            extracted_data = extracted_data.strip()

            # Remove any possible markdown code block markers
            if extracted_data.startswith("```json"):
                extracted_data = extracted_data[7:]
            if extracted_data.endswith("```"):
                extracted_data = extracted_data[:-3]

            extracted_data = extracted_data.strip()

            try:
                # Parse the extracted JSON data
                parsed_data = json.loads(extracted_data)
                return JsonResponse(parsed_data, safe=True)
            except json.JSONDecodeError as e:
                return JsonResponse(
                    {
                        "error": "Failed to parse extracted data as JSON",
                        "details": str(e),
                        "raw_data": extracted_data,
                    },
                    status=500,
                )
        else:
            # Return error response
            return JsonResponse(
                {
                    "error": "Error from Groq API",
                    "status_code": response.status_code,
                    "response": response.text,
                },
                status=response.status_code,
            )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
