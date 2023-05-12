import fs from 'fs';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';

dotenv.config();

import { getSocketId, getUserSocket } from './controllers/socket-io.mjs';
import Group from './models/group.mjs';
import Message from './models/message.mjs';
import UserGroupRelation from './models/user-group.mjs';
import User from './models/user.mjs';
import groupRoutes from './routes/group.mjs';
import authRoutes from './routes/user.mjs';
import sequelize from './util/database.mjs';

User.hasMany(Message);

Group.hasMany(Message);

User.belongsToMany(Group, { through: UserGroupRelation });
Group.belongsToMany(User, { through: UserGroupRelation });

const app = express();
const environment = process.env.NODE_ENV;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),
  { flags: 'a' },
);

if (environment === 'production') {
  app.use(helmet());
  const compression = require('compression');
  app.use(compression());
} else if (environment === 'development') {
/*   app.use(cors); */
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }));
}

// allows authorization header from front-end
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  next();
});

app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/group', groupRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.url));
});

const httpServer = createServer(app);

async function start() {
  await sequelize.sync();
  console.log('Database connected. :)');
  httpServer.listen(process.env.PORT || 3000);
}

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    allowedHeaders: ['Authorization'],
  },
});

io.on('connection', socket => {
  const token = socket.handshake.headers.authorization;
  socket.id = getSocketId(token);
  socket.on('join-room', (room, cb) => {
    socket.join(room);
    cb(`Connected to ${room}`);
  });
  socket.on('leave-room', (room, cb) => {
    socket.leave(room);
    cb(`Left ${room}`);
  });
  socket.on('send-message', (message, room = null) => {
    if (room) {
      socket.to(room).emit('receive-message', message, room);
    }
  });
  socket.on('add user', (userId, room) => {
    const userSocketId = getUserSocket(userId);
    if (userSocketId) {
      userSocketId.join(room);
      socket.to(userSocketId).emit('refresh');
    }
  });
  socket.on('remove user', (userId, room) => {
    const userSocketId = getUserSocket(userId);
    if (userSocketId) {
      userSocketId.leave(room);
      socket.to(userSocketId).emit('refresh');
    }
  });
  socket.on('admin user', userId => {
    const userSocketId = getUserSocket(userId);
    if (userSocketId) {
      socket.to(userSocketId).emit('refresh');
    }
  });
});

start();
