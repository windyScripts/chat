import User from '../models/user.mjs';

export const createUser = params => {
  try {
    return new Promise((resolve, reject) => {
      console.log(params);
      User.create(params).then(user => resolve(user)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findOneUser = async function(params) {
  try {
    return new Promise((resolve, reject) => {
      User.findOne(params).then(user => resolve(user)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};
