import express from "express";
import registerClientsController from "../controllers/registerClientsController.js";

const router = express.Router();

// Register client route
router.route("/").post(registerClientsController.registerClients);

// Email verification route
router.route("/verifyCodeEmail").post(registerClientsController.verifyEmail);

// Resend verification email route
router.route("/resendCodeEmail").post(registerClientsController.resendVerificationEmail);

export default router;