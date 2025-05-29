import express from "express";
import clientsController from "../controllers/clientsController.js";
const router = express.Router();

router.route("/")
  .get(clientsController.getClients)
  .post(clientsController.insertClient);

router.route("/:id")
  .get(clientsController.getClientById)
  .put(clientsController.updateClient)
  .delete(clientsController.deleteClient);

export default router;
