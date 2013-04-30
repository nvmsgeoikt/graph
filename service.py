from flask import Flask
from storage import *
app = Flask(__name__)

storage = Storage()

@app.route("/")
def hello():
    return "Graph Web Service! Try to use /read/<id> or /write<item>"

@app.route("/read/<id>")
def read(id):
    print("Trying to read item with id: " + id)
    item = storage.read(id)
    if item is None:
        print("Could not find item with id: " + id)
        return None;
    print("Retrieved Item is : " + item)
    return item;

@app.route("/write/<item>")
def write(item):
    #write JSON back to file
    written_item = store.write(item)
    return store.read(written_item.id)

if __name__ == "__main__":
    app.run()
    #app.run(host='0.0.0.0') #to listen to all public IPs.