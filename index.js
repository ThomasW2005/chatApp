localIP = '0.0.0.0'
localIPv6 = '0000::0000:0000:0000:0000'

const wsPort = 3001
const httpPort = 80
const mdnsPort = 5353

const express = require('express')
const fs = require('fs')
const app = express()
const io = require("socket.io")(wsPort, {
    cors: {
        origin: "*",
        methods: ['*'],
        allowedHeaders: ['*'],
    }
})
const mdns = require('multicast-dns')({
    reuseAddr: true,
    noInit: true,
    port: mdnsPort
})
const { instrument } = require("@socket.io/admin-ui");

instrument(io, {
    auth: false
});

fs.readFile('site/ip.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    localIP = data.split('\n')[0]
    localIPv6 = data.split('\n')[1]
    console.log(`host ip: ${localIP}`)
    console.log(`host ipv6: ${localIPv6}`)
})

mdns.on('query', query => {
    if (query.questions[0]?.name === 'htlchat.local') {
        if (query.questions[0].type === 'A') {
            mdns.respond([{ name: 'htlchat.local', type: 'A', data: localIP }])
        }
        if (query.questions[0].type === 'AAAA') {
            mdns.respond([{ name: 'htlchat.local', type: 'AAAA', data: localIPv6 }])
        }
        // console.log(query)
    }
})

io.on("connection", socket => {
    socket.on("message", msg => {
        socket.broadcast.emit("got-msg", socket.nickname, msg)
        console.log(`${socket.nickname} says: ${msg}`)
    })
    socket.on("set-name", nickname => {
        socket.nickname = nickname;
        console.log(`${nickname} connected`)
    })
    socket.on("broadcast-name", () => {
        socket.broadcast.emit("client-connected", socket.nickname)
    })
})

app.use(express.static(__dirname + '/site'))

app.listen(httpPort, () => {
    console.log(`html\t server listening on port ${httpPort} `)
})

mdns.on('ready', () => {
    console.log(`mdns\t server listening on port ${mdnsPort} `)
})

console.log(`ws\t server listening on port ${wsPort} `)