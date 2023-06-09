import { Router } from 'express';

import { addGroup, getCurrentUserGroups, getOtherUsersofGroup, getMessages, addMessage, verifyAndRemoveUserFromGroup, findAndMakeUserAdmin, addUserToGroupAsAdmin, getUserAdminStatus, createAndSendFileLink } from '../controllers/group.mjs';
import { leaveGroup } from '../controllers/user.mjs';
import { authorization } from '../middleware/auth.mjs';

const router = Router();

router.post('/new', authorization, addGroup);
router.get('/:groupId/userAdminStatus', authorization, getUserAdminStatus);
router.get('/groups', authorization, getCurrentUserGroups);
router.get('/:groupId/messages', authorization, getMessages);
router.post('/message', authorization, addMessage);
router.delete('/:groupId/:userId/delete', authorization, verifyAndRemoveUserFromGroup);
router.patch('/:groupId/:email/add', authorization, addUserToGroupAsAdmin);
router.patch('/:groupId/:userId/admin', authorization, findAndMakeUserAdmin);
router.delete('/:groupId/leavegroup', authorization, leaveGroup);
router.get('/:groupId/otherUsers', authorization, getOtherUsersofGroup);
router.post('/:groupId/upload', authorization, createAndSendFileLink);

export default router;

