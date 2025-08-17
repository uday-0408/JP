from django.db import models


class Resume(models.Model):
    file = models.FileField(upload_to="resumes/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume {self.id}"


class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    url = models.URLField(blank=True)
    salary = models.CharField(max_length=100, null=True, blank=True)
    job_type = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    date_posted = models.DateTimeField()

    def __str__(self) -> str:
        return self.title
