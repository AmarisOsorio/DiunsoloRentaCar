import express from "express";

import reservationsController from "../controllers/reservationsController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Endpoint para obtener reservas del usuario autenticado (debe ir ANTES de /:id)
router.get("/my-reservations", authenticateToken, reservationsController.getUserReservations);

// Rutas CRUD principales
router.route("/")
  .get(reservationsController.getReservations)
  .post(reservationsController.createReservation);

router.route("/:id")
  .get(reservationsController.getReservationById)
  .put(reservationsController.updateReservation)
  .delete(reservationsController.deleteReservation);

// Rutas para obtener reservas por vehículo y estado
router.route("/vehicle/:vehicleId")
  .get(reservationsController.getReservationsByVehicleId);

router.route("/status/:status")
  .get(reservationsController.getReservationsByStatus);

// Rutas para estadísticas
router.route("/most-rented-brands")
  .get(reservationsController.getMostRentedVehiclesByBrand);

router.route("/most-rented-models")
  .get(reservationsController.getMostRentedVehiclesByModel);

export default router;