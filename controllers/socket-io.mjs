import jwt  from 'jsonwebtoken';

import { getUserSocketId } from '../services/user.mjs';

export const getSocketId = token => {
  try {
    const socketId = jwt.verify(token, process.env.JWT_SIGN).socketId;
    return socketId;
  } catch (err) {
    console.log(err);
  }
};

export const getUserSocket = async userId => {
  try {
    return await getUserSocketId(userId);
  } catch (err) {
    console.log(err);
  }
};
