const contratosController = {};
import { Contratos } from "../models/Contratos.js";

// SELECT - Obtener todos los contratos
contratosController.getContratos = async (req, res) => {
    try {
        const contratos = await Contratos.find();
        res.json(contratos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener contratos", error: error.message });
    }
};

// SELECT - Obtener contrato por ID
contratosController.getContratoById = async (req, res) => {
    try {
        const contrato = await Contratos.findById(req.params.id);
        if (!contrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }
        res.json(contrato);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener contrato", error: error.message });
    }
};

// SELECT - Obtener contratos por estado
contratosController.getContratosByEstado = async (req, res) => {
    try {
        const { estado } = req.params;
        const contratos = await Contratos.find({ estado });
        res.json(contratos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener contratos por estado", error: error.message });
    }
};

// SELECT - Obtener contratos por cliente
contratosController.getContratosByClient = async (req, res) => {
    try {
        const { clientID } = req.params;
        const contratos = await Contratos.find({ clientID });
        res.json(contratos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener contratos del cliente", error: error.message });
    }
};

// INSERT - Crear nuevo contrato
contratosController.insertContrato = async (req, res) => {
    try {
        const {
            reservationId,
            clientID,
            carID,
            estado,
            datosHojaEstado,
            datosArrendamiento,
            documentos
        } = req.body;

        const newContrato = new Contratos({
            reservationId,
            clientID,
            carID,
            estado,
            datosHojaEstado,
            datosArrendamiento,
            documentos
        });

        await newContrato.save();
        res.status(201).json({ message: "Contrato creado exitosamente", contrato: newContrato });
    } catch (error) {
        res.status(400).json({ message: "Error al crear contrato", error: error.message });
    }
};

// UPDATE - Actualizar contrato completo
contratosController.updateContrato = async (req, res) => {
    try {
        const {
            reservationId,
            clientID,
            carID,
            estado,
            datosHojaEstado,
            datosArrendamiento,
            documentos
        } = req.body;

        const updatedContrato = await Contratos.findByIdAndUpdate(
            req.params.id,
            {
                reservationId,
                clientID,
                carID,
                estado,
                datosHojaEstado,
                datosArrendamiento,
                documentos
            },
            { new: true }
        );

        if (!updatedContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        res.json({ message: "Contrato actualizado exitosamente", contrato: updatedContrato });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar contrato", error: error.message });
    }
};

// UPDATE - Finalizar contrato (cambiar estado a "Finalizado")
contratosController.finalizarContrato = async (req, res) => {
    try {
        const updatedContrato = await Contratos.findByIdAndUpdate(
            req.params.id,
            { 
                estado: "Finalizado",
                fechaFin: new Date()
            },
            { new: true }
        );

        if (!updatedContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        res.json({ message: "Contrato finalizado exitosamente", contrato: updatedContrato });
    } catch (error) {
        res.status(400).json({ message: "Error al finalizar contrato", error: error.message });
    }
};

// UPDATE - Anular contrato (cambiar estado a "Anulado")
contratosController.anularContrato = async (req, res) => {
    try {
        const updatedContrato = await Contratos.findByIdAndUpdate(
            req.params.id,
            { 
                estado: "Anulado",
                fechaFin: new Date()
            },
            { new: true }
        );

        if (!updatedContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        res.json({ message: "Contrato anulado exitosamente", contrato: updatedContrato });
    } catch (error) {
        res.status(400).json({ message: "Error al anular contrato", error: error.message });
    }
};

// UPDATE - Actualizar hoja de estado
contratosController.updateHojaEstado = async (req, res) => {
    try {
        const { datosHojaEstado } = req.body;

        const updatedContrato = await Contratos.findByIdAndUpdate(
            req.params.id,
            { datosHojaEstado },
            { new: true }
        );

        if (!updatedContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        res.json({ message: "Hoja de estado actualizada exitosamente", contrato: updatedContrato });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar hoja de estado", error: error.message });
    }
};

// UPDATE - Actualizar datos de arrendamiento
contratosController.updateDatosArrendamiento = async (req, res) => {
    try {
        const { datosArrendamiento } = req.body;

        const updatedContrato = await Contratos.findByIdAndUpdate(
            req.params.id,
            { datosArrendamiento },
            { new: true }
        );

        if (!updatedContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        res.json({ message: "Datos de arrendamiento actualizados exitosamente", contrato: updatedContrato });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar datos de arrendamiento", error: error.message });
    }
};

// DELETE - Eliminar contrato
contratosController.deleteContrato = async (req, res) => {
    try {
        const deletedContrato = await Contratos.findByIdAndDelete(req.params.id);
        
        if (!deletedContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        res.json({ message: "Contrato eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar contrato", error: error.message });
    }
};

export default contratosController;