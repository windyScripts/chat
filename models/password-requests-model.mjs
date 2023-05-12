import Sequelize from 'sequelize';

import sequelize from '../util/database.mjs';

const PasswordRequest = sequelize.define('forgotpasswordrequest', {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  isActive: Sequelize.BOOLEAN,
});

export default PasswordRequest;
