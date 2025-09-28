import express from 'express';
import contractsController from '../controllers/contractsController.js';

const router = express.Router();

// Obtener todos los contratos
router.route('/')
  .get(contractsController.getAllContracts)
  .post(contractsController.insertContract);

// Operaciones por ID
router.route('/:id')
  .delete(contractsController.deleteContracts);

// Generar PDF (usa POST en vez de GET)
router.post('/:id/pdf', contractsController.generateContractPdf);

export default router;
