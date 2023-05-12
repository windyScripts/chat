import { Router } from 'express';

import { signUpUser, login, removeSocket, createPasswordRequest, getPasswordUpdateForm, setPassword } from '../controllers/user.mjs';
import { authorization } from '../middleware/auth.mjs';

const router = Router();

router.post('/new', signUpUser);
router.post('/login', login);
router.delete('/removeSocketId', authorization, removeSocket);

router.post('/forgotpassword', createPasswordRequest);
router.get('/resetpassword/:reqId', getPasswordUpdateForm);
router.put('/updatepassword/:resetpasswordid', setPassword);

export default router;
