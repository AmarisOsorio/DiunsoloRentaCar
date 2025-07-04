import express from "express";
import profileController from "../controllers/profileController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener información del perfil
router.get("/", profileController.getProfile);

// Actualizar información del perfil
router.put("/update", profileController.updateProfile);

// Cambiar contraseña
router.put("/change-password", profileController.changePassword);

// Eliminar cuenta
router.delete("/delete", profileController.deleteAccount);


// --- Cambio de email seguro ---
router.post('/request-email-change', profileController.requestEmailChange);
router.post('/verify-email-change', profileController.verifyEmailChange);

// Subir imagen de documento
router.post("/upload-document", profileController.uploadDocument);

// Eliminar documento específico
router.delete("/delete-document", profileController.deleteDocument);

export default router;
