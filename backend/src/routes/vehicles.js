//Imports
import express from "express";
import vehiclesController from "../controllers/vehiclesController.js";

//Router
const router = express.Router();

//Routes
router.route("/")
  .get(vehiclesController.getVehicles)
  .post(vehiclesController.addVehicle); 

router.route("/:id")
  .get(vehiclesController.getVehicleById)
  .put(vehiclesController.updateVehicle)
  .delete(vehiclesController.deleteVehicle);