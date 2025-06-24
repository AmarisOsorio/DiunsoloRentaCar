import express from 'express';
import { sendContactEmail } from '../controllers/contactController.js';
const router = express.Router();

// Ruta para recibir el formulario de contacto
router.post('/contacto', sendContactEmail);

export default router;