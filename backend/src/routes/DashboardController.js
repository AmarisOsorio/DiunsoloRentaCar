// backend/src/routes/dashboard.js
import express from "express";
import dashboardController from "../controllers/DashboardController.js";

const router = express.Router();

// Ruta para obtener actividades recientes
router.get("/activities", dashboardController.getRecentActivities);

// Ruta para obtener estadísticas del dashboard
router.get("/stats", dashboardController.getDashboardStats);

export default router;