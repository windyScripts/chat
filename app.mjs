// app.mjs

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

// Controllers & Models
import { getSocketId, getUserSocket } from './controllers/socket-io.mjs';
import Downloads from './models/downloads.mjs';
import Group from './models/group.mjs';
import Message from './models/message.mjs';
import UserGroupRelation from './models/user-group.mjs';
import User from './models/user.mjs';

// Routes
import groupRoutes from './routes/group.mjs';
import authRoutes from './routes/user.mjs';

// DB
import sequelize from './util/database.mjs';

// Associations
User.hasMany(Message);
Message.belongsTo(User);

User.hasMany(Downloads);

Group.hasMany(Message);

User.belongsToMany(Group, { through: UserGroupRelation });
Group.belongsToMany(User, { through: UserGroupRelation });

const app = express();
const environment = process.env.NODE_ENV || 'development';

// __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' },
);

// Middleware
if (environment === 'production') {
  app.use(helmet());
  app.use(compression());
} else {
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }));
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  next();
});

app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/group', groupRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Explicit routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login', 'index.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password', 'index.html'));
});

app.get('/', (req, res) => {
  res.send('Service is running ✅');
});

// Catch-all (only for HTML routes)
app.get('*', (req, res) => {
  if (req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.includes('.')) {
    return res.status(404).end();
  }
  res.sendFile(path.join(__dirname, 'public', 'signup', 'index.html'));
});

// HTTP + Socket.IO server
const httpServer = createServer(app);
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
    cb?.(`Connected to ${room}`);
  });

  socket.on('leave-room', (room, cb) => {
    try {
      socket.leave(room);
      cb?.(`Left ${room}`);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('send-message', (room = null, cb) => {
    if (room) {
      socket.to(room).emit('refresh');
    }
    cb?.(`send-message triggered for ${room}`);
  });

  ['add user', 'remove user', 'admin user'].forEach(event => {
    socket.on(event, userId => {
      try {
        const userSocketId = getUserSocket(userId);
        if (userSocketId) {
          socket.to(userSocketId).emit('refresh');
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
});

// Start server
const start = async () => {
  try {
    await sequelize.sync();
    console.log('Database connected ✅');

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
