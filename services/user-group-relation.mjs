import UserGroupRelation from '../models/user-group.mjs';

export const addUserToGroup = async (user, group, params, transaction = null) => {
  try {
    return new Promise((resolve,reject) => {
      user.addGroup(group, params, { transaction }).then(response => resolve(response))
      .catch(err => {
        if(transaction){
          transaction.rollback().then(()=>reject(err));
        }
      })
    });
  } catch (err) {
    console.log(err);
    return new Promise((resolve, reject) => reject(err));
  }
};

export const makeUserAdmin = async (userId, groupId, transaction = null) => {
  try {
    return new Promise((resolve) => {
      UserGroupRelation.findOne({ where: { userId, groupId }}).then(Relation => {
        if (Relation) {
          Relation.update({ role: 'Admin' }, { transaction }).then(() => resolve(true))
          .catch(err =>{
            if(transaction){
              transaction.rollback().then(()=>reject(err));
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.log(err);
    if (transaction) {
      await transaction.rollback();
    }
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
        if (response === null) return false;
        response.role == 'Admin' ? resolve(true) : resolve(false);
      })
        .catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findOldestUserOrReturnNull = (group, userparams) => {
  try {
    return new Promise((resolve, reject) => {
      group.getUsers({
        ...userparams,
        order: [['createdAt', 'ASC']],
        limit: 1,
      }).then(result => {
        if (result.length === 0) resolve(null);
        else resolve(result[0]);
      })
        .catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const checkForGroupAdmin = params => {
  try {
    return new Promise((resolve, reject) => {
      UserGroupRelation.findOne(params).then(result => {
        if (result === null) resolve(false);
        else resolve(true);
      })
        .catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const updateGroupLastMessageTime = async (params, transaction = null) => {
  try {
    return new Promise(resolve => {
      UserGroupRelation.findOne(params, { transaction }).then(relation => {
        if (relation) {
          relation.update({ lastMessageTime: new Date() }).then(() => resolve());
        }
      });
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    return new Promise((resolve, reject) => reject(err));
  }
};
