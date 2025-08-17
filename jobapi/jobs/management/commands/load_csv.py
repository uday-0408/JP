# jobs/management/commands/load_csv.py
import os
import csv
from django.core.management.base import BaseCommand
from jobs.models import Job
from datetime import datetime

class Command(BaseCommand):
    help = 'Load jobs from CSV files in output/'

    def handle(self, *args, **kwargs):
        Job.objects.all().delete()
        folder = 'output'
        for filename in os.listdir(folder):
            if filename.endswith('.csv'):
                with open(os.path.join(folder, filename), newline='', encoding='utf-8') as csvfile:
                    reader = csv.DictReader(csvfile)
                    for row in reader:
                        Job.objects.create(
                            title=row.get('title', ''),
                            company=row.get('company', ''),
                            location=row.get('place', ''),
                            url=row.get('url', ''),
                            salary=row.get('salary', ''),
                            job_type=row.get('job_type', ''),
                            description=row.get('description', ''),
                            date_posted=datetime.now(),
                        )
        self.stdout.write(self.style.SUCCESS('✅ Job data loaded successfully.'))
