//Imports
import vehiclesModel from "../models/Vehiculos.js";
import marcasModel from "../models/Marcas.js";
import { Contratos } from "../models/Contratos.js";
import reservasModel from "../models/Reservas.js";
import { v2 as cloudinary } from 'cloudinary';
import pdfGenerator from '../utils/pdfGenerator.js';

//Cloudinary Config
// OJO: Se utilizara la parte de Cloudinary en el código no importandolo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const vehiclesController = {};

// Función auxiliar para actualizar contratos relacionados con un vehículo
const updateRelatedContracts = async (vehicleId, vehicleData) => {
  try {
    console.log('🔄 Actualizando contratos relacionados con el vehículo:', vehicleId);
    
    // Buscar todas las reservas que incluyen este vehículo
    const reservas = await reservasModel.find({ vehiculoID: vehicleId });
    console.log('📋 Reservas encontradas:', reservas.length);
    
    if (reservas.length === 0) {
      console.log('ℹ️ No se encontraron reservas para este vehículo');
      return { updated: 0, errors: [] };
    }
    
    // Obtener la marca del vehículo para el campo marcaModelo
    let nombreMarca = 'N/A';
    try {
      if (vehicleData.idMarca) {
        const marca = await marcasModel.findById(vehicleData.idMarca);
        nombreMarca = marca ? marca.nombreMarca : 'N/A';
      }
    } catch (error) {
      console.log('⚠️ Error al obtener marca:', error);
    }
    
    const marcaModelo = `${nombreMarca} ${vehicleData.modelo || ''}`.trim();
    
    // Extraer IDs de las reservas
    const reservationIds = reservas.map(r => r._id);
    
    // Buscar contratos relacionados con estas reservas
    const contratos = await Contratos.find({ 
      reservationId: { $in: reservationIds } 
    });
    
    console.log('📄 Contratos encontrados:', contratos.length);
    
    if (contratos.length === 0) {
      console.log('ℹ️ No se encontraron contratos para las reservas de este vehículo');
      return { updated: 0, errors: [] };
    }
    
    let updated = 0;
    let errors = [];
    
    // Actualizar cada contrato
    for (const contrato of contratos) {
      try {
        const updateData = {};
        
        // Actualizar campos en datosHojaEstado si existen
        if (contrato.datosHojaEstado) {
          if (vehicleData.placa && contrato.datosHojaEstado.placa !== vehicleData.placa) {
            updateData['datosHojaEstado.placa'] = vehicleData.placa;
          }
          
          if (marcaModelo && contrato.datosHojaEstado.marcaModelo !== marcaModelo) {
            updateData['datosHojaEstado.marcaModelo'] = marcaModelo;
          }
        }
        
        // Actualizar campos en datosContrato si existen
        if (contrato.datosContrato) {
          if (vehicleData.precioPorDia && contrato.datosContrato.precioDiario !== vehicleData.precioPorDia) {
            updateData['datosContrato.precioDiario'] = vehicleData.precioPorDia;
          }
        }
        
        // Solo actualizar si hay cambios
        if (Object.keys(updateData).length > 0) {
          console.log(`📝 Actualizando contrato ${contrato._id} con:`, updateData);
          
          await Contratos.findByIdAndUpdate(
            contrato._id,
            { $set: updateData },
            { new: true }
          );
          
          updated++;
          console.log(`✅ Contrato ${contrato._id} actualizado`);
        } else {
          console.log(`ℹ️ Contrato ${contrato._id} no requiere actualización`);
        }
        
      } catch (error) {
        console.error(`❌ Error actualizando contrato ${contrato._id}:`, error);
        errors.push({
          contratoId: contrato._id,
          error: error.message
        });
      }
    }
    
    console.log(`✅ Actualización de contratos completada. Actualizados: ${updated}, Errores: ${errors.length}`);
    
    return { updated, errors };
    
  } catch (error) {
    console.error('❌ Error general en updateRelatedContracts:', error);
    return { updated: 0, errors: [{ general: error.message }] };
  }
};

//Select - Get [All]
vehiclesController.getVehicles = async (req, res) => {
  try {
    const vehicles = await vehiclesModel.find();
    
    // Obtener nombre de marcas para cada vehículo
    const vehiclesWithMarca = await Promise.all(
      vehicles.map(async (vehicle) => {
        let nombreMarca = 'N/A';
        try {
          if (vehicle.idMarca) {
            const marca = await marcasModel.findById(vehicle.idMarca);
            nombreMarca = marca ? marca.nombreMarca : 'N/A';
          }
        } catch (error) {
          console.log('Error al obtener marca para vehículo:', vehicle._id, error);
        }
        
        // Convertir a objeto plain y agregar marca
        const vehicleObj = vehicle.toObject();
        vehicleObj.marca = nombreMarca;
        return vehicleObj;
      })
    );
    
    res.json(vehiclesWithMarca);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener vehículos: ", error });
  }
};

//Select - Max 3
vehiclesController.getHomeVehicles = async (req, res) => {
  try {
    const vehicles = await vehiclesModel.find().limit(3);
    
    // Obtener nombre de marcas para cada vehículo
    const vehiclesWithMarca = await Promise.all(
      vehicles.map(async (vehicle) => {
        let nombreMarca = 'N/A';
        try {
          if (vehicle.idMarca) {
            const marca = await marcasModel.findById(vehicle.idMarca);
            nombreMarca = marca ? marca.nombreMarca : 'N/A';
          }
        } catch (error) {
          console.log('Error al obtener marca para vehículo:', vehicle._id, error);
        }
        
        // Convertir a objeto plain y agregar marca
        const vehicleObj = vehicle.toObject();
        vehicleObj.marca = nombreMarca;
        return vehicleObj;
      })
    );
    
    res.json(vehiclesWithMarca);
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
    
    // Obtener nombre de la marca
    let nombreMarca = 'N/A';
    try {
      if (vehicle.idMarca) {
        const marca = await marcasModel.findById(vehicle.idMarca);
        nombreMarca = marca ? marca.nombreMarca : 'N/A';
      }
    } catch (error) {
      console.log('Error al obtener marca para vehículo:', vehicle._id, error);
    }
    
    // Convertir a objeto plain y agregar marca
    const vehicleObj = vehicle.toObject();
    vehicleObj.marca = nombreMarca;
    
    res.json(vehicleObj);
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
      vehiculo: newVehicle,
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
    const vehicleToDelete = await vehiclesModel.findById(req.params.id);
    if (!vehicleToDelete) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    
    await vehiclesModel.findByIdAndDelete(req.params.id);
    res.json({ 
      message: "Vehículo eliminado exitosamente",
      vehiculo: vehicleToDelete 
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar vehículo: ", error });
  }
};

//Update - Put
vehiclesController.updateVehicle = async (req, res) => {
  try {
    console.log('🔄 Actualizando vehículo:', req.params.id);
    console.log('📝 Datos recibidos:', req.body);
    console.log('📝 Headers:', req.headers);
    
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

    // Validar estados permitidos
    const validStates = ['Disponible', 'Reservado', 'Mantenimiento'];
    if (estado && !validStates.includes(estado)) {
      console.log('❌ Estado inválido:', estado);
      return res.status(400).json({ 
        message: `Estado inválido: ${estado}. Estados válidos: ${validStates.join(', ')}` 
      });
    }

    console.log('✅ Estado válido:', estado);

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

    // Regenerar PDF del contrato si hay cambios en datos relevantes
    let shouldRegeneratePDF = false;
    const pdfRelevantFields = ['nombreVehiculo', 'placa', 'clase', 'idMarca', 'color', 'anio', 'capacidad', 'modelo', 'numeroMotor', 'numeroChasisGrabado', 'numeroVinChasis'];
    
    // Obtener el vehículo actual para comparar
    const currentVehicle = await vehiclesModel.findById(req.params.id);
    if (!currentVehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    // Verificar si algún campo relevante para el PDF ha cambiado
    for (const field of pdfRelevantFields) {
      if (updateData[field] !== undefined && updateData[field] !== currentVehicle[field]) {
        shouldRegeneratePDF = true;
        console.log(`🔄 Campo ${field} cambió de "${currentVehicle[field]}" a "${updateData[field]}" - regenerando PDF`);
        break;
      }
    }

    // Regenerar PDF si es necesario
    if (shouldRegeneratePDF) {
      try {
        console.log('🔄 Regenerando PDF del contrato...');
        
        // Obtener información de la marca
        let nombreMarca = '';
        try {
          if (updateData.idMarca || currentVehicle.idMarca) {
            const marcaId = updateData.idMarca || currentVehicle.idMarca;
            const marca = await marcasModel.findById(marcaId);
            nombreMarca = marca ? marca.nombreMarca : 'N/A';
          }
        } catch (error) {
          console.log('Error al obtener marca:', error);
          nombreMarca = 'N/A';
        }

        // Preparar datos para el PDF con los nuevos valores
        const vehiculoDataForPdf = {
          nombreVehiculo: updateData.nombreVehiculo || currentVehicle.nombreVehiculo,
          placa: updateData.placa || currentVehicle.placa,
          clase: updateData.clase || currentVehicle.clase,
          marca: nombreMarca,
          color: updateData.color || currentVehicle.color,
          anio: updateData.anio || currentVehicle.anio,
          capacidad: updateData.capacidad || currentVehicle.capacidad,
          modelo: updateData.modelo || currentVehicle.modelo,
          numeroMotor: updateData.numeroMotor || currentVehicle.numeroMotor,
          numeroChasisGrabado: updateData.numeroChasisGrabado || currentVehicle.numeroChasisGrabado,
          numeroVinChasis: updateData.numeroVinChasis || currentVehicle.numeroVinChasis
        };
        
        console.log('📄 Datos para PDF:', vehiculoDataForPdf);
        
        console.log('🔄 Iniciando generación de PDF...');
        const contratoArrendamientoPdfUrl = await pdfGenerator.generateContratoArrendamiento(vehiculoDataForPdf);
        console.log('✅ PDF regenerado correctamente:', contratoArrendamientoPdfUrl);
        console.log('🔍 Verificando URL del PDF regenerado:');
        console.log('  - Contiene cloudinary.com:', contratoArrendamientoPdfUrl.includes('cloudinary.com'));
        console.log('  - Contiene /raw/upload/:', contratoArrendamientoPdfUrl.includes('/raw/upload/'));
        console.log('  - Longitud de URL:', contratoArrendamientoPdfUrl.length);
        console.log('  - URL completa:', contratoArrendamientoPdfUrl);
        
        // Verificar que la URL no es una URL de descarga transformada
        if (contratoArrendamientoPdfUrl.includes('fl_attachment')) {
          console.error('❌ ERROR: Se está devolviendo una URL de descarga en lugar de la URL original del archivo');
          console.error('❌ URL problemática:', contratoArrendamientoPdfUrl);
          // Limpiar la URL removiendo fl_attachment
          const cleanUrl = contratoArrendamientoPdfUrl.replace('/fl_attachment', '');
          console.log('🔧 URL limpia generada:', cleanUrl);
          updateData.contratoArrendamientoPdf = cleanUrl;
        } else {
          // Agregar la nueva URL del PDF a los datos de actualización
          updateData.contratoArrendamientoPdf = contratoArrendamientoPdfUrl;
        }
        
      } catch (error) {
        console.error('❌ Error al regenerar PDF:', error);
        // Continuar con la actualización sin el PDF si hay error
      }
    } else {
      console.log('ℹ️ No es necesario regenerar el PDF - no hay cambios en campos relevantes');
    }

    const updatedVehicle = await vehiclesModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    
    console.log('✅ Vehículo actualizado exitosamente');
    
    // Actualizar contratos relacionados
    console.log('🔗 Iniciando actualización de contratos relacionados...');
    const contractUpdateResult = await updateRelatedContracts(req.params.id, updateData);
    
    let responseMessage = "Vehículo actualizado exitosamente";
    if (contractUpdateResult.updated > 0) {
      responseMessage += `. Se actualizaron ${contractUpdateResult.updated} contrato(s) relacionado(s)`;
    }
    
    if (contractUpdateResult.errors.length > 0) {
      console.warn('⚠️ Algunos contratos no pudieron actualizarse:', contractUpdateResult.errors);
      responseMessage += `. Advertencia: ${contractUpdateResult.errors.length} contrato(s) tuvieron errores al actualizarse`;
    }
    
    res.json({ 
      message: responseMessage, 
      vehiculo: updatedVehicle,
      contractsUpdated: contractUpdateResult.updated,
      contractErrors: contractUpdateResult.errors
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

//Update Status Only - Patch
vehiclesController.updateVehicleStatus = async (req, res) => {
  try {
    console.log('🔄 Iniciando actualización de estado del vehículo');
    console.log('📝 Vehicle ID recibido:', req.params.id);
    console.log('📝 Longitud del ID:', req.params.id?.length);
    console.log('📝 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('📝 Nuevo estado:', req.body.estado);
    console.log('📝 Tipo de estado:', typeof req.body.estado);
    
    const { estado } = req.body;
    
    // Validar que el ID tenga el formato correcto de MongoDB ObjectId
    if (!req.params.id || req.params.id.length !== 24) {
      console.log('❌ ID de vehículo inválido:', req.params.id);
      return res.status(400).json({ 
        message: `ID de vehículo inválido: ${req.params.id}` 
      });
    }
    
    // Validar estados permitidos
    const validStates = ['Disponible', 'Reservado', 'Mantenimiento'];
    if (!estado || !validStates.includes(estado)) {
      console.log('❌ Estado inválido:', estado);
      return res.status(400).json({ 
        message: `Estado inválido: ${estado}. Estados válidos: ${validStates.join(', ')}` 
      });
    }

    console.log('✅ Validaciones pasadas, actualizando vehículo...');

    const updatedVehicle = await vehiclesModel.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      console.log('❌ Vehículo no encontrado con ID:', req.params.id);
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    
    console.log('✅ Estado del vehículo actualizado exitosamente:', updatedVehicle.estado);
    
    // Para cambios de estado, no necesitamos actualizar contratos ya que el estado del vehículo
    // generalmente no se refleja directamente en los contratos existentes
    // Los contratos mantienen su estado independiente del vehículo
    
    console.log('✅ Vehículo completo:', JSON.stringify(updatedVehicle, null, 2));
    
    res.json({ 
      message: "Estado del vehículo actualizado exitosamente", 
      vehiculo: updatedVehicle 
    });
  } catch (error) {
    console.error('❌ Error completo al actualizar estado del vehículo:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      message: "Error al actualizar estado del vehículo", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

    // Obtener el archivo directamente desde Cloudinary y enviarlo como respuesta
    const pdfUrl = vehicle.contratoArrendamientoPdf;
    
    try {
      const fetch = (await import('node-fetch')).default;
      
      console.log('📥 Descargando PDF desde Cloudinary:', pdfUrl);
      const response = await fetch(pdfUrl);
      
      if (!response.ok) {
        throw new Error(`Error al obtener PDF desde Cloudinary: ${response.status}`);
      }
      
      // Crear nombre de archivo amigable
      const vehicleName = vehicle.nombreVehiculo?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'vehiculo';
      const placa = vehicle.placa?.replace(/[^a-zA-Z0-9]/g, '') || 'SIN_PLACA';
      const fileName = `Contrato_Arrendamiento_${vehicleName}_${placa}.pdf`;
      
      // Configurar headers para descarga de archivo
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      
      console.log('📤 Enviando PDF al cliente:', fileName);
      
      // Stream del archivo al cliente
      response.body.pipe(res);
      
    } catch (fetchError) {
      console.error('❌ Error al obtener archivo PDF:', fetchError);
      
      // Fallback: devolver URL con fl_attachment
      let downloadUrl = pdfUrl;
      if (downloadUrl.includes('/upload/') && !downloadUrl.includes('fl_attachment')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      
      res.json({ 
        message: "URL de descarga generada (fallback)",
        downloadUrl: downloadUrl,
        vehiculo: vehicle.nombreVehiculo,
        placa: vehicle.placa
      });
    }
    
  } catch (error) {
    res.status(500).json({ message: "Error al obtener contrato: ", error });
    console.log("Error al obtener contrato:", error);
  }
};

//Test PDF generation
vehiclesController.testPdfGeneration = async (req, res) => {
  try {
    console.log('🧪 Iniciando prueba de generación de PDF...');
    
    // Datos de prueba
    const testVehicleData = {
      nombreVehiculo: 'CHEVROLET TRAVERSE EDITADO TEST',
      placa: 'TEST-123',
      clase: 'SUV',
      marca: 'CHEVROLET',
      color: 'Blanco',
      anio: 2024,
      capacidad: 7,
      modelo: 'TRAVERSE',
      numeroMotor: 'TEST-MOTOR-123',
      numeroChasisGrabado: 'TEST-CHASIS-456',
      numeroVinChasis: 'TEST-VIN-789'
    };
    
    console.log('📝 Datos de prueba:', testVehicleData);
    
    // Generar PDF
    const pdfUrl = await pdfGenerator.generateContratoArrendamiento(testVehicleData);
    
    console.log('✅ PDF de prueba generado exitosamente');
    console.log('🔗 URL del PDF:', pdfUrl);
    
    res.json({
      success: true,
      message: 'PDF de prueba generado exitosamente',
      pdfUrl: pdfUrl,
      testData: testVehicleData
    });
    
  } catch (error) {
    console.error('❌ Error en prueba de PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando PDF de prueba',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

//Debug PDF analysis
vehiclesController.debugPdfAnalysis = async (req, res) => {
  try {
    const vehicle = await vehiclesModel.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    if (!vehicle.contratoArrendamientoPdf) {
      return res.status(404).json({ message: "No hay contrato PDF disponible para este vehículo" });
    }

    const pdfUrl = vehicle.contratoArrendamientoPdf;
    
    // Analizar la URL
    const analysis = {
      vehicleId: vehicle._id,
      vehicleName: vehicle.nombreVehiculo,
      placa: vehicle.placa,
      originalUrl: pdfUrl,
      isCloudinaryUrl: pdfUrl.includes('cloudinary.com'),
      isRawUpload: pdfUrl.includes('/raw/upload/'),
      downloadUrl: pdfUrl.includes('cloudinary.com') 
        ? pdfUrl.replace('/upload/', '/upload/fl_attachment/')
        : pdfUrl,
    };

    // Verificar accesibilidad
    try {
      const fetch = (await import('node-fetch')).default;
      
      // Verificar URL original
      const originalResponse = await fetch(pdfUrl, { method: 'HEAD' });
      analysis.originalFile = {
        accessible: originalResponse.ok,
        status: originalResponse.status,
        contentType: originalResponse.headers.get('content-type'),
        contentLength: originalResponse.headers.get('content-length'),
        sizeInKB: Math.round(parseInt(originalResponse.headers.get('content-length') || '0') / 1024)
      };

      // Verificar URL de descarga
      const downloadResponse = await fetch(analysis.downloadUrl, { method: 'HEAD' });
      analysis.downloadFile = {
        accessible: downloadResponse.ok,
        status: downloadResponse.status,
        contentType: downloadResponse.headers.get('content-type'),
        contentLength: downloadResponse.headers.get('content-length'),
        sizeInKB: Math.round(parseInt(downloadResponse.headers.get('content-length') || '0') / 1024)
      };

      // Comparar tamaños
      analysis.filesMatch = analysis.originalFile.contentLength === analysis.downloadFile.contentLength;

    } catch (fetchError) {
      analysis.fetchError = fetchError.message;
    }

    res.json({
      message: "Análisis de PDF completado",
      analysis: analysis
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error en análisis de PDF", 
      error: error.message 
    });
  }
};

// Generar PDF de vehículo específico
vehiclesController.generateVehiclePDF = async (req, res) => {
  try {
    console.log('📄 Generando PDF para vehículo:', req.params.id);
    
    // Buscar el vehículo
    const vehicle = await vehiclesModel.findById(req.params.id).populate('idMarca');
    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: "Vehículo no encontrado" 
      });
    }

    // Preparar datos del vehículo para el PDF
    const vehicleData = {
      nombreVehiculo: vehicle.nombreVehiculo,
      placa: vehicle.placa,
      clase: vehicle.clase,
      marca: vehicle.idMarca?.nombreMarca || vehicle.marca || 'N/A',
      color: vehicle.color,
      anio: vehicle.anio,
      capacidad: vehicle.capacidad,
      modelo: vehicle.modelo,
      numeroMotor: vehicle.numeroMotor,
      numeroChasisGrabado: vehicle.numeroChasisGrabado,
      numeroVinChasis: vehicle.numeroVinChasis,
      transmision: vehicle.transmision,
      combustible: vehicle.combustible,
      motor: vehicle.motor,
      kilometraje: vehicle.kilometraje,
      precioPorDia: vehicle.precioPorDia,
      estado: vehicle.estado,
      descripcion: vehicle.descripcion
    };

    console.log('📝 Datos del vehículo para PDF:', vehicleData);
    
    // Generar PDF usando el generador existente
    const pdfUrl = await pdfGenerator.generateContratoArrendamiento(vehicleData);
    
    console.log('✅ PDF del vehículo generado exitosamente');
    console.log('🔗 URL del PDF:', pdfUrl);

    // También devolver el buffer del PDF para descarga directa
    const fs = await import('fs');
    const path = await import('path');
    
    // Extraer el nombre del archivo de la URL
    const urlParts = pdfUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="vehiculo_${vehicle.nombreVehiculo || vehicle.marca + '_' + vehicle.modelo}_${Date.now()}.pdf"`);
      
      // Enviar el archivo
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // Si no se encuentra el archivo físico, devolver la URL
      res.json({
        success: true,
        message: 'PDF generado exitosamente',
        pdfUrl: pdfUrl,
        vehicleData: vehicleData
      });
    }
    
  } catch (error) {
    console.error('❌ Error generando PDF del vehículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el PDF del vehículo',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export default vehiclesController;