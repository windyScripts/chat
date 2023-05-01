import { Router } from 'express';
const router = Router();
import {addUser, login} from '../controllers/user.mjs'

router.post('/new',addUser);

router.post('/login',login)

export default router;