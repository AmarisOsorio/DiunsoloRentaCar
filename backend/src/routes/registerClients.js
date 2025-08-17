//Imports
import express from "express"
import registerClientsController from "../controllers/registerClientsController.js";

//Router
const router = express.Router();
//Route
router.route("/")
  .post(registerClientsController.registerClients)

//Subroutes
router.route("/verifyCodeEmail")
  .post(registerClientsController.verifyEmail)
router.route("/resendCodeEmail")
  .post(registerClientsController.resendVerificationEmail)

//Export
export default router;