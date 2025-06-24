import express from "express";
import passwordRecoveryController from "../controllers/passwordRecoveryController.js";
const router = express.Router();

// Cambiar endpoints a formato kebab-case y nombres estándar
router.route("/request").post(passwordRecoveryController.requestCode);
router.route("/verify").post(passwordRecoveryController.verifyCode);
router.route("/new-password").post(passwordRecoveryController.newPassword);

export default router;
