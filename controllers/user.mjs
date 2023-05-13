import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { findGroup, deleteGroup } from '../services/group.mjs';
import { newPasswordRequest, findOnePasswordRequest, updatePasswordRequest } from '../services/passwords.mjs';
import { sendEmail } from '../services/Sib-services.mjs';
import { checkAdmin, removeUserFromGroup, findOldestUserOrReturnNull, makeUserAdmin, checkForGroupAdmin } from '../services/user-group-relation.mjs';
import { createUser, findOneUser, updateUser } from '../services/user.mjs';
import sequelize from '../util/database.mjs';

const generateAccessToken = (id, socketId) => {
  const iat = new Date;
  return jwt.sign({ userId: id, date: iat.getTime(), socketId }, process.env.JWT_SIGN);
};

const invalid = (...params) => {
  for (let i = 0; i < params.length; i++) {
    if (params[i].length < 1 || params[i] == undefined) return true;
  }
  return false;
};

const createNewSocketId = () => {
  return uuidv4();
};

export const signUpUser = async (req, res) => {
  const checkInvalid = invalid(req.body.userName, req.body.email, req.body.password);
  const existingUser = Boolean(await findOneUser({ where: { email: req.body.email }}));
  if (checkInvalid === true) {
    return res.status(401).json({ message: 'Invalid details.' });
  } else if (existingUser === true) {
    return res.status(401).json({ message: 'User already exists.' });
  }
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    const response = await createUser({ name: req.body.userName, email: req.body.email, password: hash, phone: req.body.phone });
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const login = async (req, res) => {
  try {
    const user = await findOneUser({ where: { email: req.body.email }});
    if (user !== null) {
      const bcryptValidationResult = await bcrypt.compare(req.body.password, user.password);
      if (bcryptValidationResult === true) {
        const socketId = createNewSocketId();
        const result = await updateUser(user, { socketId });
        if (result != null) {
          const socketId = result.socketId;
          res.status(200).json({ message: 'Login successful', token: generateAccessToken(user.id, socketId) });
        } else {
          res.status(400).json({ message: 'No parameter socketId for user' });
        }
      } else if (bcryptValidationResult === false) {
        res.status(401).json({ message: 'Invalid password' });
      } else {
        throw new Error('Something went wrong');
      }
    } else res.status(404).json({ message: 'No such user exists' });
  } catch (err) {
    console.log(err);
  }
};

export const leaveGroup = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = req.user;
    const groupId = req.params.groupId;

    const p1 = findGroup({ where: { id: groupId }});
    const p2 = checkAdmin(user.id, groupId);
    const p3 = checkForGroupAdmin({ where: { groupId, userId: { [Op.not]: user.id }}});
    const [group, adminStatus, alternateAdminExists] = await Promise.all([p1, p2, p3]);

    const p4 =  removeUserFromGroup(user, group, t);
    const p5 =  findOldestUserOrReturnNull(group, { where: { id: { [Op.not]: user.id }}});
    const [, oldestUser] = await Promise.all([p4, p5]);

    if (adminStatus === true && oldestUser !== null && alternateAdminExists === false) {
      await makeUserAdmin(oldestUser, groupId, t);
    }

    if (oldestUser === null) {
      await deleteGroup(group, t);
    }
    await t.commit();
    return res.status(200).json({ message: 'Success' });
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
};

export const removeSocket = async (req, res) => {
  try {
    await updateUser(req.user, { socketId: null });
    res.status(200).json({ message: 'success!' });
  } catch (err) {
    res.status(500).json({ message: 'something went wrong.' });
  }
};

export const createPasswordRequest = async (req, res) => {
  try {
    const sender = {
      name: process.env.EMAIL_SENDER_NAME,
      email: process.env.EMAIL_SENDER_ADDRESS,
    };

    const receiver = [{ email: req.body.email }];

    const reqId = uuidv4();
    const user = await findOneUser({ where: { email: req.body.email }});

    if (user) {
      await newPasswordRequest({ userId: user.id, isActive: true, id: reqId });

      const subject = 'Sending with SendGrid is Fun';
      const textContent = 'and easy to do anywhere, even with Node.js';
      const htmlContent = '<a href="{{params.passwordURL}}">Reset password</a>';
      const params = {
        passwordURL: 'http://localhost:3000/password/resetpassword/' + reqId,
      };

      await sendEmail(sender, receiver, subject, textContent, htmlContent, params);
      return res.status(200).json({ message: 'Email sent successfully' });
    } else throw new Error('That email does not exist in records');
  } catch (err) {
    console.log(err);
  }
};

export const getPasswordUpdateForm = async (req, res) => {
  try {
    const id = req.params.reqId;
    const passwordRequest = await findOnePasswordRequest({ where: { id }});
    if (passwordRequest && passwordRequest.isActive) {
      return res.status(200).send(`<html>
        <script>
            function formsubmitted(e){
                e.preventDefault();
                console.log('called')
            }
        </script>
        <form action="/password/updatepassword/${id}" method="get">
            <label for="newpassword">Enter New password</label>
            <input name="newpassword" type="password" required></input>
            <button>reset password</button>
        </form>
    </html>`,
      );
    } else return res.status(401).json({ message: 'Reset link expired/invalid' });
  } catch (err) {
    console.log(err);
  }
};

export const setPassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // store password, make isActive for request false.
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;
    const passwordRequest = await findOnePasswordRequest({ where: {
      id: resetpasswordid,
    }});
    const user = await findOneUser({ where: {
      id: passwordRequest.userId,
    }});
    if (user) {
      const hash = await bcrypt.hash(newpassword, 10);
      const p1 = updateUser(user, { password: hash }, t);
      const p2 = updatePasswordRequest(passwordRequest, { isActive: false }, t);
      await Promise.all([p1, p2]);
      await t.commit();
      return res.status(201).json({ message: 'Successfully updated new password' });
    } else return res.status(404).json({ error: 'No user Exists', success: false });
  } catch (err) {
    await t.rollback();
    return res.status(403).json({ error: err, success: false });
  }
};
