from flask import Flask, render_template, redirect
from backend.models import db, User, Role

from flask_security import SQLAlchemyUserDatastore,Security,hash_password
from backend.config import DevelopmentConfig
from flask_caching import Cache
# app = None
from werkzeug.security import check_password_hash,generate_password_hash
from backend.celery.celery_factory import celery_init_app
import flask_excel as excel

from backend.celery.celery_factory import celery_init_app


def create_app():

    app = Flask(__name__)
    
    # Load development config
    app.config.from_object(DevelopmentConfig)  # Change this path!
    cache=Cache(app)
    app.cache = cache
    # Initialize extensions
    
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    
    app.security = Security(app, datastore)
    app.app_context().push()
    # app.debug = app.config["DEBUG"]
    from backend.resources import api
    api.init_app(app)
    # Register API routes
    # register_api_routes(app)

    return app


app = create_app()

with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name="admin", description="Administrator")
    app.security.datastore.find_or_create_role(name="user", description="General user")
    db.session.commit()

    if not app.security.datastore.find_user(email="user@admin.com"):
        app.security.datastore.create_user(
            email="user@admin.com",
            username="admin01",
            password=generate_password_hash("1234"),
            roles=["admin"]
        )

    if not app.security.datastore.find_user(email="user@user.com"):
        app.security.datastore.create_user(
            email="user@user.com",
            username="admin01",
            password=generate_password_hash("1234"),
            roles=["user"]
        )
    
    db.session.commit()
    

celery_app=celery_init_app(app)

# @app.get('/')
# def index():
#     return render_template('index.html')
from backend.routes import *
import backend.celery.celery_schedule
excel.init_excel(app)



if __name__ == "__main__":
    app.run()