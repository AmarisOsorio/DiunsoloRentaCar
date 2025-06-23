//Imports
import express from "express";
import brandsController from "../controllers/brandsController.js";
import multer from 'multer';

//Router
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//Routes
router.route("/")
  .get(brandsController.getBrands)
  .post(upload.single('logo'), brandsController.addBrand);

router.route("/:id")
  .get(brandsController.getBrandById)
  .put(brandsController.updateBrand)
  .delete(brandsController.deleteBrand);

//Export
export default router;