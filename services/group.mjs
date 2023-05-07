import Group from '../models/group.mjs';

export const createGroup = params => {
  try {
    return new Promise((resolve, reject) => {
      Group.create(params).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findGroup = params => {
  try {
    return new Promise((resolve, reject) => {
      Group.findOne(params).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findGroupUsers = group => {
    try {
      return new Promise((resolve, reject) => {
        group.getUsers().then(response => resolve(response)).catch(err => reject(err));
      });
    } catch (err) {
      return new Promise((resolve, reject) => reject(err));
    }
  };

 

  export const deleteGroup = group => {
    try {
      return new Promise((resolve, reject) => {
        group.destroy() .then(response => resolve(response)).catch(err => reject(err));
      });
    } catch (err) {
      return new Promise((resolve, reject) => reject(err));
    }
  };