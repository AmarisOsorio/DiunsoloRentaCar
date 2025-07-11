import express from "express";

import ReservasController from "../controllers/reservasController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Endpoint para obtener reservas del usuario autenticado (debe ir ANTES de /:id)
router.get("/mis-reservas", authenticateToken, ReservasController.getUserReservations);

// Rutas CRUD principales
router.route("/")
  .get(ReservasController.getReservas)
  .post(ReservasController.insertReservas);

router.route("/:id")
  .put(ReservasController.updateReservas)
  .delete(ReservasController.deleteReservas);

export default router;