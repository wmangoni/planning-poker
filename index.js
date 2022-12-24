const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server, Socket } = require("socket.io");
const io = new Server(server);
const crypto = require('crypto');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

global_history = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.engine.generateId = (req) => {
  return crypto.randomUUID(); // must be unique across all Socket.IO servers
}

io.engine.on("connection_error", (err) => {
  console.log(err.req);      // the request object
  console.log(err.code);     // the error code, for example 1
  console.log(err.message);  // the error message, for example "Session ID unknown"
  console.log(err.context);  // some additional error context
});

io.on('connection', async (socket) => {
  socket.data.cards = []
  console.log('user: ' + socket.id + ' - connected');
  console.log(socket.id);
  //console.log(socket.handshake);
  console.log(socket.rooms);

  //Evento para pegar o nome
  socket.on('get name', (msg) => {

    console.log('name', msg);
    socket.data.name = msg;

    //socket.to(socket.id).emit('get name', global_history);

    io.emit('get name', global_history);
  });

  //Evento para pegar o card
  socket.on('card', (msg) => {
    console.log('msg', msg);
    console.log('client', socket.data);
    socket.data.cards.push(msg);
    global_history.push(socket.data.name + " - " + msg);
    io.emit('card', socket.data.name + " - " + msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});