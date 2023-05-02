import { Router } from 'express';

import { addMessage } from '../controllers/message.mjs';
import { authorization } from '../middleware/auth.mjs';

const router = Router();
router.post('/message', authorization, addMessage);

export default router;
