import dotenv from 'dotenv';
import Sequelize from 'sequelize';

dotenv.config();

const name = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const sequelize = new Sequelize(name, user, password, {
  dialect: 'mysql',
  host: process.env.DB_HOST,
});

export default sequelize;
