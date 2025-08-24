from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_security import RoleMixin, UserMixin
db = SQLAlchemy()


class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class User(db.Model,UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    qualification = db.Column(db.String(100), nullable=True)
    dob = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                            backref=db.backref('user', lazy='dynamic'))
    scores = db.relationship('Score', backref='user', cascade="all, delete")
    attempted=db.relationship('Attempted', cascade="all, delete")

    def is_admin(self):
        return self.role == 'admin'
    
    def to_json(self):
        return {
            'id': self.id,
            'email': self.email,
            'fullname': self.username,
            'qualification': self.qualification,
            'dob': self.dob.strftime('%Y-%m-%d') if self.dob else None,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'scores': [score.to_json() for score in self.scores]
        }


class Subject(db.Model):
    __tablename__ = 'subject'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    chapters = db.relationship('Chapter', backref='subject', cascade="all, delete")

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'chapters': [chapter.to_json() for chapter in self.chapters]
        }


class Chapter(db.Model):
    __tablename__ = 'chapter'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    quizzes = db.relationship('Quiz', backref='chapter', cascade="all, delete")

    def to_json(self):
        total_questions = sum(len(quiz.questions) for quiz in self.quizzes)
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'question_count': total_questions,
            'subject': {
                'id': self.subject.id,
                'name': self.subject.name
            } if self.subject else None,
            'quizzes': [quiz.to_json() for quiz in self.quizzes]
        }



class Quiz(db.Model):
    __tablename__ = 'quiz'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date_of_quiz = db.Column(db.Date, nullable=False)
    time_duration = db.Column(db.String(5), nullable=False)  # Format: "HH:MM"
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    questions = db.relationship('Question', backref='quiz', cascade="all, delete")
    scores = db.relationship('Score', backref='quiz', cascade="all, delete")

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'date_of_quiz': self.date_of_quiz.strftime('%Y-%m-%d') if self.date_of_quiz else None,
            'time_duration': self.time_duration,
            'remarks': self.remarks,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'chapter': {
                'id': self.chapter.id,
                'name': self.chapter.name
            } if self.chapter else None,
            'questions': [question.to_json() for question in self.questions],
            'scores': [score.to_json() for score in self.scores]
        }


class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.Text, nullable=False)
    option2 = db.Column(db.Text, nullable=False)
    option3 = db.Column(db.Text, nullable=False)
    option4 = db.Column(db.Text, nullable=False)
    correct_option = db.Column(db.Integer, nullable=False)  # 1-4 representing which option is correct
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    attempted=db.relationship('Attempted')
    def to_json(self):
        return {
            'id': self.id,
            'question_statement': self.question_statement,
            'option1': self.option1,
            'option2': self.option2,
            'option3': self.option3,
            'option4': self.option4,
            'correct_option': self.correct_option,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'quiz': {
                'id': self.quiz.id,
                'title': self.quiz.title
            } if self.quiz else None
        }


class Score(db.Model):
    __tablename__ = 'score'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    total_score = db.Column(db.Float, nullable=False)
    duration_taken = db.Column(db.Integer, nullable=False)  # Time taken in seconds
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def to_json(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'total_questions': self.total_questions,
            'correct_answers': self.correct_answers,
            'total_score': self.total_score,
            'duration_taken': self.duration_taken,
            'percentage': self.percentage,
            'quiz': {
                'id': self.quiz.id,
                'title': self.quiz.title
            } if self.quiz else None,
            'user': {
                'id': self.user.id,
                'email': self.user.email,
                'fullname': self.user.username
            } if self.user else None
        }
    
    @property
    def percentage(self):
        return (self.correct_answers / self.total_questions) * 100 if self.total_questions > 0 else 0


class Attempted(db.Model):
    __tablename__="attempted"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ques_id=db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    user_given_answer= db.Column(db.Integer, nullable=False)
    

    @property
    def is_correct(self):
        return True if self.ques_id.correct_option == self.user_given_answer else False



    