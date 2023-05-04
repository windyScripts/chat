import { Op } from 'sequelize';

import { createGroup, findGroup } from '../services/group.mjs';
import { findGroupMessages } from '../services/message.mjs';
import { getUserGroups } from '../services/user.mjs';

export const addGroup = async (req, res) => {
  //t = await sequelize.transaction();
  try {
    const createdBy = req.user.id;
    const userId = req.user.id;
    const name = req.body.name;
    const group = await createGroup({ createdBy, userId, name });
    const response = await req.user.addGroup(group);
    // need to add user to group.
    return res.status(200).json({ message: `group ${name} created successfully.`, response });
  } catch (err) {
    console.log(err);
  }
};

export const getCurrentUserGroups = async (req, res) => {
  try {
    //const groupsContainer = await req.user.getUserGroup
    const groups = await getUserGroups(req.user);
    return res.status(200).json(groups);
  } catch (err) {
    console.log(err);
  }
};

export const getMessages = async (req, res) => {
  try {
    const userGroupsPromise = getUserGroups(req.user);
    const groupPromise = findGroup({ id: req.query.groupId });
    const result = await Promise.all([userGroupsPromise, groupPromise]);
    const group = result[1];
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
