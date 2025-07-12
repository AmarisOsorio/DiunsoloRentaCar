import express from "express";
import upload from "../middlewares/uploadClienteImages.js";

const router = express.Router();

let clientsController;
try {
  const controllerModule = await import("../controllers/clientsController.js");
  clientsController = controllerModule.default;
} catch (error) {
  clientsController = {
    getClients: (req, res) => res.status(500).json({ message: "getClients function not available" }),
    getClientById: (req, res) => res.status(500).json({ message: "getClientById function not available" }),
    updateClient: (req, res) => res.status(500).json({ message: "updateClient function not available" }),
    deleteClient: (req, res) => res.status(500).json({ message: "deleteClient function not available" }),
    checkEmailExists: (req, res) => res.status(500).json({ message: "checkEmailExists function not available" })
  };
}

router.route("/")
  .get(clientsController.getClients);

router.route("/:id")
  .get(clientsController.getClientById)
  .put(
    upload.fields([
      { name: "licenciaFrente", maxCount: 1 },
      { name: "licenciaReverso", maxCount: 1 },
      { name: "pasaporteFrente", maxCount: 1 },
      { name: "pasaporteReverso", maxCount: 1 },
    ]),
    clientsController.updateClient
  )
  .delete(clientsController.deleteClient);

router.post("/check-email", clientsController.checkEmailExists);

export default router;