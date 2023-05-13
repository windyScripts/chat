import { io } from './app.mjs';
import { getSocketId, getUserSocket } from './controllers/socket-io.mjs';

io.on('connection', socket => {
  const token = socket.handshake.headers.authorization;
  socket.id = getSocketId(token);
  socket.on('join-room', (room, cb) => {
    socket.join(room);
    cb(`Connected to ${room}`);
  });
  socket.on('leave-room', (room, cb) => {
    try {
      socket.leave(room);
      cb(`Left ${room}`);
    } catch (err) {
      console.log(err);
    }
  });
  socket.on('send-message', (message, room = null) => {
    if (room) {
      socket.to(room).emit('receive-message', message, room);
    }
  });
  socket.on('add user', (userId) => {
    try {
      const userSocketId = getUserSocket(userId);
      if (userSocketId) {
        socket.to(userSocketId).emit('refresh');
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on('remove user', (userId) => {
    try {
      const userSocketId = getUserSocket(userId);
      if (userSocketId) {
        socket.to(userSocketId).emit('refresh');
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on('admin user', userId => {
    try {
      const userSocketId = getUserSocket(userId);
      if (userSocketId) {
        socket.to(userSocketId).emit('refresh');
      }
    } catch (err) {
      console.log(err);
    }
  });
});
