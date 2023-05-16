import PasswordRequests from '../models/password-requests-model.mjs';

export const findOnePasswordRequest = async function(params) {
  return  PasswordRequests.findOne(params);
};

export const newPasswordRequest = async function(params) {
  return  PasswordRequests.create(params);
};

export const updatePasswordRequest = async function(password, params, transaction = null) {
  return password.update(params, { transaction });
};
