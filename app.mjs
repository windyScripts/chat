import fs from 'fs';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';

dotenv.config();

import { getSocketId, getUserSocket } from './controllers/socket-io.mjs';
import Downloads from './models/downloads.mjs';
import Group from './models/group.mjs';
import Message from './models/message.mjs';
import UserGroupRelation from './models/user-group.mjs';
import User from './models/user.mjs';
import groupRoutes from './routes/group.mjs';
import authRoutes from './routes/user.mjs';
import sequelize from './util/database.mjs';

User.hasMany(Message);
Message.belongsTo(User);

User.hasMany(Downloads);

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
  app.use(compression());
} else if (environment === 'development') {
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

// Serve static assets (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Explicit routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login', 'index.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password', 'index.html'));
});

// ✅ Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve React / HTML routes for client-side routing
app.use((req, res, next) => {
  // If the request matches a static file, let express.static handle it
  if (req.path.includes('.') || req.path.endsWith('.css') || req.path.endsWith('.js')) {
    return next(); // pass to express.static or next middleware
  }

  // Otherwise, serve the main HTML page
  res.sendFile(path.join(__dirname, 'public', 'signup', 'index.html'), err => {
    if (err) {
      // Fallback error handling
      console.error('Error sending index.html:', err);
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
    }
  });
});
const httpServer = createServer(app);

const start = async () => {
  await sequelize.sync();
  console.log('Database connected. :)');
  httpServer.listen(process.env.PORT || 3000);
};

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
    try {
      socket.leave(room);
      cb(`Left ${room}`);
    } catch (err) {
      console.log(err);
    }
  });
  socket.on('send-message', (room = null, cb) => {
    if (room) {
      socket.to(room).emit('refresh');
    }
    cb(`send-message triggered for, ${room}`);
  });
  socket.on('add user', userId => {
    try {
      const userSocketId = getUserSocket(userId);
      if (userSocketId) {
        socket.to(userSocketId).emit('refresh');
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on('remove user', userId => {
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

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

