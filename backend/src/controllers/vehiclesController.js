// Imports
import Vehicle from "../models/Vehicles.js";
import Brand from "../models/Brands.js";
import pdfGenerator from '../utils/pdfGenerator.js';

import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

// Cloudinary configuration 
// Cloudinary configuration 
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Controller object
const vehiclesController = {};

/**
 * Obtener todos los vehículos
 * GET /vehicles
 */
vehiclesController.getVehicles = async (req, res) => {
  try {
    // Traer los vehículos y poblar el objeto de la marca
    const vehicles = await Vehicle.find().populate('brandId');
    return res.status(200).json(vehicles);
  } catch (error) {
    // Log detallado del error en consola
    console.error('Error en getVehicles:', error);
    // Error interno del servidor
    return res.status(500).json({ mensaje: "Error al obtener vehículos", error: error?.message || error });
  }
};

/**
 * Obtener vehículos destacados (máx 3)
 * GET /vehicles/home
 */
vehiclesController.getHomeVehicles = async (req, res) => {
  try {
    // Obtener los 3 vehículos con más reservas
    // Se asume que el modelo Reservations tiene un campo vehicleId que referencia a Vehicle
    const Reservations = (await import('../models/Reservations.js')).default;
    // Agrupar por vehicleId y contar reservas
    const topVehicles = await Reservations.aggregate([
      { $group: { _id: "$vehicleId", reservasCount: { $sum: 1 } } },
      { $sort: { reservasCount: -1 } },
      { $limit: 3 }
    ]);
    // Obtener los datos completos de los vehículos
    const vehicleIds = topVehicles.map(v => v._id);
    const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } });
    // Devolver los datos de los vehículos
    return res.status(200).json(vehicles);
  } catch (error) {
    // Error interno del servidor
    return res.status(500).json({ mensaje: "Error al obtener vehículos destacados", error });
  }
};


/**
 * Obtener vehículo por ID
 * GET /vehicles/:id
 */
vehiclesController.getVehicleById = async (req, res) => {
  try {
    // Validar formato de ObjectId de MongoDB
    const vehicleId = req.params.id;
    if (!vehicleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        mensaje: "Formato de ID inválido", 
        error: "El ID proporcionado no es un ObjectId válido" 
      });
    }
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      // No encontrado
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }
    // Obtener nombre de la marca
    let brandName = 'N/A';
    try {
      if (vehicle.brandId) {
        const brand = await Brand.findById(vehicle.brandId);
        brandName = brand ? brand.brandName : 'N/A';
      }
    } catch (error) {
      // Log de error pero continuar
      console.log('Error al obtener marca para vehículo:', vehicle._id, error);
    }
    // Agregar nombre de marca a la respuesta
    const vehicleObj = vehicle.toObject();
    vehicleObj.brandName = brandName;
    return res.status(200).json(vehicleObj);
  } catch (error) {
    // Error interno del servidor
    return res.status(500).json({ mensaje: "Error al obtener vehículo", error });
  }
};

/**
 * Agregar un nuevo vehículo
 * POST /vehicles
 */
vehiclesController.addVehicle = async (req, res) => {
  try {
    console.log('📥 Datos recibidos en addVehicle:');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body sample:', {
      vehicleName: req.body.vehicleName,
      mainViewImage: typeof req.body.mainViewImage,
      sideImage: typeof req.body.sideImage
    });

    // Helper para validar URLs
    const isValidUrl = (string) => {
      if (typeof string !== 'string') return false;
      try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_) {
        return false;
      }
    };

    // Helper para subir imágenes a Cloudinary
    const uploadFromBuffer = async (fileBuffer, folder = 'vehicles') => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (error, result) => error ? reject(error) : resolve(result)
        ).end(fileBuffer);
      });
    };

    // Inicializar variables
    let galleryImages = [];
    let mainViewImage = '';
    let sideImage = '';

    // Procesar imágenes de galería
    const processGalleryImages = async () => {
      let galleryUrls = [];
      
      // Procesar archivos de galería si existen
      if (req.files?.galleryImages) {
        const files = Array.isArray(req.files.galleryImages)
          ? req.files.galleryImages
          : [req.files.galleryImages[0]];
        const uploadImgsResults = await Promise.all(files.map(file => uploadFromBuffer(file.buffer)));
        galleryUrls.push(...uploadImgsResults.map(result => result.secure_url));
      }
      
      // Procesar URLs de galería si existen
      if (req.body.galleryImagesUrls) {
        try {
          const urls = JSON.parse(req.body.galleryImagesUrls);
          if (Array.isArray(urls)) {
            const validUrls = urls.filter(url => typeof url === 'string' && isValidUrl(url));
            galleryUrls.push(...validUrls);
          }
        } catch (e) {
          console.warn('Error parsing galleryImagesUrls:', e);
        }
      }
      
      // Procesar URLs de galería del body directo (fallback)
      if (req.body.galleryImages) {
        if (Array.isArray(req.body.galleryImages)) {
          const validUrls = req.body.galleryImages.filter(url => typeof url === 'string' && isValidUrl(url));
          galleryUrls.push(...validUrls);
        } else if (typeof req.body.galleryImages === 'string') {
          try {
            const parsed = JSON.parse(req.body.galleryImages);
            if (Array.isArray(parsed)) {
              const validUrls = parsed.filter(url => typeof url === 'string' && isValidUrl(url));
              galleryUrls.push(...validUrls);
            } else if (isValidUrl(req.body.galleryImages)) {
              galleryUrls.push(req.body.galleryImages);
            }
          } catch {
            if (isValidUrl(req.body.galleryImages)) {
              galleryUrls.push(req.body.galleryImages);
            }
          }
        }
      }
      
      return galleryUrls;
    };

    // Procesar imagen principal
    const processSingleImage = async (fileField, bodyField) => {
      // Si hay un archivo adjunto, subirlo a Cloudinary
      if (req.files?.[fileField] && req.files[fileField][0]) {
        const uploadResult = await uploadFromBuffer(req.files[fileField][0].buffer);
        return uploadResult.secure_url;
      } 
      // Si hay una URL en el body, validarla y usarla
      else if (req.body[bodyField]) {
        const imageData = req.body[bodyField];
        
        // Si es un string (URL), validar que sea una URL válida
        if (typeof imageData === 'string' && isValidUrl(imageData)) {
          return imageData;
        }
        // Si es un objeto, puede ser que se haya serializado mal
        else if (typeof imageData === 'object' && imageData !== null) {
          console.warn(`Imagen ${bodyField} recibida como objeto:`, imageData);
          // Intentar extraer URL si está anidada en el objeto
          if (imageData.uri && typeof imageData.uri === 'string' && isValidUrl(imageData.uri)) {
            return imageData.uri;
          }
          if (imageData.url && typeof imageData.url === 'string' && isValidUrl(imageData.url)) {
            return imageData.url;
          }
          console.error(`No se pudo procesar la imagen ${bodyField}:`, imageData);
          return '';
        }
      }
      return '';
    };

    galleryImages = await processGalleryImages();
    mainViewImage = await processSingleImage('mainViewImage', 'mainViewImage');
    sideImage = await processSingleImage('sideImage', 'sideImage');

    // Validar que existan las imágenes principales
    if (!mainViewImage || !sideImage) {
      return res.status(400).json({ mensaje: "Faltan mainViewImage o sideImage" });
    }

    const {
      vehicleName,
      dailyPrice,
      plate,
      brandId,
      vehicleClass,
      color,
      year,
      capacity,
      model,
      engineNumber,
      chassisNumber,
      vinNumber,
      status
    } = req.body;

    // Obtener nombre de la marca
    let brandName = 'N/A';
    if (brandId) {
      try {
        const brand = await Brand.findById(brandId);
        if (brand) brandName = brand.brandName;
      } catch (error) {
        brandName = 'N/A';
      }
    }

    // Generar PDF del contrato de arrendamiento
    let leaseContractUrl = '';
    try {
      leaseContractUrl = await pdfGenerator.generateLeaseContract({
        vehicleName,
        plate,
        class: vehicleClass,
        brand: brandName,
        color,
        year,
        capacity,
        model,
        engineNumber,
        chassisNumber,
        vinNumber
      });
      console.log('Contrato generado, URL:', leaseContractUrl);
    } catch (error) {
      console.error('Error generando contrato de arrendamiento:', error);
      leaseContractUrl = '';
    }

    // Crear nuevo documento de vehículo
    const newVehicle = new Vehicle({
      mainViewImage,
      sideImage,
      galleryImages,
      vehicleName,
      dailyPrice,
      plate,
      brandId,
      vehicleClass,
      color,
      year,
      capacity,
      model,
      engineNumber,
      chassisNumber,
      vinNumber,
      leaseContract: leaseContractUrl,
      status
    });

    await newVehicle.save();
    console.log('Nuevo vehículo creado, leaseContract:', newVehicle.leaseContract);
    return res.status(201).json({ 
      message: "Vehículo agregado exitosamente",
      leaseContractGenerated: !!leaseContractUrl,
      leaseContractUrl
    });
  } catch (error) {
    // Mejorar respuesta de error: mostrar mensaje claro
    return res.status(400).json({ 
      message: "Error al agregar vehículo", 
      error: error?.message || error 
    });
  }
};

/**
 * Eliminar un vehículo
 * DELETE /vehicles/:id
 */
vehiclesController.deleteVehicle = async (req, res) => {
  try {
    const vehicleToDelete = await Vehicle.findById(req.params.id);
    if (!vehicleToDelete) {
      // No encontrado
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }
    await Vehicle.findByIdAndDelete(req.params.id);
    return res.status(200).json({ 
      mensaje: "Vehículo eliminado exitosamente",
      vehicle: vehicleToDelete 
    });
  } catch (error) {
    // Error interno del servidor
    return res.status(500).json({ mensaje: "Error al eliminar vehículo", error });
  }
};

/**
 * Actualizar un vehículo
 * PUT /vehicles/:id
 */
vehiclesController.updateVehicle = async (req, res) => {
  try {
    // Helper para validar URLs
    const isValidUrl = (string) => {
      if (typeof string !== 'string') return false;
      try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_) {
        return false;
      }
    };

    // Extraer datos del body - ahora manejamos tanto FormData como JSON
    let {
      galleryImages,
      mainViewImage,
      sideImage,
      vehicleName,
      dailyPrice,
      plate,
      brandId,
      vehicleClass,
      color,
      year,
      capacity,
      model,
      engineNumber,
      chassisNumber,
      vinNumber,
      status
    } = req.body;


    // Validar y convertir dailyPrice solo si viene en el body
    let parsedDailyPrice;
    if (typeof dailyPrice !== 'undefined') {
      parsedDailyPrice = parseFloat(dailyPrice);
      if (isNaN(parsedDailyPrice) || parsedDailyPrice <= 0) {
        return res.status(400).json({
          message: 'El precio por día debe ser un número positivo',
          field: 'dailyPrice'
        });
      }
    }
    console.log('Estado válido:', status);

    // Procesar imagenes si viene como string JSON
    if (typeof galleryImages === 'string') {
      try {
        galleryImages = JSON.parse(galleryImages);
      } catch (e) {
        console.log('Error parsing galleryImages JSON:', e);
        galleryImages = [];
      }
    }

    // Validar URLs de imágenes para actualización
    const validateImageUrl = (imageData) => {
      if (typeof imageData === 'string' && isValidUrl(imageData)) {
        return imageData;
      } else if (typeof imageData === 'object' && imageData !== null) {
        // Si es un objeto, intentar extraer la URL
        if (imageData.uri && typeof imageData.uri === 'string' && isValidUrl(imageData.uri)) {
          return imageData.uri;
        }
        if (imageData.url && typeof imageData.url === 'string' && isValidUrl(imageData.url)) {
          return imageData.url;
        }
        console.warn('Imagen recibida como objeto no válido:', imageData);
        return null;
      }
      return null;
    };

    // Preparar datos para actualización
    const updateData = {};
    if (typeof vehicleName !== 'undefined') updateData.vehicleName = vehicleName;
    if (typeof dailyPrice !== 'undefined') updateData.dailyPrice = parsedDailyPrice;
    if (typeof plate !== 'undefined') updateData.plate = plate?.toUpperCase();
    if (typeof brandId !== 'undefined') updateData.brandId = brandId;
    if (typeof vehicleClass !== 'undefined') updateData.vehicleClass = vehicleClass;
    if (typeof color !== 'undefined') updateData.color = color;
    if (typeof year !== 'undefined') updateData.year = parseInt(year);
    if (typeof capacity !== 'undefined') updateData.capacity = parseInt(capacity);
    if (typeof model !== 'undefined') updateData.model = model;
    if (typeof engineNumber !== 'undefined') updateData.engineNumber = engineNumber;
    if (typeof chassisNumber !== 'undefined') updateData.chassisNumber = chassisNumber;
    if (typeof vinNumber !== 'undefined') updateData.vinNumber = vinNumber;
    if (typeof status !== 'undefined') updateData.status = status;

    // Agregar imágenes solo si están presentes y son válidas
    if (galleryImages && Array.isArray(galleryImages) && galleryImages.length > 0) {
      // Filtrar solo URLs válidas
      const validGalleryUrls = galleryImages
        .map(img => validateImageUrl(img))
        .filter(url => url !== null);
      
      if (validGalleryUrls.length > 0) {
        updateData.galleryImages = validGalleryUrls;
      }
    }
    
    if (mainViewImage) {
      const validMainViewUrl = validateImageUrl(mainViewImage);
      if (validMainViewUrl) {
        updateData.mainViewImage = validMainViewUrl;
      }
    }
    
    if (sideImage) {
      const validSideUrl = validateImageUrl(sideImage);
      if (validSideUrl) {
        updateData.sideImage = validSideUrl;
      }
    }
    // leaseContract puede venir en el body, pero si no existe, no lo agregues
    if (typeof req.body.leaseContract !== 'undefined') {
      updateData.leaseContract = req.body.leaseContract;
    }

    // Detectar si se actualizaron datos relevantes (no solo imágenes)
    const nonImageFields = [
      'vehicleName', 'dailyPrice', 'plate', 'brandId', 'vehicleClass', 'color',
      'year', 'capacity', 'model', 'engineNumber', 'chassisNumber', 'vinNumber', 'status'
    ];
    let shouldRegenerateContract = false;
    for (const field of nonImageFields) {
      if (req.body[field] !== undefined) {
        shouldRegenerateContract = true;
        break;
      }
    }

    // Actualizar vehículo
    let updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedVehicle) {
      // No encontrado
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    // Si se actualizaron datos relevantes, regenerar el contrato
    if (shouldRegenerateContract) {
      // Obtener nombre de la marca
      let brandName = 'N/A';
      let brandIdToUse = updatedVehicle.brandId || req.body.brandId;
      if (brandIdToUse) {
        try {
          const brand = await Brand.findById(brandIdToUse);
          if (brand && brand.brandName) brandName = brand.brandName;
        } catch (error) {
          brandName = 'N/A';
        }
      }
      // Generar nuevo PDF de contrato de arrendamiento
      const vehicleDataForPdf = {
        vehicleName: updatedVehicle.vehicleName,
        plate: updatedVehicle.plate,
        class: updatedVehicle.vehicleClass,
        brand: brandName,
        color: updatedVehicle.color,
        year: updatedVehicle.year,
        capacity: updatedVehicle.capacity,
        model: updatedVehicle.model,
        engineNumber: updatedVehicle.engineNumber,
        chassisNumber: updatedVehicle.chassisNumber,
        vinNumber: updatedVehicle.vinNumber
      };
      try {
        const leaseContractUrl = await pdfGenerator.generateLeaseContract(vehicleDataForPdf);
        updatedVehicle.leaseContract = leaseContractUrl;
        await updatedVehicle.save();
      } catch (error) {
        console.log('Error al regenerar contrato de arrendamiento:', error);
      }
    }

    console.log('Vehículo actualizado exitosamente');
    return res.status(200).json({ 
      message: "Vehículo actualizado exitosamente", 
      vehicle: updatedVehicle 
    });
  } catch (error) {
    // Error interno del servidor
    console.error('Error al actualizar vehículo:', error);
    return res.status(500).json({ 
      message: "Error al actualizar vehículo", 
      error: error.message,
      details: error
    });
  }
};


/**
 * Test endpoint simple para verificar conectividad
 * GET /vehicles/test-connection
 */
vehiclesController.testConnection = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Conexión exitosa',
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error en la conexión',
      error: error.message,
      success: false
    });
  }
};

/**
 * Test endpoint específico para contrato
 * GET /vehicles/test-contract
 */
vehiclesController.testContract = async (req, res) => {
  try {
    console.log('🧪 Test contract endpoint called');
    
    const fallbackUrl = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
    
    return res.status(200).json({
      mensaje: "Test de contrato exitoso",
      downloadUrl: fallbackUrl,
      success: true,
      timestamp: new Date().toISOString(),
      testMode: true
    });
  } catch (error) {
    console.error('❌ Test contract error:', error);
    return res.status(500).json({
      mensaje: "Error en test de contrato",
      error: error.message,
      success: false
    });
  }
};

/**
 * Test endpoint para verificar que Puppeteer funciona
 * GET /vehicles/test-pdf
 */
vehiclesController.testPdf = async (req, res) => {
  try {
    console.log('🧪 Testing PDF generation...');
    
    const testData = {
      vehicleName: 'Test Vehicle',
      plate: 'TEST123',
      brandName: 'Test Brand',
      vehicleClass: 'SUV',
      color: 'Red',
      year: '2023',
      capacity: '5',
      model: 'Test Model',
      engineNumber: 'ENG123',
      chassisNumber: 'CHA123',
      vinNumber: 'VIN123',
      dailyPrice: '50.00'
    };
    
    const result = await pdfGenerator.generateLeaseContract(testData);
    
    return res.status(200).json({
      message: 'PDF test successful',
      url: result
    });
  } catch (error) {
    console.error('❌ PDF Test Error:', error);
    return res.status(500).json({
      message: 'PDF test failed',
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Descargar el PDF del contrato de arrendamiento para un vehículo
 * GET /vehicles/contract-download/:id
 */
vehiclesController.downloadLeaseContract = async (req, res) => {
  console.log(`\n=== DESCARGA DE CONTRATO - VERSIÓN DEBUG ===`);
  console.log(`Vehicle ID: ${req.params.id}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Request headers:`, req.headers);
  console.log(`Request method:`, req.method);
  
  try {
    // Validar que el ID del vehículo existe y es válido
    const vehicleId = req.params.id;
    console.log('🔍 Processing vehicle ID:', vehicleId);
    
    if (!vehicleId) {
      console.log('❌ Vehicle ID no proporcionado');
      return res.status(400).json({
        mensaje: "ID del vehículo requerido",
        error: "Parámetro ID faltante",
        success: false
      });
    }

    // Validar formato de ObjectId de MongoDB
    if (!vehicleId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Vehicle ID formato inválido:', vehicleId);
      return res.status(400).json({
        mensaje: "Formato de ID inválido",
        error: "El ID proporcionado no es un ObjectId válido",
        success: false
      });
    }

    console.log('🔍 Buscando vehículo en la base de datos...');
    
    // Simplificar la búsqueda de vehículo para debug
    let vehicle;
    try {
      console.log('🔍 Intentando Vehicle.findById...');
      vehicle = await Vehicle.findById(vehicleId).populate('brandId');
      console.log('🔍 Resultado de búsqueda:', vehicle ? 'Encontrado' : 'No encontrado');
    } catch (dbError) {
      console.error('❌ Error de base de datos:', dbError);
      
      // Retornar URL de fallback
      const fallbackUrl = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
      
      return res.status(200).json({
        mensaje: "Contrato disponible (modo de recuperación)",
        downloadUrl: fallbackUrl,
        success: true,
        warning: "Usando contrato genérico debido a error temporal de base de datos",
        fallbackMode: true,
        dbError: dbError.message
      });
    }
    
    if (!vehicle) {
      console.log('❌ Vehículo no encontrado para ID:', vehicleId);
      
      // Return fallback URL even when vehicle not found
      const fallbackUrl = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
      
      return res.status(200).json({
        mensaje: "Contrato genérico disponible",
        downloadUrl: fallbackUrl,
        success: true,
        warning: "Vehículo no encontrado, usando contrato genérico",
        vehicleId: vehicleId,
        fallbackMode: true
      });
    }

    console.log('✅ Vehículo encontrado:', vehicle.vehicleName);
    
    // Skip PDF generation for now and return fallback URL
    console.log('🔄 Retornando URL de fallback para evitar errores de PDF...');
    
    const fallbackUrl = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
    
    return res.status(200).json({
      mensaje: "Contrato de arrendamiento disponible",
      downloadUrl: fallbackUrl,
      success: true,
      vehicle: vehicle.vehicleName,
      plate: vehicle.plate,
      brand: vehicle.brandId?.name || 'Sin marca',
      generatedAt: new Date().toISOString(),
      fallbackMode: true,
      note: "PDF generation temporarily disabled for debugging"
    });
    
  } catch (error) {
    console.error("❌ Error crítico en downloadLeaseContract:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Always return a fallback URL with 200 status to avoid mobile app errors
    const emergencyUrl = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
    
    return res.status(200).json({ 
      mensaje: "Contrato disponible (modo de emergencia)",
      downloadUrl: emergencyUrl,
      success: true,
      warning: "Usando contrato genérico debido a error del sistema",
      error: error.message || "Error interno del servidor",
      errorName: error.name,
      timestamp: new Date().toISOString(),
      emergencyMode: true
    });
  }
};

/**
 * Test contract endpoint - simplified test
 * GET /vehicles/test-contract
 */
vehiclesController.testContract = async (req, res) => {
  console.log('🧪 Test contract endpoint called');
  return res.status(200).json({
    mensaje: "Test contract endpoint funcionando",
    success: true,
    timestamp: new Date().toISOString()
  });
};

/**
 * Test PDF generation
 * GET /vehicles/test-pdf
 */
vehiclesController.testPdf = async (req, res) => {
  console.log('🧪 Test PDF endpoint called');
  
  try {
    console.log('🔍 Testing pdfGenerator import...');
    
    // Test if pdfGenerator is imported correctly
    if (pdfGenerator) {
      console.log('✅ pdfGenerator imported successfully');
    } else {
      console.log('❌ pdfGenerator is undefined');
    }
    
    const fallbackUrl = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
    
    return res.status(200).json({
      mensaje: "Test PDF endpoint funcionando",
      pdfGeneratorAvailable: !!pdfGenerator,
      fallbackUrl: fallbackUrl,
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in test PDF:', error);
    return res.status(500).json({
      mensaje: "Error in test PDF",
      error: error.message,
      success: false
    });
  }
};

/**
 * Test basic connection
 * GET /vehicles/test-connection
 */
vehiclesController.testConnection = async (req, res) => {
  console.log('🧪 Test connection endpoint called');
  return res.status(200).json({
    mensaje: "Conexión funcionando correctamente",
    success: true,
    timestamp: new Date().toISOString(),
    server: 'production'
  });
};

export default vehiclesController;