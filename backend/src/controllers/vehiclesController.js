//Imports
import vehiclesModel from "../models/Vehiculos.js";
import { v2 as cloudinary } from "cloudinary";

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
    // req.files es un array de archivos subidos por multer
    let imagenes = [];
    if (req.files && req.files.length > 0) {
      // Subir cada imagen a Cloudinary y guardar las URLs
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "vehiculos"
        });
        imagenes.push(uploadResult.secure_url);
      }
    } else if (req.body.imagenes) {
      // Si se envían URLs directamente (opcional)
      imagenes = Array.isArray(req.body.imagenes) ? req.body.imagenes : [req.body.imagenes];
    }

    const {
      nombre_vehiculo,
      precio_por_dia,
      placa,
      id_marca,
      clase,
      color,
      año,
      capacidad,
      modelo,
      numero_motor,
      numero_chasis_grabado,
      numero_vin_chasis,
      contratoArrendamientoPDF,
      estado
    } = req.body;

    const newVehicle = new vehiclesModel({
      imagenes,
      nombre_vehiculo,
      precio_por_dia,
      placa,
      id_marca,
      clase,
      color,
      año,
      capacidad,
      modelo,
      numero_motor,
      numero_chasis_grabado,
      numero_vin_chasis,
      contratoArrendamientoPDF,
      estado
    });

    await newVehicle.save();
    res.status(201).json({ message: "Vehículo agregado exitosamente" });
  } catch (error) {
    res.status(400).json({ message: "Error al agregar vehículo: ", error });
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
  const {
    imagenes,
    nombre_vehiculo,
    precio_por_dia,
    placa,
    id_marca,
    clase,
    color,
    año,
    capacidad,
    modelo,
    numero_motor,
    numero_chasis_grabado,
    numero_vin_chasis,
    contratoArrendamientoPDF,
    estado
  } = req.body;

  try {
    const updatedVehicle = await vehiclesModel.findByIdAndUpdate(
      req.params.id,
      {
        imagenes,
        nombre_vehiculo,
        precio_por_dia,
        placa,
        id_marca,
        clase,
        color,
        año,
        capacidad,
        modelo,
        numero_motor,
        numero_chasis_grabado,
        numero_vin_chasis,
        contratoArrendamientoPDF,
        estado
      },
      { new: true }
    );
    
    res.json({ message: "Vehículo actualizado exitosamente: ", updatedVehicle });
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar vehículo: ", error });
  }
};

export default vehiclesController;