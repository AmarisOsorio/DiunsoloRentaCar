import express from "express";
import multer from "multer";
import BrandsController from "../controllers/BrandsController.js";

const router = express.Router();

// Configure multer for temporary file uploads
const upload = multer({ dest: 'public/Brands' });

// Main routes
router.route("/")
    .get(BrandsController.getAllBrands)
    .post(upload.single('logo'), BrandsController.createBrand);

// Routes with ID parameter
router.route("/:id")
    .put(upload.single('logo'), BrandsController.updateBrand)
    .delete(BrandsController.deleteBrand);

export default router;