import express from "express";
import loginController from "../controllers/loginController.js";

const router = express.Router();

// Ruta principal de login
router.route("/").post(loginController.login);

// Nueva ruta para generar token de verificación
router.route("/generateVerificationToken").post(loginController.generateVerificationToken);

export default router;