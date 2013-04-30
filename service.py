#!/usr/bin/python
from flask import Flask
from crossdomain import *

from storage import *

app = Flask(__name__)

@app.route("/")
def hello():
    return "Graph Web Service! Try to use /read/<id> or /write<item>"

@app.route("/read")
@crossdomain(origin='*')
def read():
    storage = Storage()
    return storage.read()

@app.route("/read/<id>")
@crossdomain(origin='*')
def read_id(id):
    #read JSON from file
    print("Trying to read item with id: " + id)
    storage = Storage()
    item = storage.read(id)
    if item is None:
        print("Could not find item with id: " + id)
        return None;
    print("Retrieved Item is : " + item)
    return item;

@app.route("/write/<item>")
@crossdomain(origin='*')
def write(item):
    #write JSON back to file
    storage = Storage()
    written_item = storage.write(item)
    return storage.read(written_item.id)

if __name__ == "__main__":
    app.run()
    #app.run(host='0.0.0.0') #to listen to all public IPs.
