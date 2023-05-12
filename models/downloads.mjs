import Sequelize from 'sequelize';

import sequelize from '../util/database.mjs';

const Download = sequelize.define('download', {
  url: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

export default Download;
