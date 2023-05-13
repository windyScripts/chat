import User from '../models/user.mjs';

export const createUser = async params => {
  try {
    return new Promise((resolve, reject) => {
      User.create(params).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findOneUser = params => {
  try {
    return new Promise((resolve, reject) => {
      User.findOne(params).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const getUserGroups = user => {
  try {
    return new Promise((resolve, reject) => {
      user.getGroups().then(groups => {
        resolve(groups);
      }).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

/* export const updateUserSocketId = (user, socketId) => {
  try {
    return new Promise((resolve, reject) => {
      user.socketId = socketId;
      user.save().then(() => {
        resolve(socketId);
      }).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
}; */

export const updateUser = async (user, params, transaction = null) => {
  try {
    return new Promise((resolve, reject) => {
      user.update(params, { transaction }).then(() => {
        resolve(params);
      }).catch(err => reject(err));
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    return new Promise((resolve, reject) => reject(err));
  }
};

export const  getUserSocketId = userId => {
  try {
    return new Promise((resolve, reject) => {
      User.findOne({ where: { id: userId }}).then(response => {
        if (response !== null) {
          console.log(response, response.socketId, response.dataValues.socketId);
          resolve(response.socketId);
        } else {
          resolve(null);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    });
  } catch (err) {
    console.log(err);
    return new Promise((resolve, reject) => reject(err));
  }
};

