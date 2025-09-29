import express from 'express';
import contractsController from '../controllers/contractsController.js';

const router = express.Router();

// Rutas de contratos
router.get('/', contractsController.getAllContracts);                    // GET /api/contracts
router.get('/debug-reservations', contractsController.debugReservations); // GET /api/contracts/debug-reservations
router.get('/:id', contractsController.getContractById);                 // GET /api/contracts/:id
router.post('/', contractsController.insertContract);                    // POST /api/contracts
router.put('/:id', contractsController.updateContract);                  // PUT /api/contracts/:id
router.delete('/:id', contractsController.deleteContracts);              // DELETE /api/contracts/:id
router.post('/:id/pdf', contractsController.generateContractPdf);        // POST /api/contracts/:id/pdf

export default router;