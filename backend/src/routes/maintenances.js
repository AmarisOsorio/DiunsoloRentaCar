import express from "express";
import maintenanceController from "../controllers/maintenancesController.js";

const router = express.Router();

// Rutas principales para mantenimientos
router.route("/")
    .get(maintenanceController.getMaintenances)        // GET /maintenances - Obtener todos los mantenimientos
    .post(maintenanceController.createMaintenance);    // POST /maintenances - Crear nuevo mantenimiento

// Rutas por ID (deben ir al final para evitar conflictos con rutas específicas)
router.route("/:id")
    .get(maintenanceController.getMaintenanceById)     // GET /maintenances/:id - Obtener mantenimiento por ID
    .put(maintenanceController.updateMaintenance)      // PUT /maintenances/:id - Actualizar mantenimiento
    .delete(maintenanceController.deleteMaintenance);  // DELETE /maintenances/:id - Eliminar mantenimiento

export default router;


