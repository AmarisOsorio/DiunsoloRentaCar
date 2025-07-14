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
    const { anio, capacidad, precioPorDia } = req.body;
    
    if (anio && (isNaN(parseInt(anio)) || parseInt(anio) < 1900 || parseInt(anio) > new Date().getFullYear() + 1)) {
      return res.status(400).json({
        message: 'El año debe ser válido',
        field: 'anio'
      });
    }
    
    if (capacidad && (isNaN(parseInt(capacidad)) || parseInt(capacidad) < 1 || parseInt(capacidad) > 50)) {
      return res.status(400).json({
        message: 'La capacidad debe ser entre 1 y 50',
        field: 'capacidad'
      });
    }
    
    if (precioPorDia && (isNaN(parseFloat(precioPorDia)) || parseFloat(precioPorDia) <= 0)) {
      return res.status(400).json({
        message: 'El precio por día debe ser un número positivo',
        field: 'precioPorDia'
      });
    }
    
    next();
    return;
  }
  
  // Para creación (POST), validar todos los campos requeridos
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
