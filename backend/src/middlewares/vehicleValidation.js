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
  console.log('Middleware validateVehicleData ejecutado');
  console.log('Method:', req.method);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body keys:', Object.keys(req.body));
  console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
  
  // Para actualizaciones (PUT), ser más flexible
  const isUpdate = req.method === 'PUT';

  if (isUpdate) {
    console.log('Validación para actualización - permitiendo campos parciales');
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

  // Función auxiliar para validar URLs
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  // Validar imágenes principales (mainViewImage y sideImage) - acepta archivos o URLs
  const hasMainViewImage = 
    (req.files && req.files.mainViewImage && req.files.mainViewImage.length > 0) || 
    (req.body.mainViewImage && (typeof req.body.mainViewImage === 'string' && isValidUrl(req.body.mainViewImage)));
  
  const hasSideImage = 
    (req.files && req.files.sideImage && req.files.sideImage.length > 0) || 
    (req.body.sideImage && (typeof req.body.sideImage === 'string' && isValidUrl(req.body.sideImage)));

  if (!hasMainViewImage || !hasSideImage) {
    return res.status(400).json({
      message: 'Faltan imágenes principales (mainViewImage o sideImage). Proporciona archivos o URLs válidas.'
    });
  }

  if (missing.length > 0) {
    return res.status(400).json({
      message: 'Faltan campos requeridos',
      missing: missing
    });
  }

  next();
};
