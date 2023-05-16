import Message from '../models/message.mjs';

export const createMessage = async (params, transaction = null) => {
  return  Message.create(params, { transaction });
};

export const findGroupMessages = (params, group) => {
  return  group.getMessages(params);
};
