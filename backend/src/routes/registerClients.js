import express from "express";
import registerClientsController from "../controllers/registerClientsController.js";
import upload from "../middlewares/uploadClienteImages.js";
const router = express.Router();

router
  .route("/")
  .post(
    upload.fields([
      { name: "pasaporte_dui", maxCount: 1 },
      { name: "licencia", maxCount: 1 },
    ]),
    registerClientsController.register
  );
router.route("/verifyCodeEmail").post(registerClientsController.verifyCodeEmail);
router.route("/resendCodeEmail").post(registerClientsController.resendCodeEmail);

export default router;
