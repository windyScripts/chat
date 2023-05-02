import User from '../models/user.mjs';

export const createUser = params => {
  try {
    return new Promise((resolve, reject) => {
      console.log(params);
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
