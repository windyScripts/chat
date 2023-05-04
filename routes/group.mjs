import { Router } from 'express';

import { addGroup, getCurrentUserGroups } from '../controllers/group.mjs';
import { authorization } from '../middleware/auth.mjs';

const router = Router();

router.post('/new', authorization, addGroup);
router.get('/groups', authorization, getCurrentUserGroups);
router.get('/messages', authorization);

export default router;
