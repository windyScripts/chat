import { Router } from 'express';
import { addGroup, getCurrentUserGroups, getAllUsersofGroup, getMessages, addMessage, verifyAndRemoveUserFromGroup, findAndMakeUserAdmin, getUserandGroupthenAdd } from '../controllers/group.mjs';
import { authorization } from '../middleware/auth.mjs';
import { leaveGroup } from '../controllers/user.mjs';

const router = Router();

router.post('/new', authorization, addGroup);
router.get('/groups', authorization, getCurrentUserGroups);
router.get('/:groupId/users', authorization,getAllUsersofGroup )
router.get('/:groupId/messages', authorization, getMessages);
router.post('/message', authorization, addMessage);
router.delete('/:groupId/:userId/delete', authorization, verifyAndRemoveUserFromGroup)
router.patch('/:groupId/:userId/add',authorization,getUserandGroupthenAdd)
router.patch('/:groupId/:userId/admin',authorization,findAndMakeUserAdmin)
router.delete('/:groupId/leavegroup', authorization, leaveGroup)


export default router;

