import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configuración de almacenamiento para guardar imágenes en /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Endpoint para subir una imagen y devolver la URL
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ninguna imagen" });
  }
  // Construir la URL pública (ajusta según tu config de servidor)
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
