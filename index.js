const wsPort = 3000
const httpPort = 80
const mdnsPort = 5353
localIP = '1.1.1.1'
const { instrument } = require("@socket.io/admin-ui")
const fs = require('fs')
const io = require("socket.io")(wsPort, {
    cors: {
        origin: "*",
        methods: ['*'],
        allowedHeaders: ['*'],
    }
});
const mdns = require('multicast-dns')({
    reuseAddr: true, // in case other mdns service is running
    // loopback: true,  // receive our own mdns messages
    noInit: true,     // do not initialize on creation
    port: mdnsPort
})

const express = require('express')
const app = express()

fs.readFile('site/ip.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(`host ip: ${data}`)
    localIP = data
})

mdns.on('query', function (query) {
    if (query.questions[0] && query.questions[0].name === 'htlchat.local') {
        mdns.respond([{ name: 'htlchat.local', type: 'A', data: localIP }])
    }
})

io.on("connection", socket => {
    socket.on("message", msg => {
        socket.broadcast.emit("got-msg", socket.nickname, msg);
    })
    socket.on("set-name", nickname => {
        socket.nickname = nickname;
    })
    socket.on("broadcast-name", () => {
        socket.broadcast.emit("client-connected", socket.nickname);
    })
});

app.use(express.static(__dirname + '/site'));

instrument(io, {
    auth: false
});

app.listen(httpPort, () => {
    console.log(`html\t server listening on port ${httpPort}`);
})

mdns.on('ready', () => {
    console.log(`mdns\t server listening on port ${mdnsPort}`);
})

console.log(`ws\t server listening on port ${wsPort}`);
