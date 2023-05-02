import Message from '../models/message.mjs';

export const createMessage = params => {
  try {
    return new Promise((resolve, reject) => {
      Message.create(params).then(response => resolve(response)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findAllMessages = params => {
    try {
        return new Promise((resolve, reject) => {
          Message.findAll(params).then(response => resolve(response)).catch(err => reject(err));
        });
      } catch (err) {
        return new Promise((resolve, reject) => reject(err));
      }
}