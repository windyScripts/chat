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
      UserGroupRelation.findOne({ where: { userId, groupId }}).then(Relation => {
        Relation.role = 'Admin';
        console.log(Relation)
        Relation.save()
        resolve(true)
      }).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(false));
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
      UserGroupRelation.findOne({ where: { userId, groupId }}).then(response => {
        response.role == 'Admin' ? resolve(true) : resolve(false)
    })
        .catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findOldestUserOrReturnNull = (group,userparams) => {
  try {
    return new Promise((resolve, reject) => {
      group.getUsers({
        order: [['createdAt', 'ASC']],
        limit: 1,
        ...userparams
      }).then(Result => {
        if(Result === null) resolve(null);
        else resolve(Result[0]);
      })
        .catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

