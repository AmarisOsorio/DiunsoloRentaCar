//Imports
import express from "express";
import vehiclesController from "../controllers/vehiclesController.js";
import multer from "multer";

//Router
const router = express.Router();
const upload = multer({ dest: "uploads/" });

//Routes
router.route("/")
  .get(vehiclesController.getVehicles)
  .post(vehiclesController.addVehicle); 

router.route("/:id")
  .get(vehiclesController.getVehicleById)
  .put(vehiclesController.updateVehicle)
  .delete(vehiclesController.deleteVehicle);

router.post("/vehiculos", upload.array("imagenes"), vehiclesController.addVehicle);

export default router;