//Imports
import vehiclesModel from "../models/Vehiculos.js";
import marcasModel from "../models/Marcas.js";
import { v2 as cloudinary } from 'cloudinary';
import pdfGenerator from '../utils/pdfGenerator.js';

//Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const vehiclesController = {};

//Select - Get [All]
vehiclesController.getVehicles = async (req, res) => {
  try {
    const vehicles = await vehiclesModel.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener vehículos: ", error });
  }
};

//Select - Max 3
vehiclesController.getHomeVehicles = async (req, res) => {
  try {
    const vehicles = await vehiclesModel.find().limit(3);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener vehículos: ", error });
    console.log("Error al obtener vehículos:", error);
  }
};


//Select - Get [By ID]
vehiclesController.getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehiclesModel.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener vehículo: ", error });
  }
};

//Insert - Post
vehiclesController.addVehicle = async (req, res) => {
  try {
    let imagenes = [];
    let imagenVista3_4 = '';
    let imagenLateral = '';

    // Si llegan archivos, súbelos a Cloudinary directamente desde memoria
    if (req.files && Object.keys(req.files).length > 0) {
      console.log('📁 Subiendo imágenes a Cloudinary...');
      
      // Función helper para subir archivos desde buffer
      const uploadFromBuffer = async (fileBuffer, folder = 'vehiculos') => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: folder,
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(fileBuffer);
        });
      };

      // Manejo de campos múltiples y únicos
      // imagenes[] puede ser array, imagenVista3/4 e imagenLateral son archivos únicos
      if (Array.isArray(req.files.imagenes)) {
        const uploadImgs = req.files.imagenes.map(file =>
          uploadFromBuffer(file.buffer)
        );
        const uploadImgsResults = await Promise.all(uploadImgs);
        imagenes = uploadImgsResults.map(result => result.secure_url);
        console.log(`✅ ${imagenes.length} imágenes principales subidas a Cloudinary`);
      } else if (req.files.imagenes) {
        // Si solo hay una imagen en imagenes
        const uploadImg = await uploadFromBuffer(req.files.imagenes[0].buffer);
        imagenes = [uploadImg.secure_url];
        console.log('✅ 1 imagen principal subida a Cloudinary');
      }
      
      if (req.files.imagenVista3_4 && req.files.imagenVista3_4[0]) {
        const uploadRender = await uploadFromBuffer(req.files.imagenVista3_4[0].buffer);
        imagenVista3_4 = uploadRender.secure_url;
        console.log('✅ Imagen vista 3/4 subida a Cloudinary');
      }
      
      if (req.files.imagenLateral && req.files.imagenLateral[0]) {
        const uploadLateral = await uploadFromBuffer(req.files.imagenLateral[0].buffer);
        imagenLateral = uploadLateral.secure_url;
        console.log('✅ Imagen lateral subida a Cloudinary');
      }
    }
    // Si llegan imagenes como URLs en el body (FormData con strings)
    else {
      console.log('📦 Procesando imágenes desde body...');
      console.log('� Full body data:', req.body);
      
      // Procesar imagenes galería
      if (req.body.imagenes) {
        if (Array.isArray(req.body.imagenes)) {
          imagenes = req.body.imagenes;
        } else if (typeof req.body.imagenes === 'string') {
          try {
            const parsed = JSON.parse(req.body.imagenes);
            imagenes = Array.isArray(parsed) ? parsed : [req.body.imagenes];
          } catch {
            imagenes = [req.body.imagenes];
          }
        }
      }
      
      // Procesar imágenes principales
      imagenVista3_4 = req.body.imagenVista3_4 || '';
      imagenLateral = req.body.imagenLateral || '';
      
      console.log('📄 Body data processed:');
      console.log('- imagenVista3_4:', imagenVista3_4);
      console.log('- imagenLateral:', imagenLateral);
      console.log('- imagenes:', imagenes);
    }

    // Procesar body data como fallback (para auto-upload con URLs)
    if (!imagenVista3_4 && req.body.imagenVista3_4) {
      imagenVista3_4 = req.body.imagenVista3_4;
      console.log('📄 Using imagenVista3_4 from body as fallback:', imagenVista3_4);
    }
    
    if (!imagenLateral && req.body.imagenLateral) {
      imagenLateral = req.body.imagenLateral;
      console.log('📄 Using imagenLateral from body as fallback:', imagenLateral);
    }

    if (!Array.isArray(imagenes)) imagenes = [];

    const {
      nombreVehiculo,
      precioPorDia,
      placa,
      idMarca,
      clase,
      color,
      anio,
      capacidad,
      modelo,
      numeroMotor,
      numeroChasisGrabado,
      numeroVinChasis,
      contratoArrendamientoPdf,
      estado
    } = req.body;

    // Validar que existan las imágenes principales
    console.log('🔍 Validating images:');
    console.log('- imagenVista3_4:', imagenVista3_4, 'length:', imagenVista3_4?.length);
    console.log('- imagenLateral:', imagenLateral, 'length:', imagenLateral?.length);
    
    if (!imagenVista3_4 || !imagenLateral) {
      console.log('❌ Validation failed - missing images');
      return res.status(400).json({ message: "Faltan imagenVista3/4 o imagenLateral" });
    }

    // Obtener información de la marca para el PDF
    let nombreMarca = '';
    try {
      if (idMarca) {
        const marca = await marcasModel.findById(idMarca);
        nombreMarca = marca ? marca.nombreMarca : 'N/A';
      }
    } catch (error) {
      console.log('Error al obtener marca:', error);
      nombreMarca = 'N/A';
    }

    // Generar PDF del contrato de arrendamiento
    let contratoArrendamientoPdfUrl = '';
    try {
      const vehiculoDataForPdf = {
        nombreVehiculo,
        placa,
        clase,
        marca: nombreMarca,
        color,
        anio,
        capacidad,
        modelo,
        numeroMotor,
        numeroChasisGrabado,
        numeroVinChasis
      };
      
      contratoArrendamientoPdfUrl = await pdfGenerator.generateContratoArrendamiento(vehiculoDataForPdf);
      console.log('PDF generado correctamente:', contratoArrendamientoPdfUrl);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      // Continuar sin el PDF si hay error
    }

    const newVehicle = new vehiclesModel({
      imagenVista3_4,
      imagenLateral,
      imagenes,
      nombreVehiculo,
      precioPorDia,
      placa,
      idMarca,
      clase,
      color,
      anio,
      capacidad,
      modelo,
      numeroMotor,
      numeroChasisGrabado,
      numeroVinChasis,
      contratoArrendamientoPdf: contratoArrendamientoPdfUrl || contratoArrendamientoPdf || '',
      estado
    });

    await newVehicle.save();
    res.status(201).json({ 
      message: "Vehículo agregado exitosamente",
      contratoGenerado: !!contratoArrendamientoPdfUrl,
      contratoUrl: contratoArrendamientoPdfUrl
    });
  } catch (error) {
    res.status(400).json({ message: "Error al agregar vehículo: ", error });
    console.log("Error al agregar vehículo:", error);
  }
};

//Delete
vehiclesController.deleteVehicle = async (req, res) => {
  try {
    await vehiclesModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehículo eliminado exitosamente: " });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar vehículo: ", error });
  }
};

//Update - Put
vehiclesController.updateVehicle = async (req, res) => {
  try {
    console.log('🔄 Actualizando vehículo:', req.params.id);
    console.log('📝 Datos recibidos:', req.body);
    
    // Extraer datos del body - ahora manejamos tanto FormData como JSON
    let {
      imagenes,
      imagenVista3_4,
      imagenLateral,
      nombreVehiculo,
      precioPorDia,
      placa,
      idMarca,
      clase,
      color,
      anio,
      capacidad,
      modelo,
      numeroMotor,
      numeroChasisGrabado,
      numeroVinChasis,
      contratoArrendamientoPdf,
      estado
    } = req.body;

    // Procesar imagenes si viene como string JSON
    if (typeof imagenes === 'string') {
      try {
        imagenes = JSON.parse(imagenes);
      } catch (e) {
        console.log('❌ Error parsing imagenes JSON:', e);
        imagenes = [];
      }
    }

    // Preparar datos para actualización
    const updateData = {
      nombreVehiculo,
      precioPorDia: parseFloat(precioPorDia),
      placa: placa?.toUpperCase(),
      idMarca,
      clase,
      color,
      anio: parseInt(anio),
      capacidad: parseInt(capacidad),
      modelo,
      numeroMotor,
      numeroChasisGrabado,
      numeroVinChasis,
      estado
    };

    // Agregar imágenes solo si están presentes
    if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      updateData.imagenes = imagenes;
    }
    
    if (imagenVista3_4) {
      updateData.imagenVista3_4 = imagenVista3_4;
    }
    
    if (imagenLateral) {
      updateData.imagenLateral = imagenLateral;
    }

    if (contratoArrendamientoPdf) {
      updateData.contratoArrendamientoPdf = contratoArrendamientoPdf;
    }

    console.log('📊 Datos para actualizar:', updateData);

    const updatedVehicle = await vehiclesModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    
    console.log('✅ Vehículo actualizado exitosamente');
    res.json({ 
      message: "Vehículo actualizado exitosamente", 
      vehiculo: updatedVehicle 
    });
  } catch (error) {
    console.error('❌ Error al actualizar vehículo:', error);
    res.status(500).json({ 
      message: "Error al actualizar vehículo", 
      error: error.message,
      details: error
    });
  }
};

//Regenerar contrato PDF
vehiclesController.regenerateContrato = async (req, res) => {
  try {
    const vehicle = await vehiclesModel.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    // Obtener información de la marca
    let nombreMarca = '';
    try {
      if (vehicle.idMarca) {
        const marca = await marcasModel.findById(vehicle.idMarca);
        nombreMarca = marca ? marca.nombreMarca : 'N/A';
      }
    } catch (error) {
      console.log('Error al obtener marca:', error);
      nombreMarca = 'N/A';
    }

    // Generar nuevo PDF
    const vehiculoDataForPdf = {
      nombreVehiculo: vehicle.nombreVehiculo,
      placa: vehicle.placa,
      clase: vehicle.clase,
      marca: nombreMarca,
      color: vehicle.color,
      anio: vehicle.anio,
      capacidad: vehicle.capacidad,
      modelo: vehicle.modelo,
      numeroMotor: vehicle.numeroMotor,
      numeroChasisGrabado: vehicle.numeroChasisGrabado,
      numeroVinChasis: vehicle.numeroVinChasis
    };
    
    const contratoArrendamientoPdfUrl = await pdfGenerator.generateContratoArrendamiento(vehiculoDataForPdf);
    
    // Actualizar el vehículo con la nueva URL del PDF
    vehicle.contratoArrendamientoPdf = contratoArrendamientoPdfUrl;
    await vehicle.save();

    res.json({ 
      message: "Contrato regenerado exitosamente",
      contratoUrl: contratoArrendamientoPdfUrl
    });
  } catch (error) {
    res.status(500).json({ message: "Error al regenerar contrato: ", error });
    console.log("Error al regenerar contrato:", error);
  }
};

//Descargar contrato PDF
vehiclesController.downloadContrato = async (req, res) => {
  try {
    const vehicle = await vehiclesModel.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    if (!vehicle.contratoArrendamientoPdf) {
      return res.status(404).json({ message: "No hay contrato PDF disponible para este vehículo" });
    }

    // Si es URL de Cloudinary, crear URL de descarga directa
    let downloadUrl = vehicle.contratoArrendamientoPdf;
    if (downloadUrl.includes('cloudinary.com')) {
      downloadUrl = pdfGenerator.getDownloadUrl(downloadUrl);
    }

    res.json({ 
      message: "URL de descarga generada",
      downloadUrl: downloadUrl,
      vehiculo: vehicle.nombreVehiculo,
      placa: vehicle.placa
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener contrato: ", error });
    console.log("Error al obtener contrato:", error);
  }
};

export default vehiclesController;