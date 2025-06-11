//Imports
import vehiclesModel from "../models/Vehiculos.js";

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
    let imagenes = [];
    if (req.files && req.files.length > 0) {
    // Guarda la ruta pública de cada imagen subida
      imagenes = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.imagenes) {
      imagenes = Array.isArray(req.body.imagenes) ? req.body.imagenes : [req.body.imagenes];
    }

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