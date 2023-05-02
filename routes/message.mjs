import { Router } from 'express';

import { addMessage, getMessages } from '../controllers/message.mjs';
import { authorization } from '../middleware/auth.mjs';

const router = Router();
router.post('/message', authorization, addMessage);
router.get('/messages', authorization, getMessages);

export default router;
