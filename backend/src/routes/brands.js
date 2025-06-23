//Imports
import express from "express";
import brandsController from "../controllers/brandsController.js";

//Router
const router = express.Router();

//Routes
router.route("/")
  .get(brandsController.getBrands)
  .post(brandsController.addBrand);

router.route("/:id")
  .get(brandsController.getBrandById)
  .put(brandsController.updateBrand)
  .delete(brandsController.deleteBrand);

//Export
export default router;