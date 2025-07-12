import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 4
  }
});

const uploadWithErrorHandling = {
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
              message: 'Demasiados archivos. Máximo 4 archivos.' 
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
  },
  
  single: (fieldname) => {
    return upload.single(fieldname);
  }
};

export default uploadWithErrorHandling;