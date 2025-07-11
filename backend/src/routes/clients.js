
import express from "express";
import clientsController from "../controllers/clientsController.js";
// import upload from "../middlewares/uploadFiles.js"; // Eliminado: ya no se usa registro aquí
const router = express.Router();


// Registration route with file upload (up to 4 files)

// Use upload.any() to always parse all fields, even if no files are sent
// Ruta de registro eliminada: ahora se maneja en registerClientsController.js

router.route("/")
  .get(clientsController.getClients)

router.route("/nuevos-clientes-registrados")
  .get(clientsController.getNuevosClientesRegistrados);

router.route("/:id")
  .get(clientsController.getClientById)
  .put(clientsController.updateClient)
  .delete(clientsController.deleteClient);

router.post("/check-email", clientsController.checkEmailExists);





export default router;