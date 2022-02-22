localIP = '1.1.1.1'

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}

localIP = loadFile('ip.txt');

const socket = io(`ws://${localIP}:3000`);
localStorage.debug = 'socket.io-client:socket'
const mC = document.getElementById("message-container");
const input = document.getElementById("input");
const form = document.getElementById("form");

const nickname = prompt("Select name: ");
socket.emit("set-name", nickname);

form.addEventListener("submit", e => {
    e.preventDefault();
    const message = input.value
    if (message != "") {
        addElement(`You: ${message}`)
        socket.emit("message", message)
        input.value = ''
    }
})

socket.on("connect", () => {
    addElement(`You connected with nickname: ${nickname}`);
    socket.emit("broadcast-name");
});

socket.on("client-connected", (data) => {
    addElement(`New client '${data}' connected`);
});

socket.on("got-msg", (id, message) => {
    addElement(`${id}: ${message}`);
})

function addElement(data) {
    para = document.createElement("p");
    // para.id = "entry";
    para.innerHTML = data;
    mC.prepend(para);
}