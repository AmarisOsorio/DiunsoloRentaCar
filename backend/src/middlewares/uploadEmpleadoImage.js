import multer from 'multer';

// Configuración de multer para empleados - guardando en disco como en tu BlogController
const fileFilter = (req, file, cb) => {
  console.log('Archivo recibido en multer:', file);
  // Verificar que el archivo sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  dest: "public/", // Guardar en disco como en tu BlogController
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

export default upload;