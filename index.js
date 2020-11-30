const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);
const io = socketio(server);

//Run when client connects
io.on('connection', socket => {
    console.log("New Connection...");
});

app.listen(PORT,()=>{console.log('Server running on port ' + PORT)});