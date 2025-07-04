//Imports
import express from "express";
import vehiclesController from "../controllers/vehiclesController.js";
import multer from "multer";

//Router
const router = express.Router();
const upload = multer({ dest: "uploads/" });

//Routes
router.route("/")
  .get(vehiclesController.getVehicles) //Get all vehicles [Catalogo]
  .post(upload.array("imagenes"), vehiclesController.addVehicle); 

router.route("/home")
  .get(vehiclesController.getHomeVehicles); //Get featured vehicles [Home]

router.route("/:id")
  .get(vehiclesController.getVehicleById)
  .put(vehiclesController.updateVehicle)
  .delete(vehiclesController.deleteVehicle);

//Export
export default router;