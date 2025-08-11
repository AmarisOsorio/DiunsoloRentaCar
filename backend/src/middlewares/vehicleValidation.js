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
  // Para actualizaciones (PUT), ser más flexible
  const isUpdate = req.method === 'PUT';
  
  if (isUpdate) {
    console.log('🔍 Validación para actualización - permitiendo campos parciales');
    // Para updates, solo validar que los campos presentes sean válidos
    const { year, capacity, dailyPrice } = req.body;

    if (year && (isNaN(parseInt(year)) || parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear() + 1)) {
      return res.status(400).json({
        message: 'El año debe ser válido',
        field: 'year'
      });
    }

    if (capacity && (isNaN(parseInt(capacity)) || parseInt(capacity) < 1 || parseInt(capacity) > 50)) {
      return res.status(400).json({
        message: 'La capacidad debe ser entre 1 y 50',
        field: 'capacity'
      });
    }

    if (dailyPrice && (isNaN(parseFloat(dailyPrice)) || parseFloat(dailyPrice) <= 0)) {
      return res.status(400).json({
        message: 'El precio por día debe ser un número positivo',
        field: 'dailyPrice'
      });
    }

    next();
    return;
  }

  // Para creación (POST), validar todos los campos requeridos (en inglés)
  const required = [
    'vehicleName', 'dailyPrice', 'plate', 'brandId',
    'vehicleClass', 'color', 'year', 'capacity', 'model',
    'engineNumber', 'chassisNumber', 'vinNumber'
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
