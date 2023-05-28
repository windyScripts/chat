import jwt from 'jsonwebtoken';

import { findOneUser } from '../services/user.mjs';

export const authorization = async(req, res, next) => {
  if (req.header('Authorization') === undefined) {
    return res.status(400).json({ message: 'Bad Request' });
  }
  try {
    const token = req.header('Authorization');
    const id = Number(jwt.verify(token, process.env.JWT_SIGN).userId);
    const user = await findOneUser({where:{id}});
    if (user === null) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
};
