const ContratosController = {};
import { Contratos } from "../models/Contratos.js";
import reservasModel from "../models/Reservations.js";
import clientesModel from "../models/Clients.js";
import vehiculosModel from "../models/Vehicles.js";


// Obtener todos los contratos
ContratosController.getContratos = async (req, res) => {
    try {
        const contratos = await Contratos.find()
            .populate({
                path: 'reservationId',
                populate: [
                    { path: 'clientID', model: 'Clientes' },
                    { path: 'vehiculoID', model: 'Vehicle' }
                ]
            });
        res.json(contratos);
    } catch (error) {
        console.error('Error obteniendo contratos:', error);
        res.status(500).json({ message: 'Error al obtener contratos', error: error.message });
    }
};

// Obtener contrato por ID
ContratosController.getContratoById = async (req, res) => {
    try {
        const contrato = await Contratos.findById(req.params.id)
            .populate({
                path: 'reservationId',
                populate: [
                    { path: 'clientID', model: 'Clientes' },
                    { path: 'vehiculoID', model: 'Vehicle' }
                ]
            });
        
        if (!contrato) {
            return res.status(404).json({ message: 'Contrato no encontrado' });
        }
        
        res.json(contrato);
    } catch (error) {
        console.error('Error obteniendo contrato:', error);
        res.status(500).json({ message: 'Error al obtener el contrato', error: error.message });
    }
};

// Obtener contrato por reservationId
ContratosController.getContratoByReservation = async (req, res) => {
    try {
        const contrato = await Contratos.findOne({ reservationId: req.params.reservationId })
            .populate({
                path: 'reservationId',
                populate: [
                    { path: 'clientID', model: 'Clientes' },
                    { path: 'vehiculoID', model: 'Vehicle' }
                ]
            });
        
        if (!contrato) {
            return res.status(404).json({ message: 'Contrato no encontrado para esta reserva' });
        }
        
        res.json(contrato);
    } catch (error) {
        console.error('Error obteniendo contrato por reserva:', error);
        res.status(500).json({ message: 'Error al obtener el contrato', error: error.message });
    }
};

// Crear un nuevo contrato
ContratosController.createContrato = async (req, res) => {
    try {
        const { reservationId, datosArrendamiento, datosHojaEstado } = req.body;
        
        // Verificar si ya existe un contrato para esta reserva
        const contratoExistente = await Contratos.findOne({ reservationId });
        if (contratoExistente) {
            return res.status(400).json({ message: 'Ya existe un contrato para esta reserva' });
        }
        
        // Obtener datos de la reserva
        const reserva = await reservasModel.findById(reservationId)
            .populate('clientID')
            .populate('vehiculoID');
        
        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        
        // Crear el contrato
        const nuevoContrato = new Contratos({
            reservationId,
            datosArrendamiento,
            datosHojaEstado
        });
        
        // Generar el PDF del contrato automáticamente
        try {
            const pdfGenerator = new PdfGenerator();
            const pdfUrl = await pdfGenerator.generateContratoArrendamiento(reserva.vehiculoID);
            
            // Actualizar el contrato con la URL del PDF generado
            nuevoContrato.documentos = {
                ...nuevoContrato.documentos,
                arrendamientoPdf: pdfUrl
            };
            
        } catch (pdfError) {
            console.error('Error generando PDF del contrato:', pdfError);
            // Continuamos sin el PDF si hay error
        }
        
        await nuevoContrato.save();
        
        res.status(201).json({ 
            message: 'Contrato creado exitosamente',
            contrato: nuevoContrato
        });
        
    } catch (error) {
        console.error('Error creando contrato:', error);
        res.status(500).json({ message: 'Error al crear el contrato', error: error.message });
    }
};

// Actualizar contrato
ContratosController.updateContrato = async (req, res) => {
    try {
        const contratoId = req.params.id;
        const updateData = req.body;
        
        const contratoActualizado = await Contratos.findByIdAndUpdate(
            contratoId,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!contratoActualizado) {
            return res.status(404).json({ message: 'Contrato no encontrado' });
        }
        
        res.json({ 
            message: 'Contrato actualizado exitosamente',
            contrato: contratoActualizado
        });
        
    } catch (error) {
        console.error('Error actualizando contrato:', error);
        res.status(500).json({ message: 'Error al actualizar el contrato', error: error.message });
    }
};

// Eliminar contrato
ContratosController.deleteContrato = async (req, res) => {
    try {
        const contratoEliminado = await Contratos.findByIdAndDelete(req.params.id);
        
        if (!contratoEliminado) {
            return res.status(404).json({ message: 'Contrato no encontrado' });
        }
        
        res.json({ message: 'Contrato eliminado exitosamente' });
        
    } catch (error) {
        console.error('Error eliminando contrato:', error);
        res.status(500).json({ message: 'Error al eliminar el contrato', error: error.message });
    }
};

// Finalizar contrato (cambiar estado a "Finalizado")
ContratosController.finalizarContrato = async (req, res) => {
    try {
        const contratoId = req.params.id;
        
        const contrato = await Contratos.findByIdAndUpdate(
            contratoId,
            { 
                estado: 'Finalizado',
                fechaFin: new Date()
            },
            { new: true }
        );
        
        if (!contrato) {
            return res.status(404).json({ message: 'Contrato no encontrado' });
        }
        
        res.json({ 
            message: 'Contrato finalizado exitosamente',
            contrato
        });
        
    } catch (error) {
        console.error('Error finalizando contrato:', error);
        res.status(500).json({ message: 'Error al finalizar el contrato', error: error.message });
    }
};

// Anular contrato
ContratosController.anularContrato = async (req, res) => {
    try {
        const contratoId = req.params.id;
        
        const contrato = await Contratos.findByIdAndUpdate(
            contratoId,
            { 
                estado: 'Anulado',
                fechaFin: new Date()
            },
            { new: true }
        );
        
        if (!contrato) {
            return res.status(404).json({ message: 'Contrato no encontrado' });
        }
        
        res.json({ 
            message: 'Contrato anulado exitosamente',
            contrato
        });
        
    } catch (error) {
        console.error('Error anulando contrato:', error);
        res.status(500).json({ message: 'Error al anular el contrato', error: error.message });
    }
};

// Regenerar PDF del contrato
ContratosController.regenerarPDF = async (req, res) => {
    try {
        const contratoId = req.params.id;
        
        const contrato = await Contratos.findById(contratoId);
        if (!contrato) {
            return res.status(404).json({ message: 'Contrato no encontrado' });
        }
        
        // Obtener datos de la reserva
        const reserva = await reservasModel.findById(contrato.reservationId)
            .populate('clientID')
            .populate('vehiculoID');
        
        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        
        // Generar nuevo PDF
        const pdfGenerator = new PdfGenerator();
        const pdfUrl = await pdfGenerator.generateContratoArrendamiento(reserva.vehiculoID);
        
        // Actualizar el contrato con la nueva URL del PDF
        contrato.documentos = {
            ...contrato.documentos,
            arrendamientoPdf: pdfUrl
        };
        
        await contrato.save();
        
        res.json({ 
            message: 'PDF regenerado exitosamente',
            pdfUrl
        });
        
    } catch (error) {
        console.error('Error regenerando PDF:', error);
        res.status(500).json({ message: 'Error al regenerar el PDF', error: error.message });
    }
};

export default ContratosController;