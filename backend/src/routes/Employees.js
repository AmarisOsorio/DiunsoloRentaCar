import express from "express";
import EmployeesController from "../controllers/EmployeesController.js";
import multer from "multer";

const router = express.Router();

// Configuración de multer para archivos temporales (como en Brands)
const upload = multer({ 
  dest: 'public/Employees',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Rutas principales
router.route("/")
  .get(EmployeesController.getEmployees)
  .post(upload.single('photo'), EmployeesController.insertEmployees);

// Rutas con ID
router.route("/:id")
  .get(EmployeesController.getEmployeeById)
  .put(upload.single('photo'), EmployeesController.updateEmployees)
  .delete(EmployeesController.deleteEmployees);

export default router;