import express from "express";
import multer from "multer";
import clientsController from "../controllers/clientsController.js";

const router = express.Router();

//Configure Save Directory
const upload = multer({dest: "public/Clients"})

router.route("/")
  .get(clientsController.getClients);

router.route("/:id")
  .get(clientsController.getClientById)
  .put(upload.fields([
    { name: "licenseFront", maxCount: 1 },
    { name: "licenseBack", maxCount: 1 },
    { name: "passportFront", maxCount: 1 },
    { name: "passportBack", maxCount: 1 }
    ]),clientsController.updateClient)
  .delete(clientsController.deleteClient);

export default router;