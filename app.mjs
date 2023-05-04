import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

import Group from './models/group.mjs';
import Message from './models/message.mjs';
import UserGroup from './models/user-group.mjs';
import User from './models/user.mjs';
import groupRoutes from './routes/group.mjs';
import messageRoutes from './routes/message.mjs';
import authRoutes from './routes/user.mjs';
import sequelize from './util/database.mjs';

User.hasMany(Message);

Group.hasMany(Message);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

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
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
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
app.use('/', messageRoutes);
app.use('/group', groupRoutes);

/* app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', req.url));
  }); */

async function start() {
  await sequelize.sync();
  console.log('Database connected. :)');
  app.listen(process.env.PORT || 3000);
}

start();
