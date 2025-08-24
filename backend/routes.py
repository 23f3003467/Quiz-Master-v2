
from flask import request, jsonify,render_template, current_app as app, send_file
from flask_security import auth_required,roles_accepted, roles_required, current_user,hash_password,login_user
from .models import db, User, Subject, Chapter, Quiz, Question, Score, Attempted
from datetime import datetime, date
from werkzeug.security import check_password_hash,generate_password_hash
from .utils import roles_list
from datetime import datetime
from backend.celery.tasks import add, create_csv,quiz_notifier
from celery.result import AsyncResult


cached=app.cache


@app.route('/', methods = ['GET'])
def home():
    return render_template('index.html')

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id' : task.id}


@auth_required('token')
@app.get('/quiz_notifier')
def getTask():
    task=quiz_notifier.delay()
    return {'task_id' : task.id}, 200


@auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)

    if result.ready():
        print(f"Task {id} is ready, result: {result.result}")
        return send_file(f'backend/celery/admin-downloads/{result.result}'), 200
    else:
        return {'message' : 'task not ready'}, 405

@auth_required('token') 
@app.get('/create-csv')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id}, 200

@app.route('/api', methods=['GET'])
@cached.cached(timeout=5, query_string=True)
def index():
    return jsonify({
        "message": str(datetime.now()),
        "status": "success",
    })


@app.route('/api/home')
@auth_required('token')
@roles_accepted('user', 'admin')#and
# @roles_accepted(['user', 'admin']) #OR
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "roles": roles_list(user.roles)
    })



@app.route('/api/admin')
@auth_required('token')  #authentication
@roles_required('admin')   #rbac
def admindashboard():
    return jsonify({
        'message':'Admin successful'
    })

@app.route('/api/user')
@auth_required('token')
@roles_required('user')
def userdashboard():
    user=current_user
    return jsonify({
        'message':'user successful'
    })



@app.route('/api/login',methods=['POST'])
def login():
    body=request.get_json()
    email=body['email']
    password=body['password']

    if not email:
        return jsonify({
            "message":"Email is required!"
        }), 400
    
    user=app.security.datastore.find_user(email=email)

    if user:
        if check_password_hash(user.password,password):
            
            login_user(user)
            return jsonify({
                "id":user.id,
                "username":user.username,
                "auth-token":user.get_auth_token(),
                "roles": roles_list(current_user.roles) 
            })
        else:
            return jsonify({
                "message":"incorrect password"
            }),400
    else:
        return jsonify({
            "message":"user not found"
        }), 404


@app.route('/api/register',methods=['POST'])
def register():
    credentials=request.get_json()
    if not app.security.datastore.find_user(email=credentials["email"]):
        app.security.datastore.create_user(
            email=credentials["email"],
            username=credentials["username"],
            password=generate_password_hash(credentials["password"]),
            roles=["user"]
        )
        db.session.commit()
        return jsonify({
            "message":"User created successfully"
        }), 201
    
    return jsonify({
            "message":"User already exist"
        }), 400



@app.route('/admin/delete_user/<int:user_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_user(user_id):
    user = app.security.datastore.find_user(id=user_id)
    if not user:
        return {'message': 'User not found'}, 404

    app.security.datastore.delete_user(user)
    db.session.commit()
    return {'message': 'User deleted'}, 200









