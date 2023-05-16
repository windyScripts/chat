import User from '../models/user.mjs';

export const createUser = async params => {
  return User.create(params);
};

export const findOneUser = params => {
  return  User.findOne(params);
};

export const getUserGroups = (user, params) => {
  return user.getGroups(params);
};

export const updateUser = async (user, params, transaction = null) => {
  return  user.update(params, { transaction });
};

export const  getUserSocketId = userId => {
  return  User.findOne({ where: { id: userId }});
};

