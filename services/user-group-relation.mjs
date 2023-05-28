import UserGroupRelation from '../models/user-group.mjs';

export const addUserToGroup = async (user, group, params, transaction = null) => {
  return user.addGroup(group, params, { transaction });
};

export const findOneUGR = params => {
  return UserGroupRelation.findOne(params);
};

export const updateOneUGR = (relation, params) => {
  return relation.update(params);
};

export const removeUserFromGroup = (user, group) => {
  return user.removeGroup(group);
};

export const updateAllUGR = (valueParams,searchParams=null,transaction=null) => {
  return UserGroupRelation.update(valueParams,searchParams,{transaction});
};
