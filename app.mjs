import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import sequelize from './util/database.mjs';

import authRoutes from './routes/user.mjs'
const app = express();
const environment = process.env.NODE_ENV



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),
  { flags: 'a' },
);

if (environment === 'production') {

    app.use(helmet());
  
    const compression = require('compression');
    app.use(compression());
  } else if (environment === 'development') {

    app.use(cors());
  }

app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth',authRoutes)

/* app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', req.url));
  }); */

async function start() {
    await sequelize.sync();
    console.log('Database connected. :)');
    app.listen(process.env.PORT || 3000);
  }

  start();