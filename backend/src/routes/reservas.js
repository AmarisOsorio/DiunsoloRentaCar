import express from "express";
import ReservasController from "../controllers/reservasController.js";

const router = express.Router();

router.route("/").get(ReservasController.getReservas)
.post(ReservasController.insertReservas)

router.route("/:id")
.put(ReservasController.updateReservas)
.delete(ReservasController.deleteReservas);

export default router;