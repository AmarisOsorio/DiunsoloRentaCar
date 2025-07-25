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
router.post("/upload-image", upload.single("file"), (req, res) => {
  // Log para depuración
  console.log('🔄 Upload request received');
  console.log('📁 File:', req.file ? req.file.originalname : 'No file');
  console.log('📊 Cloudinary config:', {
    cloud_name: appConfig.cloudinary.cloudinary_name,
    api_key: appConfig.cloudinary.cloudinary_api_key ? 'Set' : 'Not set',
    api_secret: appConfig.cloudinary.cloudinary_api_secret ? 'Set' : 'Not set'
  });
  
  if (!req.file) {
    console.log('❌ No file uploaded');
    return res.status(400).json({ message: "No se subió ninguna imagen" });
  }

  const folder = req.body.folder || 'vehiculos';
  
  console.log('📂 Upload folder:', folder);
  console.log('🚀 Starting Cloudinary upload...');
  
  const stream = cloudinary.uploader.upload_stream(
    { 
      resource_type: "image",
      folder: folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp"]
    },
    (error, result) => {
      if (error) {
        console.error('❌ Error Cloudinary:', error);
        return res.status(500).json({ message: "Error subiendo a Cloudinary", error });
      }
      console.log('✅ Upload successful:', result.secure_url);
      res.json({ 
        secure_url: result.secure_url,
        public_id: result.public_id,
        url: result.secure_url 
      });
    }
  );
  stream.end(req.file.buffer);
});

// Endpoint para eliminar una imagen de Cloudinary
router.delete("/delete-image", (req, res) => {
  const { public_id } = req.body;
  
  if (!public_id) {
    return res.status(400).json({ message: "public_id es requerido" });
  }

  cloudinary.uploader.destroy(public_id, (error, result) => {
    if (error) {
      console.error('Error eliminando de Cloudinary:', error);
      return res.status(500).json({ message: "Error eliminando de Cloudinary", error });
    }
    res.json({ message: "Imagen eliminada exitosamente", result });
  });
});

export default router;
