import express from "express";
import multer from "multer";
import contratosController from "../controllers/contratosController.js";

const router = express.Router();

// Configuración de multer para subir archivos temporalmente
const upload = multer({ dest: 'uploads/' });

// Configuración de multer que acepta cualquier tipo de campo
const uploadAny = multer({ dest: 'uploads/' }).any();

// Rutas principales
router.route("/")
    .get(contratosController.getContratos)
    .post(uploadAny, contratosController.insertContrato); // Acepta cualquier campo

// Rutas con parámetro ID
router.route("/:id")
    .get(contratosController.getContratoById)
    .put(uploadAny, contratosController.updateContrato) // Acepta cualquier campo
    .delete(contratosController.deleteContrato);

// Rutas específicas para operaciones especiales
router.route("/estado/:estado")
    .get(contratosController.getContratosByEstado);

router.route("/cliente/:clientID")
    .get(contratosController.getContratosByClient);

router.route("/:id/finalizar")
    .put(contratosController.finalizarContrato);

router.route("/:id/anular")
    .put(contratosController.anularContrato);

router.route("/:id/hoja-estado")
    .put(uploadAny, contratosController.updateHojaEstado); // Acepta cualquier campo

router.route("/:id/datos-arrendamiento")
    .put(uploadAny, contratosController.updateDatosArrendamiento); // Acepta cualquier campo

export default router;