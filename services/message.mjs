import Message from '../models/message.mjs';

export const createMessage = async (params, transaction = null) => {
  try {
    return new Promise((resolve, reject) => {
      Message.create(params, { transaction }).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findGroupMessages = (params, group) => {
  if (group) {
    try {
      return new Promise((resolve, reject) => {
        group.getMessages(params).then(response => resolve(response)).catch(err => reject(err));
      });
    } catch (err) {
      return new Promise((resolve, reject) => reject(err));
    }
  } else {
    throw new Error('No group selected');
  }
};
