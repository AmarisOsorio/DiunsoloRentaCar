const maintenanceController = {};

import maintenanceModel from "../models/Maintenances.js";
import mongoose from "mongoose";

// Función para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Función para validar fechas
const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
};

// Función para validar que la fecha de inicio sea anterior a la fecha de devolución
const isValidDateRange = (startDate, returnDate) => {
    return new Date(startDate) < new Date(returnDate);
};

//Select - Obtener todos los mantenimientos
maintenanceController.getMaintenances = async (req, res) => {
    try {
        // Obtener mantenimientos con información completa del vehículo poblada
        const maintenances = await maintenanceModel.find()
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate brandId vehicleClass color year model'
            })
            .sort({ creationDate: -1 }); // Mostrar los más recientes primero
        
        // Verificar si existen mantenimientos
        if (!maintenances || maintenances.length === 0) {
            return res.status(200).json({ 
                success: true,
                message: "No se encontraron mantenimientos",
                data: [],
                count: 0
            });
        }

        console.log('Mantenimientos encontrados:', maintenances.length);
        console.log('Primer mantenimiento:', JSON.stringify(maintenances[0], null, 2));

        res.status(200).json({
            success: true,
            data: maintenances,
            count: maintenances.length
        });
    } catch (error) {
        console.error('Error al obtener mantenimientos:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al obtener mantenimientos", 
            error: error.message 
        });
    }
};

// Select by ID - Obtener mantenimiento por ID
maintenanceController.getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de mantenimiento no válido"
            });
        }

        // Buscar mantenimiento por ID con populate completo
        const maintenance = await maintenanceModel.findById(id)
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate brandId vehicleClass color year model'
            });
        
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Mantenimiento no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            data: maintenance
        });
    } catch (error) {
        console.error('Error al obtener mantenimiento por ID:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener el mantenimiento",
            error: error.message
        });
    }
};

//Insert - Crear nuevo mantenimiento
maintenanceController.createMaintenance = async (req, res) => {
    try {
        const { vehicleId, maintenanceType, startDate, returnDate, status } = req.body;

        // Validaciones básicas de campos requeridos
        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                message: "El ID del vehículo es requerido"
            });
        }

        if (!maintenanceType || maintenanceType.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "El tipo de mantenimiento es requerido"
            });
        }

        if (!startDate) {
            return res.status(400).json({
                success: false,
                message: "La fecha de inicio es requerida"
            });
        }

        if (!returnDate) {
            return res.status(400).json({
                success: false,
                message: "La fecha de devolución es requerida"
            });
        }

        // Validar que el vehicleId sea un ObjectId válido
        if (!isValidObjectId(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: "ID de vehículo no válido"
            });
        }

        // Validar fechas
        const parsedStartDate = new Date(startDate);
        const parsedReturnDate = new Date(returnDate);

        if (!isValidDate(parsedStartDate)) {
            return res.status(400).json({
                success: false,
                message: "Fecha de inicio no válida"
            });
        }

        if (!isValidDate(parsedReturnDate)) {
            return res.status(400).json({
                success: false,
                message: "Fecha de devolución no válida"
            });
        }

        // Validar que la fecha de inicio sea anterior a la fecha de devolución
        if (!isValidDateRange(startDate, returnDate)) {
            return res.status(400).json({
                success: false,
                message: "La fecha de inicio debe ser anterior a la fecha de devolución"
            });
        }

        // Validar estado si se proporciona
        if (status && !['Pending', 'Active', 'Completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado no válido. Debe ser: Pending, Active o Completed"
            });
        }

        // Crear nuevo mantenimiento
        const newMaintenance = new maintenanceModel({ 
            vehicleId, 
            maintenanceType: maintenanceType.trim(), 
            startDate: parsedStartDate, 
            returnDate: parsedReturnDate, 
            status: status || 'Pending'
        });

        const savedMaintenance = await newMaintenance.save();
        
        // Poblar el mantenimiento guardado antes de enviarlo
        const populatedMaintenance = await maintenanceModel.findById(savedMaintenance._id)
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate brandId vehicleClass color year model'
            });
        
        res.status(201).json({ 
            success: true,
            message: "Mantenimiento creado exitosamente",
            data: populatedMaintenance
        });
    } catch (error) {
        console.error('Error al crear mantenimiento:', error);
        
        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al crear el mantenimiento", 
            error: error.message 
        });
    }
};

//Update - Actualizar mantenimiento existente
maintenanceController.updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicleId, maintenanceType, startDate, returnDate, status } = req.body;

        // Validar que el ID sea válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de mantenimiento no válido"
            });
        }

        // Verificar que el mantenimiento existe
        const existingMaintenance = await maintenanceModel.findById(id);
        if (!existingMaintenance) {
            return res.status(404).json({
                success: false,
                message: "Mantenimiento no encontrado"
            });
        }

        // Objeto para almacenar los campos a actualizar
        const updateFields = {};

        // Validar y agregar vehicleId si se proporciona
        if (vehicleId !== undefined) {
            if (!isValidObjectId(vehicleId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de vehículo no válido"
                });
            }
            updateFields.vehicleId = vehicleId;
        }

        // Validar y agregar maintenanceType si se proporciona
        if (maintenanceType !== undefined) {
            if (!maintenanceType || maintenanceType.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "El tipo de mantenimiento no puede estar vacío"
                });
            }
            updateFields.maintenanceType = maintenanceType.trim();
        }

        // Validar y agregar fechas si se proporcionan
        if (startDate !== undefined) {
            const parsedStartDate = new Date(startDate);
            if (!isValidDate(parsedStartDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Fecha de inicio no válida"
                });
            }
            updateFields.startDate = parsedStartDate;
        }

        if (returnDate !== undefined) {
            const parsedReturnDate = new Date(returnDate);
            if (!isValidDate(parsedReturnDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Fecha de devolución no válida"
                });
            }
            updateFields.returnDate = parsedReturnDate;
        }

        // Validar rango de fechas si ambas fechas están siendo actualizadas
        const finalStartDate = updateFields.startDate || existingMaintenance.startDate;
        const finalReturnDate = updateFields.returnDate || existingMaintenance.returnDate;
        
        if (!isValidDateRange(finalStartDate, finalReturnDate)) {
            return res.status(400).json({
                success: false,
                message: "La fecha de inicio debe ser anterior a la fecha de devolución"
            });
        }

        // Validar y agregar status si se proporciona
        if (status !== undefined) {
            if (!['Pending', 'Active', 'Completed'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Estado no válido. Debe ser: Pending, Active o Completed"
                });
            }
            updateFields.status = status;
        }

        // Verificar que al menos un campo esté siendo actualizado
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron campos para actualizar"
            });
        }

        // Actualizar mantenimiento
        const updatedMaintenance = await maintenanceModel.findByIdAndUpdate(
            id, 
            updateFields, 
            { new: true, runValidators: true }
        ).populate({
            path: 'vehicleId',
            select: 'vehicleName mainViewImage sideImage galleryImages plate brandId vehicleClass color year model'
        });

        res.status(200).json({ 
            success: true,
            message: "Mantenimiento actualizado exitosamente",
            data: updatedMaintenance
        });
    } catch (error) {
        console.error('Error al actualizar mantenimiento:', error);
        
        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al actualizar el mantenimiento", 
            error: error.message 
        });
    }
};

//Delete - Eliminar mantenimiento
maintenanceController.deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de mantenimiento no válido"
            });
        }

        // Verificar que el mantenimiento existe antes de eliminarlo
        const maintenance = await maintenanceModel.findById(id)
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate brandId vehicleClass color year model'
            });
            
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Mantenimiento no encontrado"
            });
        }

        // Eliminar mantenimiento
        await maintenanceModel.findByIdAndDelete(id);
        
        res.status(200).json({ 
            success: true,
            message: "Mantenimiento eliminado exitosamente",
            data: maintenance
        });
    } catch (error) {
        console.error('Error al eliminar mantenimiento:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al eliminar el mantenimiento", 
            error: error.message 
        });
    }
};

// Get maintenances by vehicle ID - Obtener mantenimientos por ID de vehículo
maintenanceController.getMaintenancesByVehicleId = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        // Validar que el vehicleId sea válido
        if (!isValidObjectId(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: "ID de vehículo no válido"
            });
        }

        // Buscar mantenimientos por vehicleId
        const maintenances = await maintenanceModel.find({ vehicleId })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate brandId vehicleClass color year model'
            })
            .sort({ creationDate: -1 });
        
        res.status(200).json({
            success: true,
            data: maintenances,
            count: maintenances.length
        });
    } catch (error) {
        console.error('Error al obtener mantenimientos por vehículo:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener mantenimientos por vehículo",
            error: error.message
        });
    }
};

// Get maintenances by status - Obtener mantenimientos por estado
maintenanceController.getMaintenancesByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        // Validar que el estado sea válido
        if (!['Pending', 'Active', 'Completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado no válido. Debe ser: Pending, Active o Completed"
            });
        }

        // Buscar mantenimientos por estado
        const maintenances = await maintenanceModel.find({ status })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate brandId vehicleClass color year model'
            })
            .sort({ creationDate: -1 });
        
        res.status(200).json({
            success: true,
            data: maintenances,
            count: maintenances.length
        });
    } catch (error) {
        console.error('Error al obtener mantenimientos por estado:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener mantenimientos por estado",
            error: error.message
        });
    }
};

export default maintenanceController;