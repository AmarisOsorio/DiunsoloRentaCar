import express from "express";


const router = express.Router();

let clientsController;
try {
  const controllerModule = await import("../controllers/clientsController.js");
  clientsController = controllerModule.default;
} catch (error) {
  console.error("Error importando clientsController:", error);
  clientsController = {
    getClients: (req, res) => res.status(500).json({ message: "getClients function not available" }),
    getClientById: (req, res) => res.status(500).json({ message: "getClientById function not available" }),
    updateClient: (req, res) => res.status(500).json({ message: "updateClient function not available" }),
    deleteClient: (req, res) => res.status(500).json({ message: "deleteClient function not available" }),
    checkEmailExists: (req, res) => res.status(500).json({ message: "checkEmailExists function not available" })
  };
}

// Log de las rutas disponibles
console.log('🛣️ Configurando rutas de clientes:');
console.log('  GET    /api/clients');
console.log('  GET    /api/clients/:id');
console.log('  PUT    /api/clients/:id');
console.log('  DELETE /api/clients/:id');
console.log('  POST   /api/clients/check-email');

// Middleware para logging
router.use((req, res, next) => {
  console.log(`📨 [Clients Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.route("/")
  .get(clientsController.getClients);

router.route("/nuevos-clientes-registrados")
  .get(clientsController.getNuevosClientesRegistrados);

router.route("/:id")
  .get(clientsController.getClientById)
  
  .delete(clientsController.deleteClient);

router.post("/check-email", clientsController.checkEmailExists);


export default router;