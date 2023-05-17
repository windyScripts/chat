
import fs from 'fs';

import fd from 'formidable';
import { Op } from 'sequelize';

import User from '../models/user.mjs';
import { createDownload } from '../services/downloads.mjs';
import { createGroup, findGroupUsers, findGroup, deleteGroup } from '../services/group.mjs';
import { findGroupMessages, createMessage } from '../services/message.mjs';
import { uploadtoS3 } from '../services/S3-services.mjs';
import { removeUserFromGroup, addUserToGroup, findOneUGR, updateUGR } from '../services/user-group-relation.mjs';
import { getUserGroups, findOneUser } from '../services/user.mjs';
import { makeUserAdmin, checkAdmin } from '../util/authUtils.mjs';
import sequelize from '../util/database.mjs';

const updateGroupLastMessageTime = async (params, transaction = null) => {
  try {
    const relation = await findOneUGR(params, { transaction });

    if (relation) {
      await updateUGR(relation, { lastMessageTime: new Date() });
    }
  } catch (err) {
    console.log(err);
  }
};

export const addGroup = async (req, res) => {
  let group = null;
  let name;
  let userId;
  try {
    const createdBy = req.user.id;
    userId = req.user.id;
    name = req.body.name;
    group = await createGroup({ createdBy, userId, name });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
  const t = await sequelize.transaction();
  try {
    await addUserToGroup(req.user, group, { role: 'Admin' }, t);
    await makeUserAdmin(userId, group.id, t);
    await t.commit();
    return res.status(200).json({ message: `group ${name} created successfully.` });
  } catch (err) {
    const p1 = t.rollback();
    const p2 = deleteGroup(group);
    await Promise.all([p1, p2]);
    console.log(err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getCurrentUserGroups = async (req, res) => {
  try {
    let groups = await getUserGroups(req.user, {
      through: {
        attributes: ['lastMessageTime'],
        order: [['lastMessageTime', 'DESC']],
      },
    });
    groups = groups.map(e => {
      return { id: e.id, name: e.name, lastMessageTime: e.UserGroupRelation.lastMessageTime };
    }).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    return res.status(200).json(groups);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Something went wrong' });
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
    return res.status(500).json({ message: 'Something went wrong' });
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
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const addMessage = async (req, res) => {
  const  t = await sequelize.transaction();

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
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const p1 = getUserGroups(req.user);
    const p2 = findGroup({ where: { id: req.params.groupId }});
    const [userGroups, group] = await Promise.all([p1, p2]);
    if (userGroups.every(e => e.id != group.id)) {
      return res.status(401).json({ message: 'unauthorized request' });
    }
    const messages = await findGroupMessages(
      { where: { id: { [Op.gt]: req.query.loadFromId }},
        include: [{
          model: User,
          attributes: ['name'],
        }],
        attributes: ['message','userId',[sequelize.where(sequelize.col('userId'), '=', req.user.id), 'currentUser']], }, group);
    return res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Something went wrong' });
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

export const addUserToGroupAsAdmin = async (req, res) => {
  try {
    const email = req.params.email;
    const groupId = req.params.groupId;
    const p1 = findOneUser({ where: { email }});
    const p2 = findGroup({ where: { id: groupId }});
    const p3 = checkAdmin(req.user.id, groupId);
    const [user, group, adminStatus] = await Promise.all([p1, p2, p3]);
    if (user && group && adminStatus) {
      await addUserToGroup(user, group);
      res.status(200).json({ userId: user.id });
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
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const createAndSendFileLink = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const form = new fd.IncomingForm();
    form.parse(req, function(err, fields, files) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      const [firstKey] = Object.keys(files);
      const userId = req.user.id;
      const timeStamp = new Date();
      const extensionPattern = /\.([^.]+)$/;
      const extension = files[firstKey].originalFilename.match(extensionPattern)[1];
      const fileName = `${userId}/${timeStamp.getTime()}.${extension}`;
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: fs.createReadStream(files[firstKey].filepath),
        ACL: 'public-read',
      };
      uploadtoS3(params).then(fileUrl => {
        const groupId = req.params.groupId;
        const message = fileUrl;
        const userId = req.user.id;
        const p1 = createMessage({ userId, message, groupId }, t);
        const p2 = updateGroupLastMessageTime({ where: { groupId, userId }}, t);
        const p3 = createDownload({ url: fileUrl }, t);
        Promise.all([p1, p2, p3]).then(() => {
          t.commit().then(() => {
            res.status(200).json({ fileUrl, success: false, message: err });
          });
        });
      });
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({ fileUrl: '', success: false, message: err });
  }
};
