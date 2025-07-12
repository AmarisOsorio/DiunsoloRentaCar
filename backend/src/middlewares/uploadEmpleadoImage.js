import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('📁 Validando archivo:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ Archivo válido (es imagen)');
    cb(null, true);
  } else {
    console.log('❌ Archivo rechazado (no es imagen)');
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

const uploadWithErrorHandling = {
  single: (fieldname) => {
    return (req, res, next) => {
      const uploadMiddleware = upload.single(fieldname);
      
      uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          console.error('❌ Error de Multer:', err);
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'El archivo es demasiado grande. Máximo 5MB.' 
            });
          }
          return res.status(400).json({ 
            message: 'Error procesando archivo: ' + err.message 
          });
        } else if (err) {
          console.error('❌ Error general:', err);
          return res.status(400).json({ 
            message: err.message 
          });
        }
        
        // Log exitoso
        if (req.file) {
          console.log('✅ Archivo procesado exitosamente:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? 'Buffer presente' : 'Sin buffer'
          });
        } else {
          console.log('ℹ️ No se recibió archivo');
        }
        
        next();
      });
    };
  },
  
  fields: (fields) => {
    return (req, res, next) => {
      const uploadMiddleware = upload.fields(fields);
      
      uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'El archivo es demasiado grande. Máximo 5MB.' 
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
              message: 'Demasiados archivos. Máximo permitido según configuración.' 
            });
          }
          return res.status(400).json({ 
            message: 'Error procesando archivos: ' + err.message 
          });
        } else if (err) {
          return res.status(400).json({ 
            message: err.message 
          });
        }
        
        next();
      });
    };
  }
};

export default uploadWithErrorHandling;