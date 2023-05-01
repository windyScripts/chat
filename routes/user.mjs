import { Router } from 'express';
const router = Router();
import {addUser} from '../controllers/user.mjs'

router.post('/new',addUser);

export default router;