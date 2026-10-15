from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
app.config["SECRET_KEY"] = "distributed-chat-secret"

CORS(app)

socketio = SocketIO(
    app,
    cors_allowed_origins="*"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

messages = []


@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")


@socketio.on("send_message")
def handle_message(data):

    username = data.get("username", "").strip()
    message = data.get("message", "").strip()

    if not username or not message:
        return

    new_message = {
        "username": username,
        "message": message
    }

    messages.append(new_message)

    emit("new_message", new_message, broadcast=True)


@socketio.on("typing")
def handle_typing(data):

    username = data.get("username", "").strip()

    if username:
        emit(
            "user_typing",
            {"username": username},
            broadcast=True,
            include_self=False
        )


@socketio.on("stop_typing")
def handle_stop_typing(data):

    username = data.get("username", "").strip()

    if username:
        emit(
            "user_stop_typing",
            {"username": username},
            broadcast=True,
            include_self=False
        )


@socketio.on("request_history")
def send_history():

    emit("chat_history", messages)


@socketio.on("clear_chat")
def clear_chat():

    messages.clear()

    emit("chat_cleared", broadcast=True)


if __name__ == "__main__":

    print("")
    print("====================================")
    print("   DISTRIBUTED CHAT SERVER")
    print("====================================")
    print("Server running on port 5000")
    print("====================================")
    print("")

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True
    )