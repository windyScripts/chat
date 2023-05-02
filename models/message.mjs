import Sequelize from 'sequelize';

import sequelize from '../util/database.mjs';

const Message = sequelize.define('message', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export default Message;
