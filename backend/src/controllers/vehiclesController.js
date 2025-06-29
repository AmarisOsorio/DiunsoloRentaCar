//Imports
import vehiclesModel from "../models/Vehiculos.js";
import { v2 as cloudinary } from 'cloudinary';

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

    // Si llegan archivos, súbelos a Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        cloudinary.uploader.upload(file.path, { folder: 'vehiculos' })
      );
      const uploadResults = await Promise.all(uploadPromises);
      imagenes = uploadResults.map(result => result.secure_url);
    } 
    // Si llegan imagenes en el body (como string o array de URLs)
    else if (req.body && req.body.imagenes) {
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

    const newVehicle = new vehiclesModel({
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
      contratoArrendamientoPdf,
      estado
    });

    await newVehicle.save();
    res.status(201).json({ message: "Vehículo agregado exitosamente" });
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
  const {
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
    contratoArrendamientoPdf,
    estado
  } = req.body;

  try {
    const updatedVehicle = await vehiclesModel.findByIdAndUpdate(
      req.params.id,
      {
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
        contratoArrendamientoPdf,
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