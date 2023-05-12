import PasswordRequests from '../models/password-requests-model.mjs';

export const findOnePasswordRequest = async function(params) {
  try {
    return new Promise((resolve, reject) => {
      PasswordRequests.findOne(params).then(data => resolve(data)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const newPasswordRequest = async function(params) {
  try {
    return new Promise((resolve, reject) => {
      PasswordRequests.create(params).then(data => resolve(data)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const updatePasswordRequest = async function(password, params, transaction = null) {
  try {
    return new Promise((resolve, reject) => {
      password.update(params, { transaction }).then(data => resolve(data)).catch(err => reject(err));
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    return new Promise((resolve, reject) => reject(err));
  }
};
