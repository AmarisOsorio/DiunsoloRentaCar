//Imports
<<<<<<< HEAD
import express from "express"
=======
import express from "express";
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
import multer from "multer";
import registerClientsController from "../controllers/registerClientsController.js";

// Multer config (memory storage, adjust as needed)
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Router
const router = express.Router();

// Configurar multer para manejar archivos
const upload = multer({dest: "public/Clients"})

//Route - Agregar multer para manejar archivos
router.route("/")
<<<<<<< HEAD
  .post(upload.fields([
    { name: "licenseFront", maxCount: 1 },
    { name: "licenseBack", maxCount: 1 },
    { name: "passportFront", maxCount: 1 },
    { name: "passportBack", maxCount: 1 },
    { name: "photo", maxCount: 1 }
  ]), registerClientsController.registerClients)
=======
  .post(
    upload.fields([
      { name: "licenseFront", maxCount: 1 },
      { name: "licenseBack", maxCount: 1 },
      { name: "passportFront", maxCount: 1 },
      { name: "passportBack", maxCount: 1 }
    ]),
    registerClientsController.registerClients
  )
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767

//Subroutes
router.route("/verifyCodeEmail")
  .post(registerClientsController.verifyEmail)
router.route("/resendCodeEmail")
  .post(registerClientsController.resendVerificationEmail)

//Export
export default router;