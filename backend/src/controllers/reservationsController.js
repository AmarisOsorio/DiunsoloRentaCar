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

// Función para calcular días entre fechas (solo considera fechas, no horas)
const calculateDays = (startDate, returnDate) => {
    // Crear fechas sin tiempo (medianoche) para evitar problemas con horas
    const start = new Date(startDate);
    const end = new Date(returnDate);
    
    // Resetear a medianoche para ignorar horas
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Calcular diferencia en milisegundos y convertir a días
    const diffTime = end - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Si es el mismo día, cuenta como 1 día mínimo
    return diffDays === 0 ? 1 : diffDays;
};
 
//Select - Obtener todas las reservas
reservationsController.getReservations = async (req, res) => {
    try {
        const reservations = await reservationsModel.find()
            .populate({
                path: 'clientId',
                select: 'name lastName phone email'
            })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate model color year capacity dailyPrice'
            })
            .sort({ creationDate: -1 });
       
        if (!reservations || reservations.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No se encontraron reservas",
                data: [],
                count: 0
            });
        }
 
        console.log('Reservas encontradas:', reservations.length);
        console.log('Muestra de datos:', JSON.stringify(reservations[0], null, 2));
 
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
 
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reserva no válido"
            });
        }
 
        const reservation = await reservationsModel.findById(id)
            .populate({
                path: 'clientId',
                select: 'name lastName phone email'
            })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate model color year capacity dailyPrice'
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
       
        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no válido"
            });
        }
       
        const reservations = await reservationsModel.find({ clientId: userId })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate model color year capacity dailyPrice',
                options: { lean: true }
            })
            .lean()
            .sort({ creationDate: -1 });
       
        // Adaptar la respuesta para que el frontend tenga acceso directo a los datos del auto y la imagen lateral
        const reservationsAdapted = reservations.map(reservation => {
            const vehiculo = reservation.vehicleId || {};
            return {
                ...reservation,
                vehiculoNombre: vehiculo.vehicleName || '',
                vehiculoModelo: vehiculo.model || '',
                vehiculoColor: vehiculo.color || '',
                vehiculoAnio: vehiculo.year || '',
                vehiculoCapacidad: vehiculo.capacity || '',
                vehiculoPlaca: vehiculo.plate || '',
                imagenVehiculo: vehiculo.sideImage || vehiculo.mainViewImage || '',
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
 
        if (!isValidObjectId(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: "ID de vehículo no válido"
            });
        }
 
        const reservations = await reservationsModel.find({ vehicleId })
            .populate({
                path: 'clientId',
                select: 'name lastName phone email'
            })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate model color year capacity dailyPrice'
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
 
        if (!['Pending', 'Active', 'Completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado no válido. Debe ser: Pending, Active o Completed"
            });
        }
 
        const reservations = await reservationsModel.find({ status })
            .populate({
                path: 'clientId',
                select: 'name lastName phone email'
            })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate model color year capacity dailyPrice'
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
 
//Insert - Crear nueva reserva
reservationsController.createReservation = async (req, res) => {
    try {
        const {
            clientId,
            vehicleId,
            startDate,
            returnDate,
            status,
            pricePerDay // Opcional - si se envía se usa, si no se obtiene del vehículo
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

        // Verificar que el cliente existe
        const clientExists = await clientesModel.findById(clientId);
        if (!clientExists) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        // Obtener datos del vehículo
        const vehicle = await vehiculosModel.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehículo no encontrado"
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

        // Determinar precio por día: usar el enviado o el del vehículo
        const finalPricePerDay = pricePerDay || vehicle.dailyPrice;
        
        // Validar que el precio sea válido
        if (!finalPricePerDay || finalPricePerDay <= 0) {
            return res.status(400).json({
                success: false,
                message: "El precio por día debe ser mayor a 0"
            });
        }

        // Calcular días y total
        const days = calculateDays(startDate, returnDate);
        const total = days * finalPricePerDay;
 
        // Crear nueva reserva
        const newReservation = new reservationsModel({
            clientId,
            vehicleId,
            startDate: parsedStartDate,
            returnDate: parsedReturnDate,
            status: status || 'Pending',
            pricePerDay: finalPricePerDay,
            total: total
        });
 
        const savedReservation = await newReservation.save();
       
        // Generar contrato automáticamente
        try {
            const cliente = clientExists;
           
            if (vehicle && cliente) {
                const nuevoContrato = new Contratos({
                    reservationId: savedReservation._id.toString(),
                    datosArrendamiento: {
                        nombreArrendatario: `${cliente.name || cliente.nombre} ${cliente.lastName || cliente.apellido || ''}`.trim(),
                        direccionArrendatario: cliente.direccion || '',
                        numeroPasaporte: cliente.numeroPasaporte || '',
                        numeroLicencia: cliente.numeroLicencia || '',
                        fechaEntrega: startDate,
                        precioDiario: finalPricePerDay,
                        montoTotal: total,
                        diasAlquiler: days,
                        montoDeposito: Math.round(finalPricePerDay * 2),
                        ciudadFirma: 'Ciudad de Guatemala',
                        fechaFirma: new Date()
                    },
                    datosHojaEstado: {
                        fechaEntrega: startDate,
                        fechaDevolucion: returnDate,
                        numeroUnidad: vehicle.vinNumber || vehicle.chassisNumber,
                        marcaModelo: `${vehicle.vehicleName} ${vehicle.model}`,
                        placa: vehicle.plate,
                        nombreCliente: `${cliente.name || cliente.nombre} ${cliente.lastName || cliente.apellido || ''}`.trim()
                    }
                });
               
                await nuevoContrato.save();
                console.log(`Contrato generado automáticamente para la reserva ${savedReservation._id}`);
            }
           
        } catch (contractError) {
            console.error('Error generando contrato automático:', contractError);
        }
       
        // Poblar la reserva guardada antes de enviarla
        const populatedReservation = await reservationsModel.findById(savedReservation._id)
            .populate({
                path: 'clientId',
                select: 'name lastName phone email nombre apellido telefono correo'
            })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate model color year capacity dailyPrice nombreVehiculo imagenLateral placa modelo anio capacidad'
            });
       
        res.status(201).json({
            success: true,
            message: "Reserva creada exitosamente",
            data: populatedReservation
        });
    } catch (error) {
        console.error('Error al crear reserva:', error);
       
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
            vehicleId,
            startDate,
            returnDate,
            status,
            pricePerDay
        } = req.body;
 
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reserva no válido"
            });
        }
 
        const existingReservation = await reservationsModel.findById(id);
        if (!existingReservation) {
            return res.status(404).json({
                success: false,
                message: "Reserva no encontrada"
            });
        }
 
        const updateFields = {};
 
        if (clientId !== undefined) {
            if (!isValidObjectId(clientId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de cliente no válido"
                });
            }
            
            // Verificar que el cliente existe
            const clientExists = await clientesModel.findById(clientId);
            if (!clientExists) {
                return res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado"
                });
            }
            updateFields.clientId = clientId;
        }
 
        if (vehicleId !== undefined) {
            if (!isValidObjectId(vehicleId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de vehículo no válido"
                });
            }
            
            // Verificar que el vehículo existe
            const vehicleExists = await vehiculosModel.findById(vehicleId);
            if (!vehicleExists) {
                return res.status(404).json({
                    success: false,
                    message: "Vehículo no encontrado"
                });
            }
            updateFields.vehicleId = vehicleId;
        }
 
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
 
        const finalStartDate = updateFields.startDate || existingReservation.startDate;
        const finalReturnDate = updateFields.returnDate || existingReservation.returnDate;
       
        if (!isValidDateRange(finalStartDate, finalReturnDate)) {
            return res.status(400).json({
                success: false,
                message: "La fecha de inicio debe ser anterior a la fecha de devolución"
            });
        }
 
        if (status !== undefined) {
            if (!['Pending', 'Active', 'Completed'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Estado no válido. Debe ser: Pending, Active o Completed"
                });
            }
            updateFields.status = status;
        }
 
        if (pricePerDay !== undefined) {
            if (!pricePerDay || pricePerDay <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "El precio por día debe ser mayor a 0"
                });
            }
            updateFields.pricePerDay = pricePerDay;
        }

        // Recalcular total si cambiaron fechas o precio
        if (updateFields.startDate || updateFields.returnDate || updateFields.pricePerDay) {
            const finalPricePerDay = updateFields.pricePerDay || existingReservation.pricePerDay;
            const days = calculateDays(finalStartDate, finalReturnDate);
            updateFields.total = days * finalPricePerDay;
        }
 
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron campos para actualizar"
            });
        }
 
        const updatedReservation = await reservationsModel.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        ).populate({
            path: 'clientId',
            select: 'name lastName phone email nombre apellido telefono correo'
        }).populate({
            path: 'vehicleId',
            select: 'vehicleName mainViewImage sideImage galleryImages plate model color year capacity dailyPrice nombreVehiculo imagenLateral placa modelo anio capacidad'
        });
 
        // Cambiar estado del vehículo según el estado de la reserva
        if (updatedReservation && (vehicleId || status)) {
            const targetVehicleId = vehicleId || existingReservation.vehicleId;
            if (status === "Active") {
                await vehiculosModel.findByIdAndUpdate(targetVehicleId, { status: "Reservado" });
            } else if (status === "Completed") {
                await vehiculosModel.findByIdAndUpdate(targetVehicleId, { status: "Disponible" });
            }
        }
 
        res.status(200).json({
            success: true,
            message: "Reserva actualizada exitosamente",
            data: updatedReservation
        });
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
       
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
 
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reserva no válido"
            });
        }
 
        const reservation = await reservationsModel.findById(id)
            .populate({
                path: 'clientId',
                select: 'name lastName phone email nombre apellido telefono correo'
            })
            .populate({
                path: 'vehicleId',
                select: 'vehicleName mainViewImage sideImage galleryImages plate model color year capacity dailyPrice nombreVehiculo imagenLateral placa modelo anio capacidad'
            });
           
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reserva no encontrada"
            });
        }
 
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
                    _id: "$marca.nombreMarca",
                    totalReservations: { $sum: 1 },
                    uniqueVehiclesCount: { $addToSet: "$vehiculo._id" }
                }
            },
            {
                $addFields: {
                    uniqueVehiclesCount: { $size: "$uniqueVehiclesCount" }
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
                    totalIncome: { $sum: "$total" }, // Ahora usa el campo total de la reserva
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