//Imports
import express from "express";
import multer from "multer";
import registerClientsController from "../controllers/registerClientsController.js";

// Multer config (memory storage, adjust as needed)
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Router
const router = express.Router();
//Route
router.route("/")
  .post(
    upload.fields([
      { name: "licenseFront", maxCount: 1 },
      { name: "licenseBack", maxCount: 1 },
      { name: "passportFront", maxCount: 1 },
      { name: "passportBack", maxCount: 1 }
    ]),
    registerClientsController.registerClients
  )

//Subroutes
router.route("/verifyCodeEmail")
  .post(registerClientsController.verifyEmail)
router.route("/resendCodeEmail")
  .post(registerClientsController.resendVerificationEmail)

//Export
export default router;