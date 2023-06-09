import Sequelize from 'sequelize';

import sequelize from '../util/database.mjs';

const group = sequelize.define('group', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  createdBy: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

export default group;
