const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/game", (req, res) => {
    res.sendFile(__dirname + "/game.html");
});

let roomNumber = 1;
const rooms = {};

io.on("connection", (socket) => {
    let room = `room-${roomNumber}`;
    let roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    if (roomSize >= 2) {
        roomNumber++;
        room = `room-${roomNumber}`;
    }

    socket.join(room);
    console.log(`Player connected to ${room}`);
    roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    if (roomSize === 2) {
        io.to(room).emit("roomFilled");
    } else {
        io.to(room).emit("message", "Waiting for another player to join");
    }

    socket.on("roomMemberJoin", (name) => {
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(name);
        console.log(rooms[room]);

        if (rooms[room].length === 2) {
            io.to(room).emit('roomMemberList', rooms[room]);
        }
    });

    socket.on("gridSelected", (number) => {
        socket.to(room).emit("opponentGridSelected", number);
    });

    socket.on('winner', (winner) => {
        io.to(room).emit('message', winner[0] + ' ' + winner[1]);
    });

    socket.on("disconnect", () => {
        console.log("A player disconnected");
        io.to(room).emit("message", "Opponent has left the game");
    
        const roomSockets = io.sockets.adapter.rooms.get(room);
        if (roomSockets) {
            roomSockets.forEach((socketId) => {
                const clientSocket = io.sockets.sockets.get(socketId);
                if (clientSocket) {
                    clientSocket.disconnect(true);
                }
            });
            // Close the room
            io.sockets.adapter.rooms.delete(room);
        }
    });
    
});


const port = process.env.PORT || 8000; // Use the PORT environment variable or default to 8000

server.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});