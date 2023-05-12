
import { Op } from 'sequelize';

import { createGroup, findGroupUsers, findGroup } from '../services/group.mjs';
import { findGroupMessages, createMessage } from '../services/message.mjs';
import { removeUserFromGroup, addUserToGroup, checkAdmin, makeUserAdmin, updateGroupLastMessageTime } from '../services/user-group-relation.mjs';
import { getUserGroups, findOneUser } from '../services/user.mjs';
import sequelize from '../util/database.mjs';

export const addGroup = async (req, res) => {
  try {
    const createdBy = req.user.id;
    const userId = req.user.id;
    const name = req.body.name;
    const group = await createGroup({ createdBy, userId, name });
    const response = await addUserToGroup(req.user, group, { role: 'Admin' });
    await makeUserAdmin(userId, group.id);
    return res.status(200).json({ message: `group ${name} created successfully.`, response });
  } catch (err) {
    console.log(err);
  }
};

export const getCurrentUserGroups = async (req, res) => {
  try {
    const groups = await getUserGroups(req.user);
    return res.status(200).json(groups);
  } catch (err) {
    console.log(err);
  }
};

export const getAllUsersofGroup = async (req, res) => {
  try {
    console.log(req.params);
    const groupId = req.params.groupId;
    const group = await findGroup({ where: { id: groupId }});
    const users = await findGroupUsers(group);
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
  }
};

export const getOtherUsersofGroup = async (req, res) => {
  try {
    console.log(req.params);
    const groupId = req.params.groupId;
    const group = await findGroup({ where: { id: groupId }});
    const users = await findGroupUsers(group, {
      where: {
        id: {
          [Op.notIn]: [req.user.id],
        },
      },
    });
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
  }
};

export const addMessage = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const groupId = req.body.groupId;
    const message = req.body.message;
    const p1 = createMessage({ userId, message, groupId }, t);
    const p2 = updateGroupLastMessageTime({ where: { groupId, userId }}, t);
    await Promise.all([p1, p2]);
    await t.commit();
    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
};

export const getMessages = async (req, res) => {
  try {
    const userGroupsPromise = getUserGroups(req.user);
    const groupPromise = findGroup({ where: { id: req.params.groupId }});
    const result = await Promise.all([userGroupsPromise, groupPromise]);
    const group = result[1];
    console.log(req.params.groupId, group);
    if (result[0].every(e => e.id != group.id)) {
      return res.status(401).json({ message: 'unauthorized request' });
    }

    const messages =  await findGroupMessages({ where: { id: { [Op.gt]: req.query.loadFromId }}}, group);
    const messagesWithUser = messages.map(record => {
      if (record.userId === req.user.id) {
        return { ...record, user: true };
      } else {
        return record;
      }
    });
    return res.status(200).json({ messagesWithUser, id: req.user.id });
  } catch (err) {
    console.log(err);
  }
};

export const verifyAndRemoveUserFromGroup = async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const p1 = findOneUser({ where: { id: userId }});
    const p2 = findGroup({ where: { id: groupId }});
    const p3 = checkAdmin(req.user.id, groupId);
    const [user, group, adminStatus] = await Promise.all([p1, p2, p3]);
    if (user && group && adminStatus) {
      const response = await removeUserFromGroup(user, group);
      res.status(200).json(response);
    } else throw new Error('Invalid user or group');
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserandGroupthenAdd = async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const p1 = findOneUser({ where: { id: userId }});
    const p2 = findGroup({ where: { id: groupId }});
    const p3 = checkAdmin(req.user.id, groupId);
    const [user, group, adminStatus] = await Promise.all([p1, p2, p3]);
    if (user && group && adminStatus) {
      const response = await addUserToGroup(user, group);
      res.status(200).json(response);
    } else throw new Error('Invalid user or group');
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const findAndMakeUserAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const response = await makeUserAdmin(userId, groupId);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserAdminStatus = async (req, res) => {
  try {
    const adminStatus = await checkAdmin(req.user.id, req.params.groupId);
    return res.status(200).json({ adminStatus });
  } catch (err) {
    console.log(err);
  }
};
