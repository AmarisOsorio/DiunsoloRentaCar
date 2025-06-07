import express from 'express';
import sendWelcomeController from '../controllers/sendWelcomeController.js';

const router = express.Router();

router.post('/', sendWelcomeController);

export default router;
