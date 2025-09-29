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

// Middleware condicional para multer
const conditionalUpload = (req, res, next) => {
  console.log('🔍 Middleware conditionalUpload - Content-Type:', req.headers['content-type']);
  
  // Si es JSON, omitir multer
  if (req.headers['content-type']?.includes('application/json')) {
    console.log('📄 JSON detectado, omitiendo multer');
    return next();
  }
  
  // Si es FormData, usar multer
  console.log('📎 FormData detectado, usando multer');
  return uploadFields(req, res, next);
};

//Routes
router.route("/")
  .get(vehiclesController.getVehicles)
  .post(conditionalUpload, validateVehicleData, vehiclesController.addVehicle);

router.route("/home")
  .get(vehiclesController.getHomeVehicles); //Get featured vehicles [Home]

router.route("/test-connection")
  .get(vehiclesController.testConnection); // Test basic connection

router.route("/test-contract")
  .get(vehiclesController.testContract); // Test contract download

router.route("/test-pdf")
  .get(vehiclesController.testPdf); // Test PDF generation

router.route("/contract-download/:id")
  .get(vehiclesController.downloadLeaseContract);

router.route("/:id")
  .get(vehiclesController.getVehicleById)
  .put(uploadFields, validateVehicleData, vehiclesController.updateVehicle)
  .delete(vehiclesController.deleteVehicle);

//Export
export default router;