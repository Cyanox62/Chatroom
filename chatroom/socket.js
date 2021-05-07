const ws = new WebSocket('ws://localhost:9898/');

// --- Network Handling ---

var clientID = -1;
var username = '';
var isVerified = false;

// Runs when the client successfully connects
ws.onopen = function() {
    console.log('Client connected!');
    document.getElementById("status").innerHTML = "Status: Connected";
};

// Runs when the client receives a message
ws.onmessage = function(e) {
  if (!isVerified) {
    clientID = e.data;
    console.log("Session verified! Received client ID: " + e.data);
    document.getElementById("clientid").innerHTML = "Client ID: " + clientID;
    isVerified = true;
    return;
  }

  var data = JSON.parse(e.data);

  if (data["type"] == "message") {
    messages.push(`<b>${data["username"]}:</b> ${data["content"]}`);
    reloadChatlog();
  } else if (data["type"] == "clientcount") {
    document.getElementById("clientcount").innerHTML = "Connected Chatters: " + data["value"];
  }
};

// Runs when the client disconnects
ws.onclose = function(e) {
  document.getElementById("status").innerHTML = "Status: Disconnected";
  document.getElementById("clientid").innerHTML = "Client ID: N/A";
}

function initUsername() {
  setUsername(document.getElementById("usernamebox").value);
}

function setUsername(user) {
  username = user;
  document.getElementById("usernamelabel").innerHTML = `Username set!`;
  document.getElementById("chatbox").disabled = false;
  document.getElementById("usernamebox").disabled = true;
  document.getElementById("usernamebutton").disabled = true;
}

function initMessage() {
  sendMessage(document.getElementById("messagebox").value);
}

// Sends a message object to the server
function sendMessage(message) {
  let obj = 
  {
    'type': 'message',
    'id': clientID,
    'username': username,
    'content': message
  };
  ws.send(JSON.stringify(obj));
}

// --- Chatbox ---

var messages = [];
var lastUserMessage = "";
var isFocused = false;

function setFocus(focus) {
  isFocused = focus;
}

// Adds the current text in the chatbox to the messages list and reloads the log
function newEntry() {
  if (document.getElementById("chatbox").value != "") {
    lastUserMessage = document.getElementById("chatbox").value;
    document.getElementById("chatbox").value = "";
    messages.push(lastUserMessage);
    reloadChatlog();
  }
}

// Loads the chatbox with the new message log
function reloadChatlog() {
  for (var i = 1; i < 8; i++) {
    if (messages[messages.length - i]) {
      let message = messages[messages.length - 1];
      //if (message.includes("http://") || message.includes("https://")) {
      //  message = `<a href="${message}">${message}</a>`;
      //}
      document.getElementById("chatlog" + i).innerHTML = message; 
    }
  }
}

// Gets rid of the palce holder text when the chatbox is focused
function placeHolder() {
  document.getElementById("chatbox").placeholder = "";
  setFocus(true);
}

// Assign events
document.onkeypress = keyPress;
document.onkeydown = keyDown;

// Used for enter key
function keyPress(e) {
  if (e.keyCode == 13) {
    sendMessage(document.getElementById("chatbox").value);
    newEntry();
  }
}

// Used for arroy keys
function keyDown(e) {
  if (e.keyCode == 38) {
    document.getElementById("chatbox").value = lastUserMessage;
  }
}