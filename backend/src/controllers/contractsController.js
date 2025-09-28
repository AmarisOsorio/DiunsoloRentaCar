import contractsModel from "../models/Contracts.js";
import reservation from "../models/Reservations.js"

const contractsController = {};


//****************** OBTERNER TODOS LOS CONTRATOS *****************************//

contractsController.getAllContracts = async (req, res) => {
    try {
        console.log('🔍 BACKEND: Iniciando getAllContracts');
        const contract = await contractsModel.find().populate({
            path: "reservationId",
            populate: [
                { path: "clientId", select: "name lastName email phone licenseNumber" },
                { path: "vehicleId", select: "brand model plate year color" },
            ],
        });

        console.log('📊 BACKEND: Contratos encontrados en DB:', contract.length);
        console.log('🆔 BACKEND: Primeros 3 IDs:', contract.slice(0, 3).map(c => c._id));
        
        res.status(200).json(contract)
    } catch (error) {
        console.error('Error obteniendo contratos:', error);
        res.status(500).json({ message: 'Error al obtener contratos', error: error.message });
    }
}


//****************** INSERTAR UN NUEVO CONTRATO *****************************//

contractsController.insertContract = async (req, res) => {
    try {
        // 1. Capturar datos del body
        const contractData = req.body;

        // 2. Crear contrato
        const newContract = new contractsModel(contractData);

        // 3. Guardar en la BD
        const savedContract = await newContract.save();

        // 4. Popular despuÃ©s de guardar (igual que getAllContracts)
        const populatedContract = await contractsModel.findById(savedContract._id)
            .populate({
                path: 'reservationId',
                populate: [
                    { path: 'clientId', model: 'Clients' },
                    { path: 'vehicleId', model: 'Vehicle' }
                ]
            });

        // 5. Respuesta al cliente
        res.status(201).json({
            message: "Contrato creado con Ã©xito",
            contract: populatedContract
        });

    } catch (error) {
        console.error("Error insertando contrato:", error);
        res.status(500).json({
            message: "Error al crear contrato",
            error: error.message
        });
    }
};

//****************** ELIMINAR UN CONTRATO *****************************//

contractsController.deleteContracts = async (req, res) => {
    await contractsModel.findByIdAndDelete(req.params.id)
    res.json({ message: "El contrato se ha eliminado" })
};


//****************** ACTUALIZAR UN CONTRATO *****************************//



//****************** GENERAR PDF's *****************************//
contractsController.generateContractPdf = async (req, res) => {
    try {
        const { id } = req.params; // ID del contrato
        const contract = await contractsModel.findById(id).populate("reservationId");

        if (!contract) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        // Ruta donde se guardarÃ¡ el PDF
        const pdfPath = `./uploads/contracts/contract_${contract._id}.pdf`;

        // Crear carpeta si no existe
        await fs.ensureDir("./uploads/contracts");

        // Crear nuevo documento PDF
        const doc = new PDFDocument();

        // Guardar el PDF en el sistema de archivos
        doc.pipe(fs.createWriteStream(pdfPath));

        // =================== CONTENIDO DEL PDF =================== //
        doc.fontSize(20).text("Contrato de Renta", { align: "center" });
        doc.moveDown();

        // Datos generales
        doc.fontSize(12).text(`Contrato ID: ${contract._id}`);
        doc.text(`Cliente: ${contract.leaseData?.tenantName || "N/A"}`);
        doc.text(`VehÃ­culo: ${contract.statusSheetData?.brandModel || "N/A"}`);
        doc.text(`Placa: ${contract.statusSheetData?.plate || "N/A"}`);
        doc.text(`Fecha de inicio: ${contract.startDate}`);
        doc.text(`Estado: ${contract.status}`);
        doc.moveDown();

        // InformaciÃ³n de precios
        doc.text(`DÃ­as de renta: ${contract.leaseData?.rentalDays || 0}`);
        doc.text(`Precio diario: $${contract.leaseData?.dailyPrice || 0}`);
        doc.text(`Monto total: $${contract.leaseData?.totalAmount || 0}`);
        doc.moveDown();

        doc.text("Firmas:", { underline: true });
        doc.text("Arrendador: ____________________");
        doc.text("Arrendatario: ____________________");

        // Finalizar documento
        doc.end();

        // Actualizar el contrato con el link del PDF
        contract.documents.leasePdf = pdfPath;
        await contract.save();

        res.status(200).json({
            message: "PDF generado correctamente",
            pdfUrl: pdfPath
        });

    } catch (error) {
        console.error("Error generando PDF:", error);
        res.status(500).json({ message: "Error al generar PDF", error: error.message });
    }
};

export default contractsController;