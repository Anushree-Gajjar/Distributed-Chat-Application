const socket = io();

const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const chatBox = document.getElementById("chatBox");
const typingIndicator = document.getElementById("typingIndicator");
const connectionText = document.getElementById("connectionText");

let typingTimer;


// ===============================
// CONNECTION
// ===============================

socket.on("connect", function () {

    connectionText.textContent = "Connected";

    socket.emit("request_history");

});


socket.on("disconnect", function () {

    connectionText.textContent = "Server Disconnected";

});


// ===============================
// CHAT HISTORY
// ===============================

socket.on("chat_history", function (messages) {

    chatBox.innerHTML = "";

    messages.forEach(function (item) {

        addMessage(item);

    });

    scrollChat();

});


// ===============================
// NEW MESSAGE
// ===============================

socket.on("new_message", function (item) {

    addMessage(item);

    scrollChat();

});


// ===============================
// ADD MESSAGE
// ===============================

function addMessage(item) {

    const currentUser =
        usernameInput.value.trim();


    const row =
        document.createElement("div");

    row.className = "message-row";


    if (item.username === currentUser) {

        row.classList.add("mine");

    }


    const message =
        document.createElement("div");

    message.className = "message";


    const name =
        document.createElement("div");

    name.className = "message-name";

    name.textContent = item.username;


    const text =
        document.createElement("div");

    text.className = "message-text";

    text.textContent = item.message;


    const time =
        document.createElement("div");

    time.className = "message-time";

    time.textContent =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    message.appendChild(name);

    message.appendChild(text);

    message.appendChild(time);

    row.appendChild(message);

    chatBox.appendChild(row);
}


// ===============================
// SEND MESSAGE
// ===============================

function sendMessage() {

    const username =
        usernameInput.value.trim();

    const message =
        messageInput.value.trim();


    if (username === "") {

        alert("Please enter your name.");

        usernameInput.focus();

        return;
    }


    if (message === "") {

        messageInput.focus();

        return;
    }


    socket.emit(
        "send_message",
        {
            username: username,
            message: message
        }
    );


    messageInput.value = "";

    stopTyping();

    messageInput.focus();
}


// ===============================
// TYPING
// ===============================

messageInput.addEventListener(
    "input",
    function () {

        const username =
            usernameInput.value.trim();


        if (username === "") {
            return;
        }


        socket.emit(
            "typing",
            {
                username: username
            }
        );


        clearTimeout(typingTimer);


        typingTimer =
            setTimeout(
                stopTyping,
                1000
            );

    }
);


function stopTyping() {

    const username =
        usernameInput.value.trim();


    if (username !== "") {

        socket.emit(
            "stop_typing",
            {
                username: username
            }
        );

    }
}


// ===============================
// USER TYPING
// ===============================

socket.on(
    "user_typing",
    function (data) {

        typingIndicator.textContent =
            "✍️ " +
            data.username +
            " is typing...";

    }
);


socket.on(
    "user_stop_typing",
    function () {

        typingIndicator.textContent = "";

    }
);


// ===============================
// CLEAR CHAT
// ===============================

function clearChat() {

    const confirmClear =
        confirm(
            "Are you sure you want to clear the chat?"
        );


    if (!confirmClear) {
        return;
    }


    socket.emit("clear_chat");

}


socket.on(
    "chat_cleared",
    function () {

        chatBox.innerHTML = "";

    }
);


// ===============================
// ENTER TO SEND
// ===============================

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ===============================
// SCROLL
// ===============================

function scrollChat() {

    chatBox.scrollTop =
        chatBox.scrollHeight;

}