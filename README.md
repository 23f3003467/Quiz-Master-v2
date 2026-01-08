#Quiz Master app

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)

## Introduction
This project is a role-based quiz platform where admins can create quizzes and users can attempt 
them.

## Features
- Admin and User login via Flask-Security 
- Role-based dashboard (admin sees all, user sees personal data) 
- Real-time dashboard using Vue 
- Export quiz data and performance as CSV 
- Celery Beat scheduled task for monthly user score report 
- Dynamic charts using Chart.js

## Technologies Used
- **Backend:** Flask, SQLAlchemy, Redis, Celery
- **Frontend:** HTML, CSS, Bootstrap, VueJS
- **Database:** SQLite
- **Libraries:** JWT for security, ChartJS for data visualization

## Installation
The whole app should be setted-up in ubuntu ,I have seen many people running flask on windows and rest things on ubuntu so follow all instructions on ubuntu.
1. Clone the repository:
   - git clone https://github.com/23f3003467/Quiz-Master-v2.git
   - cd Quiz-Master-v2
2. Create a virtual environment:
   - python -m venv env
   - source env/bin/activate
4. Install the required packages:
   - pip install -r requirements.txt
5. Run the application
   - flask run
6. Install Redis:
   - https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/
7. Run Redis:
   - sudo service redis-server start
8. Run Celery worker in another window:
   - celery -A app.celery worker --loglevel=info
9. Run Celery beat in another window:
   - celery -A app.celery beat --loglevel=info

## Usage
 - video presentation link: https://drive.google.com/file/d/1xykpnIys23bJJdLUa_W9upXhvo4V_UzU/view?usp=sharing 
