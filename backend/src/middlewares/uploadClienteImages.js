import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('📁 [Cliente Upload] Validando archivo:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ [Cliente Upload] Archivo válido (es imagen)');
    cb(null, true);
  } else {
    console.log('❌ [Cliente Upload] Archivo rechazado (no es imagen)');
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    files: 4 // Máximo 4 archivos (licencia frente/reverso, pasaporte frente/reverso)
  }
});

const uploadWithErrorHandling = {
  fields: (fields) => {
    return (req, res, next) => {
      const uploadMiddleware = upload.fields(fields);
      
      uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          console.error('❌ [Cliente Upload] Error de Multer:', err);
          
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'El archivo es demasiado grande. Máximo 5MB por imagen.' 
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
              message: 'Demasiados archivos. Máximo 4 imágenes permitidas.' 
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
              message: 'Campo de archivo no esperado: ' + err.field 
            });
          }
          return res.status(400).json({ 
            message: 'Error procesando archivos: ' + err.message 
          });
        } else if (err) {
          console.error('❌ [Cliente Upload] Error general:', err);
          return res.status(400).json({ 
            message: err.message 
          });
        }
        
        // Log exitoso
        if (req.files) {
          console.log('✅ [Cliente Upload] Archivos procesados exitosamente:');
          Object.keys(req.files).forEach(fieldname => {
            const files = req.files[fieldname];
            files.forEach(file => {
              console.log(`  - ${fieldname}: ${file.originalname} (${file.size} bytes)`);
              if (!file.buffer) {
                console.warn(`  ⚠️ Advertencia: El archivo ${fieldname} no tiene buffer`);
              }
            });
          });
        } else {
          console.log('ℹ️ [Cliente Upload] No se recibieron archivos');
        }
        
        next();
      });
    };
  },
  
  single: (fieldname) => {
    return (req, res, next) => {
      const uploadMiddleware = upload.single(fieldname);
      
      uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          console.error('❌ [Cliente Upload Single] Error de Multer:', err);
          
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'El archivo es demasiado grande. Máximo 5MB.' 
            });
          }
          return res.status(400).json({ 
            message: 'Error procesando archivo: ' + err.message 
          });
        } else if (err) {
          console.error('❌ [Cliente Upload Single] Error general:', err);
          return res.status(400).json({ 
            message: err.message 
          });
        }
        
        // Log exitoso
        if (req.file) {
          console.log('✅ [Cliente Upload Single] Archivo procesado exitosamente:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? 'Buffer presente' : 'Sin buffer'
          });
        } else {
          console.log('ℹ️ [Cliente Upload Single] No se recibió archivo');
        }
        
        next();
      });
    };
  }
};

export default uploadWithErrorHandling;