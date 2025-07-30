// Imports
import Vehicle from "../models/Vehicles.js";
import Brand from "../models/Marcas.js";

import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

// Cloudinary configuration (usa config.js que ya tiene dotenv.config())
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
    const vehicles = await Vehicle.find();
    return res.status(200).json(vehicles);
  } catch (error) {
    // Error interno del servidor
    return res.status(500).json({ mensaje: "Error al obtener vehículos", error });
  }
};

/**
 * Obtener vehículos destacados (máx 3)
 * GET /vehicles/home
 */
vehiclesController.getHomeVehicles = async (req, res) => {
  try {
    // Obtener los 3 vehículos con más reservas
    // Se asume que el modelo Reserva tiene un campo vehicleId que referencia a Vehicle
    const Reservas = (await import('../models/Reservas.js')).default;
    // Agrupar por vehicleId y contar reservas
    const topVehicles = await Reservas.aggregate([
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
    const vehicle = await Vehicle.findById(req.params.id);
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
      if (req.files?.galleryImages) {
        const files = Array.isArray(req.files.galleryImages)
          ? req.files.galleryImages
          : [req.files.galleryImages[0]];
        const uploadImgsResults = await Promise.all(files.map(file => uploadFromBuffer(file.buffer)));
        return uploadImgsResults.map(result => result.secure_url);
      } else if (req.body.galleryImages) {
        if (Array.isArray(req.body.galleryImages)) {
          return req.body.galleryImages;
        } else if (typeof req.body.galleryImages === 'string') {
          try {
            const parsed = JSON.parse(req.body.galleryImages);
            return Array.isArray(parsed) ? parsed : [req.body.galleryImages];
          } catch {
            return [req.body.galleryImages];
          }
        }
      }
      return [];
    };

    // Procesar imagen principal
    const processSingleImage = async (fileField, bodyField) => {
      if (req.files?.[fileField] && req.files[fileField][0]) {
        const uploadResult = await uploadFromBuffer(req.files[fileField][0].buffer);
        return uploadResult.secure_url;
      } else if (req.body[bodyField]) {
        return req.body[bodyField];
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

    // Validar y convertir dailyPrice a número SOLO si viene en el body
    if (typeof dailyPrice !== 'undefined') {
      const parsedDailyPrice = parseFloat(dailyPrice);
      if (isNaN(parsedDailyPrice) || parsedDailyPrice <= 0) {
        return res.status(400).json({
          message: 'El precio por día debe ser un número positivo',
          field: 'dailyPrice'
        });
      }
      dailyPrice = parsedDailyPrice;
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

    // Preparar datos para actualización
    const updateData = {
      vehicleName,
      dailyPrice: parseFloat(dailyPrice),
      plate: plate?.toUpperCase(),
      brandId,
      vehicleClass,
      color,
      year: parseInt(year),
      capacity: parseInt(capacity),
      model,
      engineNumber,
      chassisNumber,
      vinNumber,
      status
    };

    // Agregar imágenes solo si están presentes
    if (galleryImages && Array.isArray(galleryImages) && galleryImages.length > 0) {
      updateData.galleryImages = galleryImages;
    }
    if (mainViewImage) {
      updateData.mainViewImage = mainViewImage;
    }
    if (sideImage) {
      updateData.sideImage = sideImage;
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
      // Obtener nombre de la marca correctamente
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
 * Descargar el PDF del contrato de arrendamiento para un vehículo
 * GET /vehicles/:id/download-lease-contract
 */
vehiclesController.downloadLeaseContract = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      // No encontrado
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }
    if (!vehicle.leaseContract) {
      return res.status(404).json({ mensaje: "No hay contrato de arrendamiento PDF disponible para este vehículo" });
    }
    let downloadUrl = vehicle.leaseContract;
    if (downloadUrl.includes('cloudinary.com')) {
      downloadUrl = pdfGenerator.getDownloadUrl(downloadUrl);
    }
    return res.status(200).json({ 
      mensaje: "URL de descarga de contrato de arrendamiento generada",
      downloadUrl: downloadUrl,
      vehicle: vehicle.vehicleName,
      plate: vehicle.plate
    });
  } catch (error) {
    // Error interno del servidor
    console.log("Error al obtener contrato de arrendamiento:", error);
    return res.status(500).json({ mensaje: "Error al obtener contrato de arrendamiento", error });
  }
};

export default vehiclesController;