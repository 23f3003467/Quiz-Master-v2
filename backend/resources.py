from flask_restful import Api,Resource,reqparse, marshal_with, fields 
from .models import *
from flask_security import auth_required, roles_required,roles_accepted, current_user,hash_password
from flask import request, jsonify,render_template, current_app as app



cached=app.cache



api=Api()

user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'fullname': fields.String,
    'qualification': fields.String,
    'dob': fields.String,
    'role': fields.String,
    'created_at': fields.String
}

subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'created_at': fields.String
}

chapter_fields = {
    'id': fields.Integer,
    'subject_id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'created_at': fields.String
}

quiz_fields = {
    'id': fields.Integer,
    'chapter_id': fields.Integer,
    'title': fields.String,
    'date_of_quiz': fields.String,
    'time_duration': fields.String, 
    'remarks': fields.String,
    'created_at': fields.String
}

question_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'question_statement': fields.String,
    'option1': fields.String,
    'option2': fields.String,
    'option3': fields.String,
    'option4': fields.String,
    'correct_option': fields.Integer,
    'created_at': fields.String
}

score_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'user_id': fields.Integer,
    'timestamp': fields.String,
    'total_questions': fields.Integer,
    'correct_answers': fields.Integer,
    'total_score': fields.Float,
    'duration_taken': fields.Integer
}














class UserResource(Resource):
    @marshal_with(user_fields)
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):   #get user info
        if 'admin' in [role.name for role in current_user.roles]:
            users = User.query.filter(User.id != current_user.id).all()
            return users  # Return all users except self
        else:
            # Regular user can only see their own data
            user = User.query.get_or_404(current_user.user_id)
            return user
    @auth_required('token')
    @roles_required('user')
    def put(self, user_id):    #update user info
        user = User.query.get_or_404(user_id)
        
        parser = reqparse.RequestParser()
        parser.add_argument('fullname', type=str)
        parser.add_argument('qualification', type=str)
        parser.add_argument('dob', type=str)
        parser.add_argument('role', type=str)
        
        args = parser.parse_args()
        
        # Convert date string to date object if provided
        if args['dob']:
            try:
                args['dob'] = datetime.strptime(args['dob'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format for dob. Use YYYY-MM-DD'}, 400
        
        for key, value in args.items():
            if value is not None:
                setattr(user, key, value)
        
        db.session.commit()
        
        return {'message': 'User updated successfully'}, 200


class SubjectResource(Resource):
    
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self, subject_id=None):
        if subject_id:
            subject = Subject.query.get_or_404(subject_id)
            return subject.to_json()  # Return single subject as JSON
        else:
           subjects = Subject.query.all()
        #    print([subject.to_json() for subject in subjects])
           return jsonify([subject.to_json() for subject in subjects])  # <- convert to list of dicts
# Return all subjects as JSON

    
    @auth_required('token')
    @roles_accepted('admin')  # Only admin can create
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Name is required')
        parser.add_argument('description', type=str)
        args = parser.parse_args()
        print(args)
        # Check if subject with same name exists
        existing_subject = Subject.query.filter_by(name=args['name']).first()
        if existing_subject:
            return {'message': 'Subject with this name already exists'}, 400
        
        new_subject = Subject(
            name=args['name'],
            description=args['description']
        )
        db.session.add(new_subject)
        db.session.commit()
        return {'message':'Succesfully created subject '}, 201  # can marshal the new subject

   
    @auth_required('token')
    @roles_accepted('admin')  # Only admin can update
    def put(self, subject_id):
        subject = Subject.query.get_or_404(subject_id)
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str)
        parser.add_argument('description', type=str)
        args = parser.parse_args()

        if args['name'] is not None:
            subject.name = args['name']
        if args['description'] is not None:
            subject.description = args['description']

        db.session.commit()
        return {'message':'Succesfully updated subject '}, 200  

    @auth_required('token')
    @roles_accepted('admin')  # Only admin can delete
    def delete(self, subject_id):
        subject = Subject.query.get_or_404(subject_id)
        db.session.delete(subject)
        db.session.commit()
        return {'message': 'Subject deleted successfully'}, 200


class ChapterResource(Resource):
    @marshal_with(chapter_fields)
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self, chapter_id=None):
        if chapter_id:
            return Chapter.query.get_or_404(chapter_id)
        return Chapter.query.all()

    
    @auth_required('token')
    @roles_accepted('admin')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True)
        parser.add_argument('description', type=str)
        parser.add_argument('subject_id', type=int, required=True)
        args = parser.parse_args()

        # Subject existence check
        subject = Subject.query.get(args['subject_id'])
        if not subject:
            return {'message': 'Subject not found'}, 404
        if Chapter.query.filter_by(name=args['name'], subject_id=args['subject_id']).first():
            return {'message': 'Chapter with this name already exists in this subject'}, 400

        new_chapter = Chapter(**args)
        db.session.add(new_chapter)
        db.session.commit()
        return {'message':'Succesfully created chapter '}, 201 

    
    @auth_required('token')
    @roles_accepted('admin')
    def put(self, chapter_id):
        chapter = Chapter.query.get_or_404(chapter_id)
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str)
        parser.add_argument('description', type=str)
        parser.add_argument('subject_id', type=int)
        args = parser.parse_args()
        if args['subject_id']:
            subject = Subject.query.get(args['subject_id'])
            if not subject:
                return {'message': 'Subject not found'}, 404
        for key, value in args.items():
            if value is not None:
                setattr(chapter, key, value)
        db.session.commit()
        return {'message':'Succesfully updated chapter '}, 200

    @auth_required('token')
    @roles_accepted('admin')
    def delete(self, chapter_id):
        chapter = Chapter.query.get_or_404(chapter_id)
        db.session.delete(chapter)
        db.session.commit()
        return {'message': 'Chapter deleted successfully'}, 200


class QuizResource(Resource):
    
    @auth_required('token')
    @roles_accepted('user', 'admin')  # Cache for 5 seconds
    def get(self, quiz_id=None):
        if quiz_id:
            quiz = Quiz.query.get_or_404(quiz_id)
            return quiz.to_json()
        return [quiz.to_json() for quiz in Quiz.query.all()]


    @auth_required('token')
    @roles_accepted('admin')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str, required=True)
        parser.add_argument('chapter_id', type=int, required=True)
        parser.add_argument('date_of_quiz', type=str, required=True)
        parser.add_argument('time_duration', type=str, required=True)
        parser.add_argument('remarks', type=str)
        args = parser.parse_args()
        chapter = Chapter.query.get(args['chapter_id'])
        if not chapter:
            return {'message': 'Chapter not found'}, 404
        try:
            quiz_date = datetime.strptime(args['date_of_quiz'], '%Y-%m-%d').date()
        except ValueError:
            return {'message': 'Invalid date format for date_of_quiz. Use YYYY-MM-DD'}, 400
        if not args['time_duration'].replace(':', '').isdigit() or len(args['time_duration'].split(':')) != 2:
            return {'message': 'Invalid time duration format. Use HH:MM'}, 400
        new_quiz = Quiz(
            title=args['title'],
            chapter_id=args['chapter_id'],
            date_of_quiz=quiz_date,
            time_duration=args['time_duration'],
            remarks=args['remarks']
        )
        db.session.add(new_quiz)
        db.session.commit()
        return {'message':'Succesfully created quiz '}, 201 


    
    @auth_required('token')
    @roles_accepted('admin')
    def put(self, quiz_id):
        quiz = Quiz.query.get_or_404(quiz_id)
        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str)
        parser.add_argument('chapter_id', type=int)
        parser.add_argument('date_of_quiz', type=str)
        parser.add_argument('time_duration', type=str)
        parser.add_argument('remarks', type=str)
        args = parser.parse_args()
        if args['chapter_id'] and not Chapter.query.get(args['chapter_id']):
            return {'message': 'Chapter not found'}, 404
        if args['date_of_quiz']:
            try:
                args['date_of_quiz'] = datetime.strptime(args['date_of_quiz'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format for date_of_quiz. Use YYYY-MM-DD'}, 400
        if args['time_duration'] and (not args['time_duration'].replace(':', '').isdigit() or len(args['time_duration'].split(':')) != 2):
            return {'message': 'Invalid time duration format. Use HH:MM'}, 400
        for key, value in args.items():
            if value is not None:
                setattr(quiz, key, value)
        db.session.commit()
        return {'message':'Succesfully updated quiz '}, 200 

    @auth_required('token')
    @roles_accepted('admin')
    def delete(self, quiz_id):
        quiz = Quiz.query.get_or_404(quiz_id)
        db.session.delete(quiz)
        db.session.commit()
        return {'message': 'Quiz deleted successfully'}, 200


class QuestionResource(Resource):
    @marshal_with(question_fields)
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self, question_id=None):
        if question_id:
            return Question.query.get_or_404(question_id)
        
        parser = reqparse.RequestParser()
        parser.add_argument('quiz_id', type=int, location='args')
        args = parser.parse_args()

        if args['quiz_id']:
            return Question.query.filter_by(quiz_id=args['quiz_id']).all()
        return Question.query.all()


    
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('quiz_id', type=int, required=True)
        parser.add_argument('question_statement', type=str, required=True)
        parser.add_argument('option1', type=str, required=True)
        parser.add_argument('option2', type=str, required=True)
        parser.add_argument('option3', type=str, required=True)
        parser.add_argument('option4', type=str, required=True)
        parser.add_argument('correct_option', type=int, required=True)
        args = parser.parse_args()
        quiz = Quiz.query.get(args['quiz_id'])
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        if args['correct_option'] < 1 or args['correct_option'] > 4:
            return {'message': 'Correct option must be between 1 and 4'}, 400
        question = Question(**args)
        db.session.add(question)
        db.session.commit()
        return {'message':'Succesfully added question '}, 201 

    @marshal_with(question_fields)
    @auth_required('token')
    @roles_required('admin')
    def put(self, question_id):
        question = Question.query.get_or_404(question_id)
        parser = reqparse.RequestParser()
        parser.add_argument('quiz_id', type=int)
        parser.add_argument('question_statement', type=str)
        parser.add_argument('option1', type=str)
        parser.add_argument('option2', type=str)
        parser.add_argument('option3', type=str)
        parser.add_argument('option4', type=str)
        parser.add_argument('correct_option', type=int)
        args = parser.parse_args()
        if args['quiz_id'] and not Quiz.query.get(args['quiz_id']):
            return {'message': 'Quiz not found'}, 404
        if args['correct_option'] and (args['correct_option'] < 1 or args['correct_option'] > 4):
            return {'message': 'Correct option must be between 1 and 4'}, 400
        for key, value in args.items():
            if value is not None:
                setattr(question, key, value)
        db.session.commit()
        return question, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, question_id):
        question = Question.query.get_or_404(question_id)
        db.session.delete(question)
        db.session.commit()
        return {'message': 'Deleted'}, 200


class ScoreResource(Resource):
    # @marshal_with(score_fields)
    @auth_required('token')
    @roles_accepted('user', 'admin')
    @cached.cached(timeout=5, query_string=True)  # Cache for 5 seconds
    def get(self, score_id=None):
        if score_id:
            return Score.query.get_or_404(score_id)
        
        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=int, location='args')
        parser.add_argument('quiz_id', type=int, location='args')
        args = parser.parse_args()

        query = Score.query
        if args['user_id']:
            query = query.filter_by(user_id=args['user_id'])
        if args['quiz_id']:
            query = query.filter_by(quiz_id=args['quiz_id'])
        final=query.all()
        return [s.to_json() for s in final]


    @auth_required('token')
    @roles_accepted('user', 'admin')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('quiz_id', type=int, required=True)
        parser.add_argument('user_id', type=int, required=True)
        parser.add_argument('total_questions', type=int, required=True)
        parser.add_argument('correct_answers', type=int, required=True)
        parser.add_argument('total_score', type=float, required=True)
        parser.add_argument('duration_taken', type=int, required=True)
        args = parser.parse_args()
        if not Quiz.query.get(args['quiz_id']):
            return {'message': 'Quiz not found'}, 404
        if not User.query.get(args['user_id']):
            return {'message': 'User not found'}, 404
        score = Score(**args)
        db.session.add(score)
        db.session.commit()
        return {'message':'Succesfully created score '}, 201

    @auth_required('token')
    @roles_required('admin')
    def delete(self, score_id):
        score = Score.query.get_or_404(score_id)
        db.session.delete(score)
        db.session.commit()
        return {'message': 'Deleted'}, 200

class QuizAttemptResource(Resource):
     
    @auth_required('token')
    @roles_required('user')
    def get(self, quiz_id):
        quiz = Quiz.query.get_or_404(quiz_id)
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        if not questions:
            return {'message': 'No questions found'}, 404

        return {
            'id': quiz.id,
            'title': quiz.title,
            'time_duration': quiz.time_duration,
            'total_questions': len(questions),
            'questions': [
                {
                    'id': q.id,
                    'question_statement': q.question_statement,
                    'option1': q.option1,
                    'option2': q.option2,
                    'option3': q.option3,
                    'option4': q.option4
                } for q in questions
            ]
        }, 200

    @auth_required('token')
    @roles_required('user')
    def post(self, quiz_id):
        parser = reqparse.RequestParser()
        parser.add_argument('answers', type=dict, required=True, location='json')
        parser.add_argument('duration_taken', type=int, required=True)
        args = parser.parse_args()

        # current_user is available from flask_login or flask_security
        user_id = current_user.id
        quiz = Quiz.query.get_or_404(quiz_id)
        if Score.query.filter_by(user_id=user_id, quiz_id=quiz_id).first():
            return {'message': 'Already attempted'}, 400

        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        correct_answers = total_score = 0

        for q in questions:
            selected = args['answers'].get(str(q.id))
            if selected:
                attempted = Attempted(user_id=user_id, ques_id=q.id, user_given_answer=selected)
                db.session.add(attempted)
                if int(selected) == q.correct_option:
                    correct_answers += 1
                    total_score += 1

        score = Score(
            user_id=user_id,
            quiz_id=quiz_id,
            total_questions=len(questions),
            correct_answers=correct_answers,
            total_score=total_score,
            duration_taken=args['duration_taken']
        )
        db.session.add(score)
        db.session.commit()

        return {
            'message': 'Attempt recorded',
            'score': {
                'id': score.id,
                'quiz_title': quiz.title,
                'correct_answers': correct_answers,
                'total_questions': len(questions),
                'percentage': (correct_answers / len(questions)) * 100 if questions else 0
            }
        }, 201

class AdminSummaryResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    @cached.memoize(timeout=5)  # Cache for 5 seconds
    def get(self):
        return {
            'users': User.query.count(),
            'quizzes': Quiz.query.count(),
            'questions': Question.query.count(),
            'attempts': Score.query.count()
        }, 200


class UserSummaryResource(Resource):
    @auth_required('token')
    @roles_required('user')
    @cached.memoize(timeout=5)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=int, location='args', required=True, help="user_id is required")
        args = parser.parse_args()

        user_id = args['user_id']
        scores = Score.query.filter_by(user_id=user_id).all()

        total_quizzes = len(scores)
        correct = sum(s.correct_answers for s in scores)
        avg = round((sum((s.total_score / s.total_questions) * 100 for s in scores) / total_quizzes), 2) if total_quizzes else 0

        return {
            'attempted': total_quizzes,
            'correct': correct,
            'average': avg
        }




# Chapter Routes
api.add_resource(ChapterResource, '/api/chapters', '/api/chapters/<int:chapter_id>')

# Quiz Routes
api.add_resource(QuizResource, '/api/quizzes', '/api/quizzes/<int:quiz_id>')
api.add_resource(QuizAttemptResource, '/api/quizzes/<int:quiz_id>/attempt')

# Question Routes
api.add_resource(QuestionResource, '/api/questions', '/api/questions/<int:question_id>')

# Score Routes
api.add_resource(ScoreResource, '/api/scores', '/api/scores/<int:score_id>')

#Subject routes
api.add_resource(SubjectResource, '/api/subjects', '/api/subjects/<int:subject_id>')

#users routes
api.add_resource(UserResource, '/api/users', '/api/users/<int:user_id>')
api.add_resource(AdminSummaryResource, '/api/summary/admin')
api.add_resource(UserSummaryResource, '/api/summary/user')
