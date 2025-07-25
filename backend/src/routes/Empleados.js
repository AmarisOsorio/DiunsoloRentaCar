import express from "express";
import EmpleadosController from "../controllers/EmpleadosController.js";

const router = express.Router();

router.route("/")
  .get(EmpleadosController.getEmpleados)
  

router.route("/:id")
  .get(EmpleadosController.getEmpleadoById)
  
  .delete(EmpleadosController.deleteEmpleado);

export default router;