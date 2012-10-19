from flask import Flask, render_template, request, make_response
from pymongo import Connection
from bson.objectid import ObjectId
import json

import logging
logger = logging.getLogger('app')
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

app = Flask(__name__)
app.config.from_object(__name__)
conn = Connection()
coll = conn['canjs']['contacts']

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')
    
@app.route('/contacts', methods=['GET', 'POST'])
def create_read_contact():
    d = []
    if request.method == 'GET':
        d = [{'id': unicode(c['_id']), 'name': c['name'], 'address': c['address'], 'email': c['email'], 'phone': c['phone'],'category': c['category']} for c in coll.find()]
    if request.method == 'POST':
        req = request.form
        post = {}
        for k,v in req.items():
            post[k] = v
        c = coll.save(post)
        d = {'id': unicode(c)}
    resp = make_response(json.dumps(d))
    resp.headers['Content-Type'] = 'application/json'
    return resp

@app.route('/contact/<obj_id>', methods=['PUT', 'DELETE'])
def update_delete_contact(obj_id):
    d = {}
    if request.method == 'PUT':
        c = coll.find_one(spec_or_id=ObjectId(obj_id))
        req = request.form
        post = {}
        for k,v in req.items():
            c[k] = v
        update = coll.save(c)
        d = {'id': unicode(update)}
    if request.method == 'DELETE':
        c = coll.remove(spec_or_id=ObjectId(obj_id))
        d = 'OK'
    resp = make_response(json.dumps(d))
    resp.headers['Content-Type'] = 'application/json'
    return resp
        

@app.route('/categories', methods=['GET'])
def get_categories():
    d = [
      {
        'id': 1,
        'name': 'Family',
        'data': 'family'
      },
      {
        'id': 2,
        'name': 'Friends',
        'data': 'friends'
      },
      {
        'id': 3,
        'name': 'Co-workers',
        'data': 'co-workers'
      }
    ]
    resp = make_response(json.dumps(d))
    resp.headers['Content-Type'] = 'application/json'
    return resp

if __name__ == '__main__':
    app.run(port=9999, debug=True)
    

