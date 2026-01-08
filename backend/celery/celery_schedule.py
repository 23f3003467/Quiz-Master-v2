from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import monthly_score_report

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # every last of month at 18:55
    sender.add_periodic_task(crontab(day_of_month=30, hour=18, minute=55), monthly_score_report.s() )

    

