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
    console.log(userId);
    const socketId = await getUserSocketId(userId);
    return socketId;
  } catch (err) {
    console.log(err);
  }
};
