from django.urls import path
from .views import (
    ResumeUploadView,
    compatible_jobs_page,
    groq_match,
    paginated_jobs,
    groq_match_resume_job,
)
from .resume_views import get_resume
from .job_views import get_job

urlpatterns = [
    path("upload_resume/", ResumeUploadView.as_view(), name="resume-upload"),
    path("find_jobs/", groq_match, name="find-compatible-jobs"),
    path("find_jobs_page/", compatible_jobs_page, name="find-compatible-jobs-page"),
    path("get_resume/", get_resume, name="get-resume"),
    path("get_job/", get_job, name="get-job"),
    path("paginated_jobs/", paginated_jobs, name="paginated-jobs"),
    path("match_resume_job/", groq_match_resume_job, name="match-resume-job"),
]
