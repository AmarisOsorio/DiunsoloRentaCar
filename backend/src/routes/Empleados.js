import express from "express";
import EmpleadosController from "../controllers/EmpleadosController.js";
import upload from "../middlewares/uploadEmpleadoImage.js";

const router = express.Router();

router.route("/")
  .get(EmpleadosController.getEmpleados)
  .post(upload.single('foto'), EmpleadosController.RegisterEmpleado);

router.route("/:id")
  .get(EmpleadosController.getEmpleadoById)
  .put(upload.single('foto'), EmpleadosController.updateEmpleado)
  .delete(EmpleadosController.deleteEmpleado);

export default router;