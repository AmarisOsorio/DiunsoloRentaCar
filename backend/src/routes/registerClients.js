import express from "express";

const router = express.Router();

let registerClientsController;
try {
  const controllerModule = await import("../controllers/registerClientsController.js");
  registerClientsController = controllerModule.default;
} catch (error) {
  registerClientsController = {
    register: (req, res) => res.status(500).json({ message: "Register controller not available" }),
    verifyCodeEmail: (req, res) => res.status(500).json({ message: "VerifyCodeEmail controller not available" }),
    resendCodeEmail: (req, res) => res.status(500).json({ message: "ResendCodeEmail controller not available" })
  };
}

router
  .route("/")
  
router.route("/verifyCodeEmail").post(registerClientsController.verifyCodeEmail);
router.route("/resendCodeEmail").post(registerClientsController.resendCodeEmail);

export default router;