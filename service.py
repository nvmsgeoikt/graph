from flask import Flask
from storage import *
app = Flask(__name__)

storage = Storage()

@app.route("/")
def hello():
    return "Graph Web Service! Try to use /read/<id> or /write<item>"

@app.route("/read")
def read():
    return storage.read()

@app.route("/read/<id>")
def read_id(id):
    #read JSON from file
    return storage.read(id)

@app.route("/write/<item>")
def write(item):
    #write JSON back to file
    written_item = store.write(item)
    return store.read(written_item.id)

if __name__ == "__main__":
    app.run()
    #app.run(host='0.0.0.0') #to listen to all public IPs.