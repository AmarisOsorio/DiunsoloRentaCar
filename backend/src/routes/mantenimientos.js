import express from "express";
import mantenimientosController from "../controllers/mantenimientosController.js";
const router = express.Router();

router.route("/")
    .get(mantenimientosController.getMantenimientos)
    .post(mantenimientosController.insertMantenimientos);

router.route("/:id")
    .put(mantenimientosController.updateMantenimientos)
    .delete(mantenimientosController.deleteMantenimientos);

export default router;