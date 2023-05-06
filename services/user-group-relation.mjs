import UserGroupRelation from '../models/user-group.mjs';

export const addUserToGroup = (user, group, params) => {
  try {
    return new Promise((resolve, reject) => {
      user.addGroup(group, params).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const makeUserAdmin = (userId, groupId) => {
  try {
    return new Promise((resolve, reject) => {
      UserGroupRelation.find({ where: { userId, groupId }}).then(Relation => Relation.set('role', 'admin').then(response => resolve(response))).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const removeUserFromGroup = (user, group) => {
  try {
    return new Promise((resolve, reject) => {
      user.removeGroup(group).then(response => resolve(response))
        .catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const checkAdmin = (userId, groupId) => {
  try {
    return new Promise((resolve, reject) => {
      UserGroupRelation.find({ where: { userId, groupId }}).then(response => response.role == 'Admin' ? resolve(true) : resolve(false))
        .catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};
