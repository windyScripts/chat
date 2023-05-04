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

export const getUserGroups = async user => {
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
