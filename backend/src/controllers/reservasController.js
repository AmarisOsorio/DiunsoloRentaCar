const ReservasController = {};
import reservasModel from "../models/Reservas.js";
import clientesModel from "../models/Clientes.js";
import vehiculosModel from "../models/Vehiculos.js";
import { Contratos } from "../models/Contratos.js";
import ContractGenerator from "../utils/contractGenerator.js";

//Select

ReservasController.getReservas = async (req, res) => {
    const reservas = await reservasModel.find()
        .populate("clientID")
        .populate("vehiculoID");
    res.json(reservas);
};

//Insert

ReservasController.insertReservas = async (req, res) => {
    const {
        clientID,
        vehiculoID,
        fechaInicio,
        fechaDevolucion,
        estado,
        precioPorDia
    } = req.body;

    // Verificar si ya existe una reserva activa o pendiente para el mismo usuario y vehículo
    const reservaExistente = await reservasModel.findOne({
        clientID,
        vehiculoID,
        estado: { $in: ["Pendiente", "Activa"] }
    });
    if (reservaExistente) {
        return res.status(400).json({ message: "Ya existe una reserva activa o pendiente para este vehículo y usuario." });
    }

    // Buscar datos del cliente
    let clienteData = null;
    try {
        const cliente = await clientesModel.findById(clientID);
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        clienteData = {
            nombre: cliente.nombre + (cliente.apellido ? (" " + cliente.apellido) : ""),
            telefono: cliente.telefono,
            correoElectronico: cliente.correo
        };
    } catch (err) {
        return res.status(500).json({ message: "Error buscando cliente", error: err.message });
    }

    const newReserva = new reservasModel({
        clientID,
        cliente: [clienteData],
        vehiculoID,
        fechaInicio,
        fechaDevolucion,
        estado,
        precioPorDia
    });

    const savedReserva = await newReserva.save();
    
    // Generar contrato automáticamente
    try {
        // Obtener datos completos del vehículo para el contrato
        const vehiculo = await vehiculosModel.findById(vehiculoID);
        const cliente = await clientesModel.findById(clientID);
        
        if (vehiculo && cliente) {
            // Calcular días de alquiler
            const dias = Math.ceil((new Date(fechaDevolucion) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24));
            
            // Crear el contrato básico
            const nuevoContrato = new Contratos({
                reservationId: savedReserva._id.toString(),
                datosArrendamiento: {
                    nombreArrendatario: `${cliente.nombre} ${cliente.apellido || ''}`.trim(),
                    direccionArrendatario: cliente.direccion || '',
                    numeroPasaporte: cliente.numeroPasaporte || '',
                    numeroLicencia: cliente.numeroLicencia || '',
                    fechaEntrega: fechaInicio,
                    precioDiario: precioPorDia,
                    montoTotal: dias * precioPorDia,
                    diasAlquiler: dias,
                    montoDeposito: Math.round(precioPorDia * 2), // 2 días como depósito
                    ciudadFirma: 'Ciudad de Guatemala',
                    fechaFirma: new Date()
                },
                datosHojaEstado: {
                    fechaEntrega: fechaInicio,
                    fechaDevolucion: fechaDevolucion,
                    numeroUnidad: vehiculo.numeroVinChasis,
                    marcaModelo: `${vehiculo.nombreVehiculo} ${vehiculo.modelo}`,
                    placa: vehiculo.placa,
                    nombreCliente: `${cliente.nombre} ${cliente.apellido || ''}`.trim()
                }
            });
            
            // Generar el PDF del contrato
            try {
                const pdfBuffer = await ContractGenerator.generateContract(
                    nuevoContrato.toObject(),
                    vehiculo,
                    cliente,
                    savedReserva
                );
                
                // Guardar el PDF
                const filename = `contrato_${savedReserva._id}_${Date.now()}.pdf`;
                const pdfUrl = await ContractGenerator.saveContractPDF(pdfBuffer, filename);
                
                // Actualizar el contrato con la URL del PDF generado
                nuevoContrato.documentos = {
                    arrendamientoPdf: pdfUrl
                };
                
            } catch (pdfError) {
                console.error('Error generando PDF del contrato:', pdfError);
                // Continuamos sin el PDF si hay error
            }
            
            await nuevoContrato.save();
            console.log(`Contrato generado automáticamente para la reserva ${savedReserva._id}`);
        }
        
    } catch (contractError) {
        console.error('Error generando contrato automático:', contractError);
        // No fallar la reserva si hay error en el contrato
    }
    
    res.json({message: "Reserva saved", reservaId: savedReserva._id});
};

//Delete

ReservasController.deleteReservas = async (req, res) => {
    await reservasModel.findByIdAndDelete(req.params.id);
    res.json({message: "Reserva deleted"});
};

//Update

ReservasController.updateReservas = async (req, res) => {
    const {
        clientID,
        cliente,
        vehiculoID,
        fechaInicio,
        fechaDevolucion,
        estado,
        precioPorDia
    } = req.body;
    
    const updatedReserva = await reservasModel.findByIdAndUpdate(
        req.params.id,
        {
            clientID,
            cliente,
            vehiculoID,
            fechaInicio,
            fechaDevolucion,
            estado,
            precioPorDia
        },
        {new: true}
    );

    // Cambiar estado del vehículo según el estado de la reserva
    if (updatedReserva && vehiculoID) {
        if (estado === "Activa") {
            await vehiculosModel.findByIdAndUpdate(vehiculoID, { estado: "Reservado" });
        } else if (estado === "Finalizada") {
            await vehiculosModel.findByIdAndUpdate(vehiculoID, { estado: "Disponible" });
        }
    }

    res.json({message: "Reserva updated"});
};


// Obtener reservas del usuario autenticado
ReservasController.getUserReservations = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const reservas = await reservasModel.find({ clientID: userId })
            .populate({
                path: 'vehiculoID',
                select: 'nombreVehiculo imagenLateral placa modelo color anio capacidad',
                options: { lean: true }
            })
            .lean();
        
        // Adaptar la respuesta para que el frontend tenga acceso directo a los datos del auto y la imagen lateral
        const reservasAdaptadas = reservas.map(reserva => {
            const vehiculo = reserva.vehiculoID || {};
            return {
                ...reserva,
                vehiculoNombre: vehiculo.nombreVehiculo || '',
                vehiculoModelo: vehiculo.modelo || '',
                vehiculoColor: vehiculo.color || '',
                vehiculoAnio: vehiculo.anio || '',
                vehiculoCapacidad: vehiculo.capacidad || '',
                vehiculoPlaca: vehiculo.placa || '',
                imagenVehiculo: vehiculo.imagenLateral || '',
            };
        });
        
        res.json({ success: true, reservas: reservasAdaptadas });
    } catch (error) {
        console.error('Error al obtener reservas del usuario:', error);
        res.status(500).json({ success: false, message: 'Error al obtener reservas' });
    }
};

export default ReservasController;
