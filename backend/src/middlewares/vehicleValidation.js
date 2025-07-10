import fs from 'fs';
import path from 'path';

// Middleware para asegurar que existe el directorio temporal
export const ensureTempDirectory = (req, res, next) => {
  const tempDir = path.join(process.cwd(), 'temp');
  
  if (!fs.existsSync(tempDir)) {
    try {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('Directorio temporal creado:', tempDir);
    } catch (error) {
      console.error('Error al crear directorio temporal:', error);
      return res.status(500).json({ 
        message: 'Error interno: No se pudo crear directorio temporal' 
      });
    }
  }
  
  next();
};

// Middleware para verificar que los datos del vehículo están completos
export const validateVehicleData = (req, res, next) => {
  const required = [
    'nombreVehiculo', 'precioPorDia', 'placa', 'idMarca', 
    'clase', 'color', 'anio', 'capacidad', 'modelo', 
    'numeroMotor', 'numeroChasisGrabado', 'numeroVinChasis'
  ];
  
  const missing = required.filter(field => !req.body[field]);
  
  if (missing.length > 0) {
    return res.status(400).json({
      message: 'Faltan campos requeridos',
      missing: missing
    });
  }
  
  next();
};
