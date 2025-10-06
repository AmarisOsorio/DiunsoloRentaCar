import contractsModel from "../models/Contracts.js";
import reservation from "../models/Reservations.js";
import fs from "fs-extra";
import PDFDocument from "pdfkit";

const contractsController = {};

//****************** OBTENER TODOS LOS CONTRATOS *****************************//
contractsController.getAllContracts = async (req, res) => {
    try {
        console.log("🔍 BACKEND: Iniciando getAllContracts");

        const contracts = await contractsModel.find().populate({
            path: "reservationId",
            populate: [
                { path: "clientId", select: "name lastName email phone licenseNumber passportNumber address" },
                { path: "vehicleId", select: "brand model plate year color" },
            ],
        });

        console.log("📊 BACKEND: Contratos encontrados en DB:", contracts.length);

        // Debug detallado de los primeros contratos
        if (contracts.length > 0) {
            console.log("🔍 BACKEND: Estructura del primer contrato:", {
                id: contracts[0]._id,
                status: contracts[0].status,
                reservationPopulated: !!contracts[0].reservationId,
                clientData: contracts[0].reservationId?.clientId ? {
                    name: contracts[0].reservationId.clientId.name,
                    lastName: contracts[0].reservationId.clientId.lastName
                } : null,
                vehicleData: contracts[0].reservationId?.vehicleId ? {
                    brand: contracts[0].reservationId.vehicleId.brand,
                    model: contracts[0].reservationId.vehicleId.model,
                    plate: contracts[0].reservationId.vehicleId.plate
                } : null
            });
        }

        res.status(200).json(contracts);
    } catch (error) {
        console.error("❌ Error obteniendo contratos:", error);
        res
            .status(500)
            .json({ message: "Error al obtener contratos", error: error.message });
    }
};

//****************** INSERTAR UN NUEVO CONTRATO *****************************//
contractsController.insertContract = async (req, res) => {
    try {
        const contractData = req.body;
        console.log("📥 BACKEND: Recibiendo datos para contrato:", {
            reservationId: contractData.reservationId,
            status: contractData.status,
            hasLeaseData: !!contractData.leaseData,
            hasStatusSheet: !!contractData.statusSheetData
        });

        // Validar que la reservación existe
        const existingReservation = await reservation.findById(contractData.reservationId);
        if (!existingReservation) {
            console.error("❌ BACKEND: Reservación no encontrada:", contractData.reservationId);
            return res.status(404).json({ message: "La reservación especificada no existe" });
        }

        console.log("✅ BACKEND: Reservación encontrada:", {
            id: existingReservation._id,
            currentStatus: existingReservation.status,
            clientId: existingReservation.clientId,
            vehicleId: existingReservation.vehicleId
        });

        // Verificar si ya existe un contrato para esta reservación
        let contract = await contractsModel.findOne({ reservationId: contractData.reservationId });

        if (contract) {
            console.log("⚠️ Contrato existente encontrado, actualizando...");
            contract.set(contractData);
        } else {
            contract = new contractsModel(contractData);
        }

        const savedContract = await contract.save();
        console.log("💾 BACKEND: Contrato guardado/actualizado con ID:", savedContract._id);

        // Actualizar estado de la reserva asociada a 'Active'
        await reservation.findByIdAndUpdate(savedContract.reservationId, { status: 'Active' }, { new: true });

        // Generar PDF
        const pdfPath = `./uploads/contracts/contract_${savedContract._id}.pdf`;
        await fs.ensureDir("./uploads/contracts");

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        // Contenido básico (puedes agregar más detalles como en tu función original)
        doc.fontSize(20).text("Contrato de Renta de Vehículo", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Contrato ID: ${savedContract._id}`);
        doc.text(`Estado: ${savedContract.status || "N/A"}`);
        doc.moveDown();

        const clientName = savedContract.reservationId?.clientId ? 
            `${savedContract.reservationId.clientId.name || ""} ${savedContract.reservationId.clientId.lastName || ""}`.trim() 
            : "N/A";
        doc.text(`Cliente: ${clientName}`);

        doc.end();

        // Guardar ruta del PDF en el contrato
        savedContract.documents = savedContract.documents || {};
        savedContract.documents.leasePdf = pdfPath;
        await savedContract.save();

        console.log("✅ BACKEND: PDF generado exitosamente:", pdfPath);

        // Popular contrato antes de enviar al frontend
        const populatedContract = await contractsModel.findById(savedContract._id).populate({
            path: "reservationId",
            populate: [
                { path: "clientId", select: "name lastName email phone licenseNumber passportNumber address" },
                { path: "vehicleId", select: "brand model plate year color" },
            ],
        });

        res.status(201).json({
            message: "Contrato creado/actualizado con éxito y PDF generado",
            contract: populatedContract,
            pdfUrl: pdfPath
        });

    } catch (error) {
        console.error("❌ Error insertando contrato:", error);
        res.status(500).json({
            message: "Error al crear/actualizar contrato",
            error: error.message,
        });
    }
};


//****************** OBTENER UN CONTRATO ESPECÍFICO *****************************//
contractsController.getContractById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🔍 BACKEND: Obteniendo contrato por ID:", id);

        const contract = await contractsModel.findById(id).populate({
            path: "reservationId",
            populate: [
                { path: "clientId", select: "name lastName email phone licenseNumber passportNumber address" },
                { path: "vehicleId", select: "brand model plate year color" },
            ],
        });

        if (!contract) {
            console.log("❌ BACKEND: Contrato no encontrado:", id);
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        console.log("✅ BACKEND: Contrato encontrado:", contract._id);
        res.status(200).json(contract);

    } catch (error) {
        console.error("❌ Error obteniendo contrato:", error);
        res.status(500).json({
            message: "Error al obtener contrato",
            error: error.message,
        });
    }
};

//****************** ACTUALIZAR UN CONTRATO *****************************//
contractsController.updateContract = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log("🔄 BACKEND: Actualizando contrato:", id);

        const updatedContract = await contractsModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate({
            path: "reservationId",
            populate: [
                { path: "clientId", select: "name lastName email phone licenseNumber passportNumber address" },
                { path: "vehicleId", select: "brand model plate year color" },
            ],
        });

        if (!updatedContract) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        console.log("✅ BACKEND: Contrato actualizado:", updatedContract._id);
        res.status(200).json({
            message: "Contrato actualizado con éxito",
            contract: updatedContract,
        });

    } catch (error) {
        console.error("❌ Error actualizando contrato:", error);
        res.status(500).json({
            message: "Error al actualizar contrato",
            error: error.message,
        });
    }
};

//****************** ELIMINAR UN CONTRATO *****************************//
contractsController.deleteContracts = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🗑️ BACKEND: Eliminando contrato:", id);

        // Obtener el contrato antes de eliminarlo para actualizar la reserva
        const contractToDelete = await contractsModel.findById(id);
        
        if (!contractToDelete) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        // Eliminar el contrato
        const deleted = await contractsModel.findByIdAndDelete(id);
        
        // Opcional: Actualizar el estado de la reserva de vuelta a 'Confirmed' o 'Pending'
        if (contractToDelete.reservationId) {
            await reservation.findByIdAndUpdate(
                contractToDelete.reservationId,
                { status: 'Confirmed' }, // O el estado que prefieras
                { new: true }
            );
            console.log("🔄 BACKEND: Reservación revertida a estado 'Confirmed'");
        }

        console.log("✅ BACKEND: Contrato eliminado:", id);
        res.json({ message: "Contrato eliminado con éxito" });

    } catch (error) {
        console.error("❌ Error eliminando contrato:", error);
        res.status(500).json({
            message: "Error al eliminar contrato",
            error: error.message,
        });
    }
};


//****************** GENERAR PDF *****************************//
contractsController.generateContractPdf = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("📄 BACKEND: Generando PDF para contrato:", id);

        // 🔹 Obtener contrato y poblar clientId y vehicleId
        const contract = await contractsModel.findById(id).populate({
            path: "reservationId",
            populate: [
                { path: "clientId", select: "name lastName email phone licenseNumber passportNumber address" },
                { path: "vehicleId", select: "brand model plate year color" },
            ],
        });

        if (!contract) {
            console.log("❌ BACKEND: Contrato no encontrado para PDF:", id);
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        // 🔹 Ruta donde se guardará el PDF
        const pdfPath = `./uploads/contracts/contract_${contract._id}.pdf`;

        // 🔹 Crear carpeta si no existe
        await fs.ensureDir("./uploads/contracts");

        // 🔹 Crear nuevo documento PDF
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // =================== CONTENIDO DEL PDF =================== //
        doc.fontSize(20).text("Contrato de Renta de Vehículo", { align: "center" });
        doc.moveDown();

        // Información básica del contrato
        doc.fontSize(12).text(`Contrato ID: ${contract._id}`);
        doc.text(`Fecha de creación: ${new Date(contract.startDate || Date.now()).toLocaleDateString('es-ES')}`);
        doc.text(`Estado: ${contract.status || "N/A"}`);
        doc.moveDown();

        // Información del cliente
        const clientName = contract.reservationId?.clientId ? 
            `${contract.reservationId.clientId.name || ""} ${contract.reservationId.clientId.lastName || ""}`.trim() 
            : "N/A";

        doc.fontSize(14).text("INFORMACIÓN DEL ARRENDATARIO:", { underline: true });
        doc.fontSize(12)
           .text(`Nombre: ${clientName}`)
           .text(`Email: ${contract.reservationId?.clientId?.email || "N/A"}`)
           .text(`Teléfono: ${contract.reservationId?.clientId?.phone || "N/A"}`)
           .text(`No. Licencia: ${contract.reservationId?.clientId?.licenseNumber || "N/A"}`)
           .text(`No. Pasaporte: ${contract.reservationId?.clientId?.passportNumber || "N/A"}`)
           .text(`Dirección: ${contract.reservationId?.clientId?.address || contract.leaseData?.tenantAddress || "N/A"}`);
        doc.moveDown();

        // Información del vehículo
        const vehicleName = contract.reservationId?.vehicleId ? 
            `${contract.reservationId.vehicleId.brand || ""} ${contract.reservationId.vehicleId.model || ""}`.trim() 
            : "N/A";

        doc.fontSize(14).text("INFORMACIÓN DEL VEHÍCULO:", { underline: true });
        doc.fontSize(12)
           .text(`Vehículo: ${vehicleName}`)
           .text(`Placa: ${contract.reservationId?.vehicleId?.plate || "N/A"}`)
           .text(`Año: ${contract.reservationId?.vehicleId?.year || "N/A"}`)
           .text(`Color: ${contract.reservationId?.vehicleId?.color || "N/A"}`);
        doc.moveDown();

        // Información financiera
        doc.fontSize(14).text("INFORMACIÓN FINANCIERA:", { underline: true });
        doc.fontSize(12)
           .text(`Días de renta: ${contract.leaseData?.rentalDays || 0}`)
           .text(`Precio por día: $${contract.leaseData?.dailyPrice || 0}`)
           .text(`Monto total: $${contract.leaseData?.totalAmount || 0}`)
           .text(`Depósito: $${contract.leaseData?.depositAmount || 0}`)
           .text(`Penalidad por mal uso: $${contract.leaseData?.misusePenalty || 0}`);
        doc.moveDown();

        // Fechas importantes
        doc.fontSize(14).text("FECHAS DEL CONTRATO:", { underline: true });
        doc.fontSize(12)
           .text(`Fecha de entrega: ${contract.statusSheetData?.deliveryDate || contract.leaseData?.deliveryDate || "N/A"}`)
           .text(`Fecha de devolución: ${contract.statusSheetData?.returnDate || "N/A"}`)
           .text(`Ciudad de entrega: ${contract.leaseData?.deliveryCity || "N/A"}`)
           .text(`Hora de entrega: ${contract.leaseData?.deliveryHour || "N/A"}`);
        doc.moveDown();

        // Estado del combustible
        if (contract.statusSheetData?.fuelStatus) {
            doc.fontSize(14).text("ESTADO DEL COMBUSTIBLE:", { underline: true });
            doc.fontSize(12)
               .text(`Nivel de entrega: ${contract.statusSheetData.fuelStatus.delivery || "N/A"}%`)
               .text(`Nivel de devolución estimado: ${contract.statusSheetData.fuelStatus.return || "N/A"}%`);
            doc.moveDown();
        }

        // Conductor adicional (si existe)
        if (contract.leaseData?.extraDriverName) {
            doc.fontSize(14).text("CONDUCTOR ADICIONAL:", { underline: true });
            doc.fontSize(12)
               .text(`Nombre: ${contract.leaseData.extraDriverName}`)
               .text(`País del pasaporte: ${contract.leaseData.extraDriverPassportCountry || "N/A"}`)
               .text(`No. Pasaporte: ${contract.leaseData.extraDriverPassportNumber || "N/A"}`)
               .text(`No. Licencia: ${contract.leaseData.extraDriverLicenseNumber || "N/A"}`);
            doc.moveDown();
        }

        // Observaciones finales
        if (contract.leaseData?.finalObservations) {
            doc.fontSize(14).text("OBSERVACIONES:", { underline: true });
            doc.fontSize(12).text(contract.leaseData.finalObservations, { align: "justify", width: 400 });
            doc.moveDown();
        }

        // Espacio para firmas
        doc.moveDown(2);
        doc.fontSize(14).text("FIRMAS:", { underline: true });
        doc.moveDown();

        const leftX = 50;
        const rightX = 300;
        const signatureY = doc.y;

        // Firma del arrendador
        doc.fontSize(12);
        doc.text("ARRENDADOR:", leftX, signatureY);
        doc.text("____________________", leftX, signatureY + 30);
        doc.text("Nombre: [Nombre del Arrendador]", leftX, signatureY + 50);
        doc.text("Fecha: ________________", leftX, signatureY + 70);

        // Firma del arrendatario  
        doc.text("ARRENDATARIO:", rightX, signatureY);
        doc.text("____________________", rightX, signatureY + 30);
        doc.text(`Nombre: ${clientName}`, rightX, signatureY + 50);
        doc.text("Fecha: ________________", rightX, signatureY + 70);

        // Footer
        doc.moveDown(4);
        doc.fontSize(10)
           .text("Este documento fue generado automáticamente por el sistema de gestión de contratos.", { align: "center", color: "gray" })
           .text(`Generado el: ${new Date().toLocaleString('es-ES')}`, { align: "center", color: "gray" });

        doc.end();

        // Esperar a que se escriba el archivo antes de guardar en la DB
        writeStream.on("finish", async () => {
            contract.documents = contract.documents || {};
            contract.documents.leasePdf = pdfPath;
            await contract.save();
            console.log("✅ BACKEND: PDF generado exitosamente:", pdfPath);

            res.status(200).json({
                message: "PDF generado correctamente",
                pdfUrl: pdfPath,
                contractId: contract._id
            });
        });

    } catch (error) {
        console.error("❌ Error generando PDF:", error);
        res.status(500).json({ 
            message: "Error al generar PDF", 
            error: error.message 
        });
    }
};


//****************** ENDPOINT DE DEBUG PARA RESERVACIONES *****************************//
contractsController.debugReservations = async (req, res) => {
    try {
        console.log("🔍 BACKEND: Endpoint de debug para reservaciones");
        
        // Obtener todas las reservaciones con populate
        const allReservations = await reservation.find().populate([
            { path: "clientId", select: "name lastName email phone licenseNumber passportNumber address" },
            { path: "vehicleId", select: "brand model plate year color" }
        ]);

        console.log("📊 BACKEND: Total reservaciones en DB:", allReservations.length);

        // Análisis detallado
        const analysis = {
            total: allReservations.length,
            byStatus: {},
            withClientData: 0,
            withVehicleData: 0,
            completeForContracts: 0,
            samples: []
        };

        allReservations.forEach((res, index) => {
            // Contar por estado
            analysis.byStatus[res.status] = (analysis.byStatus[res.status] || 0) + 1;
            
            // Verificar datos completos
            const hasClientData = res.clientId && (res.clientId.name || res.clientId.lastName);
            const hasVehicleData = res.vehicleId && (res.vehicleId.brand || res.vehicleId.model);
            const isValidStatus = ['Active', 'Confirmed', 'Approved', 'Pending'].includes(res.status);
            
            if (hasClientData) analysis.withClientData++;
            if (hasVehicleData) analysis.withVehicleData++;
            if (hasClientData && hasVehicleData && isValidStatus) analysis.completeForContracts++;
            
            // Muestras para debug (primeras 5)
            if (index < 5) {
                analysis.samples.push({
                    id: res._id.toString().slice(-8),
                    status: res.status,
                    hasClientData,
                    hasVehicleData,
                    isValidStatus,
                    clientName: hasClientData ? `${res.clientId.name || ''} ${res.clientId.lastName || ''}`.trim() : null,
                    vehicleName: hasVehicleData ? `${res.vehicleId.brand || ''} ${res.vehicleId.model || ''}`.trim() : null,
                    startDate: res.startDate,
                    returnDate: res.returnDate,
                    pricePerDay: res.pricePerDay
                });
            }
        });

        console.log("📈 BACKEND: Análisis de reservaciones:", analysis);

        res.status(200).json({
            message: "Debug de reservaciones completado",
            analysis,
            validForContracts: allReservations.filter(res => {
                const hasClientData = res.clientId && (res.clientId.name || res.clientId.lastName);
                const hasVehicleData = res.vehicleId && (res.vehicleId.brand || res.vehicleId.model);
                const isValidStatus = ['Active', 'Confirmed', 'Approved', 'Pending'].includes(res.status);
                return hasClientData && hasVehicleData && isValidStatus;
            })
        });

    } catch (error) {
        console.error("❌ Error en debug de reservaciones:", error);
        res.status(500).json({
            message: "Error en debug de reservaciones",
            error: error.message
        });
    }
};

export default contractsController;