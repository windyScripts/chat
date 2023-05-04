import Sequelize from 'sequelize';

import sequelize from '../util/database.mjs';

const userGroup = sequelize.define('userGroup', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    notNull: true,
    primaryKey: true,
  },
});

export default userGroup;
