import express from "express";
import contratosController from "../controllers/contratosController.js";

const router = express.Router();

// Rutas principales
router.route("/")
    .get(contratosController.getContratos)
    .post(contratosController.insertContrato);

// Rutas con parámetro ID
router.route("/:id")
    .get(contratosController.getContratoById)
    .put(contratosController.updateContrato)
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
    .put(contratosController.updateHojaEstado);

router.route("/:id/datos-arrendamiento")
    .put(contratosController.updateDatosArrendamiento);

export default router;