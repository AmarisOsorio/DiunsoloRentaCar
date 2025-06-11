import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { config as appConfig } from "../config.js";

const router = express.Router();

// Configurar Cloudinary con los datos del config.js
cloudinary.config({
  cloud_name: appConfig.cloudinary.cloudinary_name,
  api_key: appConfig.cloudinary.cloudinary_api_key,
  api_secret: appConfig.cloudinary.cloudinary_api_secret,
});

const upload = multer({ storage: multer.memoryStorage() }); // Usar memoria para enviar a Cloudinary

// Endpoint para subir una imagen a Cloudinary y devolver la URL
router.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ninguna imagen" });
  }
  try {
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error)
          return res.status(500).json({ message: "Error subiendo a Cloudinary", error });
        res.json({ url: result.secure_url });
      }
    );
    result.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: "Error interno al subir la imagen", error: err });
  }
});

export default router;
