from flask import Flask, render_template, request,jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from rq import Queue
from rq.job import Job
from worker import conn

import json
import requests
import os
import time

app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
db = SQLAlchemy(app)


q = Queue(connection=conn)


from models import *
job_key = "cdc2a892-8284-4e47-8fb3-ecaa3dae5956"
job = Job.fetch(job_key, connection=conn)

if job.is_finished:
    result = Result.query.filter_by(id=job.result).first()
    print "nothing wrong with query"
    result = result.result_all
  
    print result[0]
else:
    print "Not successful"


