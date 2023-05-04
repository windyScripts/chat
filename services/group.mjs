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

/* export const findAllGroups = (params) => {
    try {
        return new Promise((resolve, reject) => {
          Group.findAll(params).then(response => resolve(response)).catch(err => reject(err));
        });
      } catch (err) {
        return new Promise((resolve, reject) => reject(err));
      }
} */
