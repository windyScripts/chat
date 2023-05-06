import { Router } from 'express';

const router = Router();
import { signUpUser, login } from '../controllers/user.mjs';

router.post('/new', signUpUser);
router.post('/login', login);

export default router;
