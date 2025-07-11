import express from 'express';
import ContratosController from '../controllers/contratosController.js';
import { verifyAuth } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas (pueden requerir autenticación según tus necesidades)
router.get('/', ContratosController.getContratos);
router.get('/:id', ContratosController.getContratoById);
router.get('/reserva/:reservationId', ContratosController.getContratoByReservation);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyAuth, ContratosController.createContrato);
router.put('/:id', verifyAuth, ContratosController.updateContrato);
router.delete('/:id', verifyAuth, ContratosController.deleteContrato);

// Rutas para cambiar estado del contrato
router.patch('/:id/finalizar', verifyAuth, ContratosController.finalizarContrato);
router.patch('/:id/anular', verifyAuth, ContratosController.anularContrato);

// Ruta para regenerar PDF
router.post('/:id/regenerar-pdf', verifyAuth, ContratosController.regenerarPDF);

export default router;