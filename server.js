const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let roomNumber = 0;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/game.html');
});

io.on('connection', (socket) => {
    let room = `room-${roomNumber}`;
    let roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    if (roomSize >= 2) {
        roomNumber++;
        room = `room-${roomNumber}`;
    }

    socket.join(room);
    console.log(`Player connected to ${room}`);

    // Listen for grid selection and broadcast the number to the room
    socket.on('gridSelected', (number) => {
        socket.to(room).emit('opponentGridSelected', number);
    });

    socket.on('disconnect', () => {
        console.log('A player disconnected');
        io.to(room).emit('message', 'A player has left the game');
    });
});

const port = process.env.PORT || 8000; // Use the PORT environment variable or default to 8000

server.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});
