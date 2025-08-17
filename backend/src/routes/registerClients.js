<<<<<<< HEAD
import express from "express";
=======
//Imports
import express from "express"
>>>>>>> 914ffd672dbc9070e913403124830f7326b446db
import registerClientsController from "../controllers/registerClientsController.js";

//Router
const router = express.Router();

<<<<<<< HEAD
// Register client route
router.route("/").post(registerClientsController.registerClients);

// Email verification route
router.route("/verifyCodeEmail").post(registerClientsController.verifyEmail);

// Resend verification email route
router.route("/resendCodeEmail").post(registerClientsController.resendVerificationEmail);
=======
//Route
router.route("/")
  .post(registerClientsController.registerClients)

//Subroutes
router.route("/verifyCodeEmail")
  .post(registerClientsController.verifyEmail)
router.route("/resendCodeEmail")
  .post(registerClientsController.resendVerificationEmail)
>>>>>>> 914ffd672dbc9070e913403124830f7326b446db

//Export
export default router;