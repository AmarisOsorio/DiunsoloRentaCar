//Imports
import express from "express";
import vehiclesController from "../controllers/vehiclesController.js";
import multer from "multer";

//Router
const router = express.Router();

const upload = multer({ dest: "uploads/" });
// Configuración para múltiples campos de archivos
const uploadFields = upload.fields([
  { name: 'imagenes', maxCount: 10 },
  { name: 'imagenVista3_4', maxCount: 1 },
  { name: 'imagenLateral', maxCount: 1 }
]);

//Routes
router.route("/")
  .get(vehiclesController.getVehicles) //Get all vehicles [Catalogo]
  .post(uploadFields, vehiclesController.addVehicle); 

router.route("/home")
  .get(vehiclesController.getHomeVehicles); //Get featured vehicles [Home]

router.route("/:id")
  .get(vehiclesController.getVehicleById)
  .put(vehiclesController.updateVehicle)
  .delete(vehiclesController.deleteVehicle);

//Export
export default router;