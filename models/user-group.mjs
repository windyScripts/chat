import Sequelize from 'sequelize';

import sequelize from '../util/database.mjs';

const UserGroupRelation = sequelize.define('UserGroupRelation', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'User',
  },
  lastMessageTime: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

export default UserGroupRelation;
