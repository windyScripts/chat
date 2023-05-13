import Group from '../models/group.mjs';

export const createGroup = async (params, transaction = null) => {
  try {
    return new Promise((resolve, reject) => {
      Group.create(params, { transaction }).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    console.log(err);
    if (transaction != null) {
      await transaction.rollback();
    }
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

export const findGroupUsers = (group, params = null) => {
  try {
    return new Promise((resolve, reject) => {
      group.getUsers(params).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const deleteGroup = async (group, transaction = null) => {
  try {
    return new Promise((resolve, reject) => {
      group.destroy({ transaction }) .then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    return new Promise((resolve, reject) => reject(err));
  }
};

