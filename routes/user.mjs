import { Router } from 'express';

import { signUpUser, login } from '../controllers/user.mjs';

const router = Router();

router.post('/new', signUpUser);
router.post('/login', login);

export default router;
