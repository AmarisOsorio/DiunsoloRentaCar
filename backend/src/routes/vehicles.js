//Imports
import express from "express";
import vehiclesController from "../controllers/vehiclesController.js";
import multer from "multer";
import { validateVehicleData } from "../middlewares/vehicleValidation.js";

//Router
const router = express.Router();

// Usar memoryStorage para evitar guardar archivos localmente
// Los archivos se subirán directamente a Cloudinary desde memoria
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max por archivo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes"), false);
    }
  }
});

// Configuración para múltiples campos de archivos
const uploadFields = upload.fields([
  { name: 'galleryImages', maxCount: 10 },
  { name: 'mainViewImage', maxCount: 1 },
  { name: 'sideImage', maxCount: 1 }
]);

//Routes
router.route("/")
  .get(vehiclesController.getVehicles)
  .post(uploadFields, validateVehicleData, vehiclesController.addVehicle);

router.route("/home")
  .get(vehiclesController.getHomeVehicles); //Get featured vehicles [Home]

router.route("/:id")
  .get(vehiclesController.getVehicleById)
  .put(uploadFields, validateVehicleData, vehiclesController.updateVehicle)
  .delete(vehiclesController.deleteVehicle);
router.route("/:id/download-lease-contract")
  .get(vehiclesController.downloadLeaseContract);

//Export
export default router;