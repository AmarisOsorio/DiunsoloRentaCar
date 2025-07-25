import express from 'express';
import {sendWelcome} from '../controllers/sendWelcomeController.js';

const router = express.Router();

router.post('/', sendWelcome);

export default router;
