from flask import Flask
from storage import *
app = Flask(__name__)

storage = Storage()

@app.route("/")
def hello():
    return "Graph Web Service! Try to use /read/<id> or /write<item>"

@app.route("/read/<id>")
def read(id):
    #read JSON from file
    item = storage.read(id)
    return store.write(json.dumps(item.__dict__))

@app.route("/write/<item>")
def write(item):
    #write JSON back to file
    return "write item: " + item

if __name__ == "__main__":
    app.run()
    #app.run(host='0.0.0.0') #to listen to all public IPs.