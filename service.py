from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/read/<id>")
def read(id):
    #read JSON from file
    return "read id: " + id

@app.route("/write/<item>")
def write(item):
    #write JSON back to file
    return "write item: " + item

if __name__ == "__main__":
    app.run()
    #app.run(host='0.0.0.0') #to listen to all public IPs.