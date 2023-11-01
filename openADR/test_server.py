from flask import Flask, request
app = Flask(__name__)

@app.route('/hello', methods=['POST', "GET"])
def hello_there():
    data = request.form.to_dict()
    print(data)
    return f"hello there"


if __name__ == '__main__':
    app.run()