import express from "express";
import registerClientsController from "../controllers/registerClientsController.js";
import upload from "../middlewares/uploadClienteImages.js";
const router = express.Router();

router
  .route("/")
  .post(
    upload.fields([
      { name: "licenciaFrente", maxCount: 1 },
      { name: "licenciaReverso", maxCount: 1 },
      { name: "pasaporteFrente", maxCount: 1 },
      { name: "pasaporteReverso", maxCount: 1 },
    ]),
    registerClientsController.register
  );
router.route("/verifyCodeEmail").post(registerClientsController.verifyCodeEmail);
router.route("/resendCodeEmail").post(registerClientsController.resendCodeEmail);

export default router;
