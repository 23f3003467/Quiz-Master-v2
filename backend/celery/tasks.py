from celery import shared_task
import flask_excel
from backend.models import Score, User
from backend.utils import format_report
from backend.celery.mail_service import send_email
from datetime import datetime as dt

@shared_task(ignore_result=False)
def add(x,y):
    print("This is an example task running in Celery.")
    return x+y


# @shared_task(bind=True, ignore_result=False)
# def create_csv(self):
#     from backend.models import Score, User, Quiz  # adjust import as per your app structure

   

#     # Define columns (based on Score + related User + Quiz data)
#     column_names = ['id', 'user_id', 'user_name', 'quiz_id', 'quiz_title',
#                     'total_questions', 'correct_answers', 'total_score', 'duration_taken']

#     # Create a list of row tuples
#     row_data = []
#     for score in scores:
#         row_data.append((
#             score.id,
#             score.user.id if score.user else '',
#             score.user.username if score.user else '',
#             score.quiz.id if score.quiz else '',
#             score.quiz.title if score.quiz else '',
#             score.total_questions,
#             score.correct_answers,
#             score.total_score,
#             score.duration_taken
#         ))

#     # Use flask_excel to write CSV
#     csv_out = flask_excel.make_response_from_array(row_data, column_names, 'csv')
#     print(f"CSV file created: {filename}")
#     print(f"CSV content: {csv_out.data[:100]}...")
#     # Save to file
#     with open(f'./backend/celery/admin-downloads/{filename}', 'wb') as f:
#         f.write(csv_out.data)

#     return filename



@shared_task(bind = True, ignore_result = False)
def create_csv(self):

    # Prepare data from Score model (join with User and Quiz if needed)
    resource = Score.query.all()

    task_id = self.request.id
    filename = f'score_summary_{task_id}.csv'
    column_names = [column.name for column in Score.__table__.columns]
    print(column_names)
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv' )

    with open(f'./backend/celery/admin-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)
    
    return filename



@shared_task(ignore_result = True)
def quiz_notifier():
    users = User.query.all()

    for user in users:
        if not any(role.name == 'admin' for role in user.roles):
            message = f"Hello {user.username},\n\nDon't forget to take your quizzes today!\n\nBest regards,\nQuiz Team"
            send_email(user.email, subject="Quiz Reminder", content=message)

    return 
    








@shared_task(ignore_result=True, name="monthly_score_report")
def monthly_score_report():
    # Start of the current month
    now = dt.utcnow()
    start_of_month = dt(now.year, now.month, 1)
    
    users = User.query.all()

    for user in users[1:]:  # skip the admin
        monthly_scores = Score.query.filter(
            Score.user_id == user.id,
            Score.timestamp >= start_of_month
        ).all()

        if not monthly_scores:
            continue

        user_data = {
            'username': user.username,
            'email': user.email,
            'scores': []
        }

        for score in monthly_scores:
            user_data['scores'].append({
                'quiz_title': score.quiz.title if score.quiz else 'Unknown',
                'total_questions': score.total_questions,
                'correct_answers': score.correct_answers,
                'score': score.total_score,
                'percentage': f"{score.percentage:.2f}",
                'date': score.timestamp.strftime('%Y-%m-%d'),
                'duration_taken': f"{score.duration_taken // 60}m {score.duration_taken % 60}s"
            })

        # Render and send the email
        message = format_report('templates/mail_details.html', user_data)
        send_email(user.email, subject="📈 Monthly Quiz Score Report", content=message)


