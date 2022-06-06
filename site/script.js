localIP = '0.0.0.0'
wsPort = '3001'
socket = {}
localIP = fetch(window.location.origin + '/api/ip').then(res => res.text()).then(text => {
    localIP = text;
    console.log(localIP);
    // socket = io(`ws://pi-thomas.local:${wsPort}`);
    socket = io(`ws://${localIP}:${wsPort}`);
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
});

localStorage.debug = 'socket.io-client:socket'
const mC = document.getElementById("message-container");
const input = document.getElementById("input");
const form = document.getElementById("form");
const nickname = prompt("Select name: ");

function addElement(data) {
    para = document.createElement("p");
    // para.id = "entry";
    para.innerHTML = data;
    mC.prepend(para);
}
