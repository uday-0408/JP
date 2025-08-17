# Job Compatibility API & Frontend

A Django-based API and frontend for uploading resumes, matching them to jobs, and getting AI-powered compatibility analysis using Groq LLM.

## Features
- Upload resumes (PDF)
- Store jobs and resumes in a database
- Check compatibility between a resume and a job using Groq API
- Beautiful frontend for users to enter resume/job IDs and view results
- Progress bar and syntax-highlighted JSON output

## Endpoints
- `/api/upload_resume/` (POST): Upload a resume file
- `/api/find_jobs/` (POST): Send resume_id and job_id, get Groq-powered compatibility JSON
- `/api/find_jobs_page/` (GET): Frontend page for entering IDs and viewing results

## Quick Start

### 1. Clone the repository
```
git clone <your-repo-url>
cd jobapi
```

### 2. Install dependencies
```
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run migrations
```
python manage.py migrate
```

### 5. Create a superuser (optional)
```
python manage.py createsuperuser
```

### 6. Start the server
```
python manage.py runserver
```

### 7. Usage
- Go to `/api/find_jobs_page/` in your browser.
- Enter a resume ID and job ID (upload resumes and create jobs via admin or API).
- View compatibility results with progress bar and formatted JSON.

## File Structure
- `jobapi/` - Django project settings
- `jobs/` - Main app (models, views, urls)
- `templates/find_jobs.html` - Frontend page
- `db.sqlite3` - Default database
- `.env` - Environment variables

## Requirements
- Python 3.10+
- Django
- Django REST Framework
- pdfplumber
- python-dotenv
- requests

## License
MIT

---
For questions or issues, open an issue or contact the maintainer.
