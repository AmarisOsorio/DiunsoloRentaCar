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

    // VALIDACIÓN REMOVIDA: Ya no verificamos si existe una reserva activa o pendiente
    // Esto permite múltiples reservas del mismo vehículo por usuario
    /*
    const reservaExistente = await reservasModel.findOne({
        clientID,
        vehiculoID,
        estado: { $in: ["Pendiente", "Activa"] }
    });
    if (reservaExistente) {
        return res.status(400).json({ message: "Ya existe una reserva activa o pendiente para este vehículo y usuario." });
    }
    */

    // Usar los datos del cliente que vienen del frontend (cliente beneficiario)
    // Si no vienen datos del cliente, usar los del usuario autenticado como fallback
    let clienteData = req.body.cliente || null;

    if (!clienteData || !Array.isArray(clienteData) || clienteData.length === 0) {
        // Fallback: usar datos del usuario autenticado si no se proporcionaron datos del cliente
        try {
            const usuarioAutenticado = await clientesModel.findById(clientID);
            if (!usuarioAutenticado) {
                return res.status(404).json({ message: "Usuario autenticado no encontrado" });
            }
            clienteData = [{
                nombre: usuarioAutenticado.nombre + (usuarioAutenticado.apellido ? (" " + usuarioAutenticado.apellido) : ""),
                telefono: usuarioAutenticado.telefono,
                correoElectronico: usuarioAutenticado.correo
            }];
            console.log('Usando datos del usuario autenticado como fallback:', clienteData);
        } catch (err) {
            return res.status(500).json({ message: "Error buscando usuario autenticado", error: err.message });
        }
    } else {
        console.log('Usando datos del cliente del formulario:', clienteData);
    }

    const newReserva = new reservasModel({
        clientID,
        cliente: clienteData, // Ya es un array
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
            
            // Usar datos del cliente beneficiario para el contrato
            const clienteContrato = clienteData[0]; // Primer elemento del array cliente
            const nombreParaContrato = clienteContrato.nombre;
            const correoParaContrato = clienteContrato.correoElectronico;
            
            // Crear el contrato básico
            const nuevoContrato = new Contratos({
                reservationId: savedReserva._id.toString(),
                datosArrendamiento: {
                    nombreArrendatario: nombreParaContrato,
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
                    nombreCliente: nombreParaContrato
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


/************************* VEHICULOS MAS RENTADOS POR MARCAS *******************************/

ReservasController.getVehiculosMasRentadosPorMarca = async (req, res) => {
  try {
    const resultado = await reservasModel.aggregate([
      {
        $match: {
          vehiculoID: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: "vehiculos",
          localField: "vehiculoID",
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
    totalReservas: { $sum: 1 }, // total reservas
    cantidadVehiculosUnicos: { $addToSet: "$vehiculo._id" }  // conjunto de IDs únicos de vehículos
  }
},
{
  $addFields: {
    cantidadVehiculosUnicos: { $size: "$cantidadVehiculosUnicos" } // tamaño del conjunto (cantidad vehículos únicos)
  }
},
      {
        $sort: { totalReservas: -1 }
      },
      {
        $limit: 5
      }
    ]);

    console.log("Resultado final:", resultado);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error en getVehiculosMasRentadosPorMarca:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




/************************* VEHICULOS MAS RENTADOS POR MODELOS *******************************/

ReservasController.getVehiculosMasRentadosPorModelo = async (req, res) => {
    try {
        const resultado = await reservasModel.aggregate([
            {
                $lookup: {
                    from: "vehiculos", 
                    localField: "vehiculoID",
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
                    totalReservas: { $sum: 1 },
                    ingresoTotal: { $sum: "$precioPorDia" },
                    vehiculosRentados: { $addToSet: "$vehiculo.nombreVehiculo" }
                }
            },
            {
                $addFields: {
                    cantidadVehiculosUnicos: { $size: "$vehiculosRentados" }
                }
            },
            {
                $sort: { totalReservas: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.status(200).json(resultado);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export default ReservasController;