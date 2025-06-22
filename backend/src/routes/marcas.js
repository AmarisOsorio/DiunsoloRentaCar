import express from "express";
import multer from "multer";
import MarcasController from "../controllers/MarcasController.js";

const router = express.Router();

// Configuración de multer para subir archivos temporalmente
const upload = multer({ dest: 'uploads/' });

// Rutas principales
router.route("/")
    .get(MarcasController.getAllMarcas)
    .post(upload.single('logo'), MarcasController.createMarcas);

// Rutas con parámetro ID
router.route("/:id")
    .put(upload.single('logo'), MarcasController.updateMarcas)
    .delete(MarcasController.deleteMarcas);

export default router;