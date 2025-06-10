const mantenimientosController = {};

import mantenimientosModel from "../models/Mantenimientos.js";

//Select

mantenimientosController.getMantenimientos = async (req, res) => {
    try {
        const mantenimientos = await mantenimientosModel.find().populate('idVehiculo');
        res.json(mantenimientos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener mantenimientos", error });
    }
};

//Insert

mantenimientosController.insertMantenimientos = async (req, res) => {
    try {
        const { idVehiculo, tipoMantenimiento, fechaInicio, fechaDevolucion, estado } = req.body;
        const newMantenimiento = new mantenimientosModel({ 
            idVehiculo, 
            tipoMantenimiento, 
            fechaInicio, 
            fechaDevolucion, 
            estado,
            fechaCreacion: new Date() 
        });
        await newMantenimiento.save();
        res.json({ message: "mantenimiento saved" });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar mantenimiento", error });
    }
};

//Delete

mantenimientosController.deleteMantenimientos = async (req, res) => {
    try {
        await mantenimientosModel.findByIdAndDelete(req.params.id);
        res.json({ message: "mantenimiento deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar mantenimiento", error });
    }
};

//Update

mantenimientosController.updateMantenimientos = async (req, res) => {
    try {
        const { idVehiculo, tipoMantenimiento, fechaInicio, fechaDevolucion, estado } = req.body;
        const updateMantenimiento = await mantenimientosModel.findByIdAndUpdate(
            req.params.id, 
            { idVehiculo, tipoMantenimiento, fechaInicio, fechaDevolucion, estado }, 
            { new: true }
        );
        res.json({ message: "mantenimiento updated" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar mantenimiento", error });
    }
};

export default mantenimientosController;