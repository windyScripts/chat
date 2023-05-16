import Group from '../models/group.mjs';

export const createGroup = async (params, transaction = null) => {
  return Group.create(params, { transaction });
};

export const findGroup = params => {
  return  Group.findOne(params);
};

export const findGroupUsers = (group, params = null) => {
  return  group.getUsers(params);
};

export const deleteGroup = async (group, transaction = null) => {
  return group.destroy({ transaction });
};

