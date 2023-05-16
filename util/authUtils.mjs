import { findOneUGR, updateUGR } from '../services/user-group-relation.mjs';

export const checkAdmin = async (userId, groupId) => {
  try {
    const response = await findOneUGR({ where: { userId, groupId }});

    if (response === null) return false;
    return    response.role == 'Admin' ? true : false;
  } catch (err) {
    console.log(err);
  }
};

export  const makeUserAdmin = async (userId, groupId, transaction = null) => {
  try {
    const relation = await findOneUGR({ where: { userId, groupId }});
    if (relation) {
      return updateUGR(relation, { role: 'Admin' }, { transaction });
    } else {
      throw new Error('User group relation not found');
    }
  } catch (err) {
    console.log(err);
    if (transaction) {
      await transaction.rollback();
    }
  }
};

/* export  const checkForGroupAdmin = async params => {
  try {
    const result = await findOneUGR(params);
    if (result === null) return false;
    else return true;
  } catch (err) {
    console.log(err);
  }
}; */
