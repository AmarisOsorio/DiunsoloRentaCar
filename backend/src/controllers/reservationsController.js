const reservationsController = {};

import reservationsModel from "../models/Reservations.js";
import clientesModel from "../models/Clients.js";
import vehiculosModel from "../models/Vehicles.js";
import { Contratos } from "../models/Contratos.js";
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

//Select - Obtener todas las reservas
reservationsController.getReservations = async (req, res) => {
    try {
        const reservations = await reservationsModel.find()
            .populate({
                path: 'clientId',
                select: 'nombre apellido telefono correo'
            })
            .populate({
                path: 'vehicleId',
                select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad'
            })
            .sort({ creationDate: -1 }); // Mostrar las más recientes primero
        
        // Verificar si existen reservas
        if (!reservations || reservations.length === 0) {
            return res.status(200).json({ 
                success: true,
                message: "No se encontraron reservas",
                data: [],
                count: 0
            });
        }

        console.log('Reservas encontradas:', reservations.length);

        res.status(200).json({
            success: true,
            data: reservations,
            count: reservations.length
        });
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al obtener reservas", 
            error: error.message 
        });
    }
};

// Select by ID - Obtener reserva por ID
reservationsController.getReservationById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reserva no válido"
            });
        }

        // Buscar reserva por ID con populate completo
        const reservation = await reservationsModel.findById(id)
            .populate({
                path: 'clientId',
                select: 'nombre apellido telefono correo'
            })
            .populate({
                path: 'vehicleId',
                select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad'
            });
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reserva no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error('Error al obtener reserva por ID:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener la reserva",
            error: error.message
        });
    }
};

//Insert - Crear nueva reserva
reservationsController.createReservation = async (req, res) => {
    try {
        const {
            clientId,
            vehicleId,
            startDate,
            returnDate,
            status,
            pricePerDay
        } = req.body;

        // Validaciones básicas de campos requeridos
        if (!clientId) {
            return res.status(400).json({
                success: false,
                message: "El ID del cliente es requerido"
            });
        }

        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                message: "El ID del vehículo es requerido"
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

        if (!pricePerDay || pricePerDay <= 0) {
            return res.status(400).json({
                success: false,
                message: "El precio por día es requerido y debe ser mayor a 0"
            });
        }

        // Validar que los IDs sean ObjectIds válidos
        if (!isValidObjectId(clientId)) {
            return res.status(400).json({
                success: false,
                message: "ID de cliente no válido"
            });
        }

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

        // Usar los datos del cliente que vienen del frontend (cliente beneficiario)
        // Si no vienen datos del cliente, usar los del usuario autenticado como fallback
        let clientData = req.body.client || null;

        if (!clientData || !Array.isArray(clientData) || clientData.length === 0) {
            // Fallback: usar datos del usuario autenticado si no se proporcionaron datos del cliente
            try {
                const usuarioAutenticado = await clientesModel.findById(clientId);
                if (!usuarioAutenticado) {
                    return res.status(404).json({ 
                        success: false,
                        message: "Usuario autenticado no encontrado" 
                    });
                }
                clientData = [{
                    name: usuarioAutenticado.nombre + (usuarioAutenticado.apellido ? (" " + usuarioAutenticado.apellido) : ""),
                    phone: usuarioAutenticado.telefono,
                    email: usuarioAutenticado.correo
                }];
                console.log('Usando datos del usuario autenticado como fallback:', clientData);
            } catch (err) {
                return res.status(500).json({ 
                    success: false,
                    message: "Error buscando usuario autenticado", 
                    error: err.message 
                });
            }
        } else {
            console.log('Usando datos del cliente del formulario:', clientData);
        }

        // Crear nueva reserva
        const newReservation = new reservationsModel({
            clientId,
            client: clientData, // Ya es un array
            vehicleId,
            startDate: parsedStartDate,
            returnDate: parsedReturnDate,
            status: status || 'Pending',
            pricePerDay
        });

        const savedReservation = await newReservation.save();
        
        // Generar contrato automáticamente
        try {
            // Obtener datos completos del vehículo para el contrato
            const vehiculo = await vehiculosModel.findById(vehicleId);
            const cliente = await clientesModel.findById(clientId);
            
            if (vehiculo && cliente) {
                // Calcular días de alquiler
                const dias = Math.ceil((new Date(returnDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
                
                // Usar datos del cliente beneficiario para el contrato
                const clienteContrato = clientData[0]; // Primer elemento del array client
                const nombreParaContrato = clienteContrato.name;
                const correoParaContrato = clienteContrato.email;
                
                // Crear el contrato básico
                const nuevoContrato = new Contratos({
                    reservationId: savedReservation._id.toString(),
                    datosArrendamiento: {
                        nombreArrendatario: nombreParaContrato,
                        direccionArrendatario: cliente.direccion || '',
                        numeroPasaporte: cliente.numeroPasaporte || '',
                        numeroLicencia: cliente.numeroLicencia || '',
                        fechaEntrega: startDate,
                        precioDiario: pricePerDay,
                        montoTotal: dias * pricePerDay,
                        diasAlquiler: dias,
                        montoDeposito: Math.round(pricePerDay * 2), // 2 días como depósito
                        ciudadFirma: 'Ciudad de Guatemala',
                        fechaFirma: new Date()
                    },
                    datosHojaEstado: {
                        fechaEntrega: startDate,
                        fechaDevolucion: returnDate,
                        numeroUnidad: vehiculo.numeroVinChasis,
                        marcaModelo: `${vehiculo.nombreVehiculo} ${vehiculo.modelo}`,
                        placa: vehiculo.placa,
                        nombreCliente: nombreParaContrato
                    }
                });
                
                await nuevoContrato.save();
                console.log(`Contrato generado automáticamente para la reserva ${savedReservation._id}`);
            }
            
        } catch (contractError) {
            console.error('Error generando contrato automático:', contractError);
            // No fallar la reserva si hay error en el contrato
        }
        
        // Poblar la reserva guardada antes de enviarla
        const populatedReservation = await reservationsModel.findById(savedReservation._id)
            .populate({
                path: 'clientId',
                select: 'nombre apellido telefono correo'
            })
            .populate({
                path: 'vehicleId',
                select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad'
            });
        
        res.status(201).json({ 
            success: true,
            message: "Reserva creada exitosamente",
            data: populatedReservation
        });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        
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
            message: "Error interno del servidor al crear la reserva", 
            error: error.message 
        });
    }
};

//Update - Actualizar reserva existente
reservationsController.updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            clientId,
            client,
            vehicleId,
            startDate,
            returnDate,
            status,
            pricePerDay
        } = req.body;

        // Validar que el ID sea válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reserva no válido"
            });
        }

        // Verificar que la reserva existe
        const existingReservation = await reservationsModel.findById(id);
        if (!existingReservation) {
            return res.status(404).json({
                success: false,
                message: "Reserva no encontrada"
            });
        }

        // Objeto para almacenar los campos a actualizar
        const updateFields = {};

        // Validar y agregar clientId si se proporciona
        if (clientId !== undefined) {
            if (!isValidObjectId(clientId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de cliente no válido"
                });
            }
            updateFields.clientId = clientId;
        }

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

        // Agregar client si se proporciona
        if (client !== undefined) {
            updateFields.client = client;
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
        const finalStartDate = updateFields.startDate || existingReservation.startDate;
        const finalReturnDate = updateFields.returnDate || existingReservation.returnDate;
        
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

        // Validar y agregar pricePerDay si se proporciona
        if (pricePerDay !== undefined) {
            if (!pricePerDay || pricePerDay <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "El precio por día debe ser mayor a 0"
                });
            }
            updateFields.pricePerDay = pricePerDay;
        }

        // Verificar que al menos un campo esté siendo actualizado
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron campos para actualizar"
            });
        }

        // Actualizar reserva
        const updatedReservation = await reservationsModel.findByIdAndUpdate(
            id, 
            updateFields, 
            { new: true, runValidators: true }
        ).populate({
            path: 'clientId',
            select: 'nombre apellido telefono correo'
        }).populate({
            path: 'vehicleId',
            select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad'
        });

        // Cambiar estado del vehículo según el estado de la reserva
        if (updatedReservation && vehicleId) {
            if (status === "Active") {
                await vehiculosModel.findByIdAndUpdate(vehicleId, { estado: "Reservado" });
            } else if (status === "Completed") {
                await vehiculosModel.findByIdAndUpdate(vehicleId, { estado: "Disponible" });
            }
        }

        res.status(200).json({ 
            success: true,
            message: "Reserva actualizada exitosamente",
            data: updatedReservation
        });
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
        
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
            message: "Error interno del servidor al actualizar la reserva", 
            error: error.message 
        });
    }
};

//Delete - Eliminar reserva
reservationsController.deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reserva no válido"
            });
        }

        // Verificar que la reserva existe antes de eliminarla
        const reservation = await reservationsModel.findById(id)
            .populate({
                path: 'clientId',
                select: 'nombre apellido telefono correo'
            })
            .populate({
                path: 'vehicleId',
                select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad'
            });
            
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reserva no encontrada"
            });
        }

        // Eliminar reserva
        await reservationsModel.findByIdAndDelete(id);
        
        res.status(200).json({ 
            success: true,
            message: "Reserva eliminada exitosamente",
            data: reservation
        });
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al eliminar la reserva", 
            error: error.message 
        });
    }
};

// Obtener reservas del usuario autenticado
reservationsController.getUserReservations = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autorizado' 
            });
        }
        
        // Validar que el userId sea válido
        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no válido"
            });
        }
        
        const reservations = await reservationsModel.find({ clientId: userId })
            .populate({
                path: 'vehicleId',
                select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad',
                options: { lean: true }
            })
            .lean()
            .sort({ creationDate: -1 });
        
        // Adaptar la respuesta para que el frontend tenga acceso directo a los datos del auto y la imagen lateral
        const reservationsAdapted = reservations.map(reservation => {
            const vehiculo = reservation.vehicleId || {};
            return {
                ...reservation,
                vehiculoNombre: vehiculo.nombreVehiculo || '',
                vehiculoModelo: vehiculo.modelo || '',
                vehiculoColor: vehiculo.color || '',
                vehiculoAnio: vehiculo.anio || '',
                vehiculoCapacidad: vehiculo.capacidad || '',
                vehiculoPlaca: vehiculo.placa || '',
                imagenVehiculo: vehiculo.imagenLateral || '',
            };
        });
        
        res.status(200).json({ 
            success: true, 
            data: reservationsAdapted,
            count: reservationsAdapted.length
        });
    } catch (error) {
        console.error('Error al obtener reservas del usuario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor al obtener reservas',
            error: error.message
        });
    }
};

// Get reservations by vehicle ID - Obtener reservas por ID de vehículo
reservationsController.getReservationsByVehicleId = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        // Validar que el vehicleId sea válido
        if (!isValidObjectId(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: "ID de vehículo no válido"
            });
        }

        // Buscar reservas por vehicleId
        const reservations = await reservationsModel.find({ vehicleId })
            .populate({
                path: 'clientId',
                select: 'nombre apellido telefono correo'
            })
            .populate({
                path: 'vehicleId',
                select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad'
            })
            .sort({ creationDate: -1 });
        
        res.status(200).json({
            success: true,
            data: reservations,
            count: reservations.length
        });
    } catch (error) {
        console.error('Error al obtener reservas por vehículo:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener reservas por vehículo",
            error: error.message
        });
    }
};

// Get reservations by status - Obtener reservas por estado
reservationsController.getReservationsByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        // Validar que el estado sea válido
        if (!['Pending', 'Active', 'Completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado no válido. Debe ser: Pending, Active o Completed"
            });
        }

        // Buscar reservas por estado
        const reservations = await reservationsModel.find({ status })
            .populate({
                path: 'clientId',
                select: 'nombre apellido telefono correo'
            })
            .populate({
                path: 'vehicleId',
                select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad'
            })
            .sort({ creationDate: -1 });
        
        res.status(200).json({
            success: true,
            data: reservations,
            count: reservations.length
        });
    } catch (error) {
        console.error('Error al obtener reservas por estado:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener reservas por estado",
            error: error.message
        });
    }
};

/************************* VEHICULOS MAS RENTADOS POR MARCAS *******************************/

reservationsController.getMostRentedVehiclesByBrand = async (req, res) => {
    try {
        const resultado = await reservationsModel.aggregate([
            {
                $match: {
                    vehicleId: { $exists: true, $ne: null }
                }
            },
            {
                $lookup: {
                    from: "vehiculos",
                    localField: "vehicleId",
                    foreignField: "_id",
                    as: "vehiculo"
                }
            },
            { $unwind: "$vehiculo" },
            {
                $lookup: {
                    from: "marcas",
                    let: { idMarcaStr: "$vehiculo.idMarca" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", { $toObjectId: "$$idMarcaStr" }]
                                }
                            }
                        },
                        {
                            $project: { nombreMarca: 1, _id: 0 }
                        }
                    ],
                    as: "marca"
                }
            },
            { $unwind: "$marca" },
            {
                $group: {
                    _id: "$marca.nombreMarca",  // agrupar por nombre de marca
                    totalReservations: { $sum: 1 }, // total reservas
                    uniqueVehiclesCount: { $addToSet: "$vehiculo._id" }  // conjunto de IDs únicos de vehículos
                }
            },
            {
                $addFields: {
                    uniqueVehiclesCount: { $size: "$uniqueVehiclesCount" } // tamaño del conjunto (cantidad vehículos únicos)
                }
            },
            {
                $sort: { totalReservations: -1 }
            },
            {
                $limit: 5
            }
        ]);

        console.log("Resultado vehiculos más rentados por marca:", resultado);
        
        res.status(200).json({
            success: true,
            data: resultado,
            count: resultado.length
        });
    } catch (error) {
        console.error("Error en getMostRentedVehiclesByBrand:", error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al obtener vehículos más rentados por marca",
            error: error.message
        });
    }
};

/************************* VEHICULOS MAS RENTADOS POR MODELOS *******************************/

reservationsController.getMostRentedVehiclesByModel = async (req, res) => {
    try {
        const resultado = await reservationsModel.aggregate([
            {
                $lookup: {
                    from: "vehiculos", 
                    localField: "vehicleId",
                    foreignField: "_id",
                    as: "vehiculo"
                }
            },
            {
                $unwind: "$vehiculo"
            },
            {
                $group: {
                    _id: "$vehiculo.modelo", 
                    totalReservations: { $sum: 1 },
                    totalIncome: { $sum: "$pricePerDay" },
                    rentedVehicles: { $addToSet: "$vehiculo.nombreVehiculo" }
                }
            },
            {
                $addFields: {
                    uniqueVehiclesCount: { $size: "$rentedVehicles" }
                }
            },
            {
                $sort: { totalReservations: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.status(200).json({
            success: true,
            data: resultado,
            count: resultado.length
        });
    } catch (error) {
        console.error("Error en getMostRentedVehiclesByModel:", error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al obtener vehículos más rentados por modelo",
            error: error.message
        });
    }
};

export default reservationsController;