import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

class ContractGenerator {
    
    /**
     * Genera un contrato de arrendamiento basado en una plantilla PDF
     * @param {Object} contractData - Datos del contrato
     * @param {Object} vehicleData - Datos del vehículo
     * @param {Object} clientData - Datos del cliente
     * @param {Object} reservationData - Datos de la reserva
     * @returns {Buffer} - PDF generado como buffer
     */
    static async generateContract(contractData, vehicleData, clientData, reservationData) {
        try {
            // Leer la plantilla PDF del vehículo
            const templatePath = vehicleData.contratoArrendamientoPdf;
            let pdfBytes;
            
            // Verificar si la plantilla es una URL o un archivo local
            if (templatePath.startsWith('http')) {
                // Si es una URL, descargar el archivo
                const response = await fetch(templatePath);
                pdfBytes = await response.arrayBuffer();
            } else {
                // Si es un archivo local, leerlo
                pdfBytes = fs.readFileSync(templatePath);
            }

            // Cargar el PDF
            const pdfDoc = await PDFDocument.load(pdfBytes);
            
            // Intentar rellenar campos de formulario si existen
            const form = pdfDoc.getForm();
            const contractInfo = this.prepareContractData(contractData, vehicleData, clientData, reservationData);
            
            // Mapeo de campos de formulario comunes en contratos de arrendamiento
            const formFieldMap = {
                // Datos del arrendatario
                'nombreArrendatario': contractInfo.nombreArrendatario,
                'nombre_arrendatario': contractInfo.nombreArrendatario,
                'arrendatario': contractInfo.nombreArrendatario,
                'cliente': contractInfo.nombreArrendatario,
                'profesion': contractInfo.profesionArrendatario,
                'profesionArrendatario': contractInfo.profesionArrendatario,
                'direccion': contractInfo.direccionArrendatario,
                'direccionArrendatario': contractInfo.direccionArrendatario,
                'pasaporte': contractInfo.numeroPasaporte,
                'numeroPasaporte': contractInfo.numeroPasaporte,
                'licencia': contractInfo.numeroLicencia,
                'numeroLicencia': contractInfo.numeroLicencia,
                
                // Datos del vehículo
                'marca': contractInfo.marcaModelo,
                'marcaModelo': contractInfo.marcaModelo,
                'vehiculo': contractInfo.marcaModelo,
                'placa': contractInfo.placa,
                'año': contractInfo.anio,
                'anio': contractInfo.anio,
                'color': contractInfo.color,
                'motor': contractInfo.numeroMotor,
                'numeroMotor': contractInfo.numeroMotor,
                'chasis': contractInfo.numeroChasis,
                'numeroChasis': contractInfo.numeroChasis,
                
                // Datos del contrato
                'fechaEntrega': contractInfo.fechaEntrega,
                'fecha_entrega': contractInfo.fechaEntrega,
                'fechaDevolucion': contractInfo.fechaDevolucion,
                'fecha_devolucion': contractInfo.fechaDevolucion,
                'precioDiario': contractInfo.precioDiario,
                'precio_diario': contractInfo.precioDiario,
                'montoTotal': contractInfo.montoTotal,
                'monto_total': contractInfo.montoTotal,
                'total': contractInfo.montoTotal,
                'dias': contractInfo.diasAlquiler,
                'diasAlquiler': contractInfo.diasAlquiler,
                'deposito': contractInfo.montoDeposito,
                'montoDeposito': contractInfo.montoDeposito,
                'fechaFirma': contractInfo.fechaFirma,
                'fecha_firma': contractInfo.fechaFirma,
                'ciudad': contractInfo.ciudadFirma,
                'ciudadFirma': contractInfo.ciudadFirma
            };
            
            try {
                // Intentar rellenar campos de formulario
                const fieldNames = form.getFieldNames();
                
                fieldNames.forEach(fieldName => {
                    try {
                        const field = form.getField(fieldName);
                        const value = formFieldMap[fieldName];
                        
                        if (value && field) {
                            if (field.constructor.name === 'PDFTextField') {
                                field.setText(String(value));
                            } else if (field.constructor.name === 'PDFCheckBox') {
                                // Para checkboxes, podrías agregar lógica específica
                                if (value === true || value === 'true' || value === 'sí' || value === 'yes') {
                                    field.check();
                                }
                            }
                        }
                    } catch (fieldError) {
                        console.warn(`Error rellenando campo ${fieldName}:`, fieldError.message);
                    }
                });
                
                // Aplanar el formulario para que los campos no sean editables
                form.flatten();
                
            } catch (formError) {
                console.log('No se pudieron usar campos de formulario, usando método de texto sobre PDF');
                
                // Si no hay formulario o hay error, usar el método de texto sobre PDF
                await this.addTextToPDF(pdfDoc, contractInfo);
            }
            
            // Guardar el PDF modificado
            const modifiedPdfBytes = await pdfDoc.save();
            
            return Buffer.from(modifiedPdfBytes);
            
        } catch (error) {
            console.error('Error generando contrato:', error);
            throw new Error('Error al generar el contrato: ' + error.message);
        }
    }
    
    /**
     * Prepara los datos del contrato en el formato correcto
     */
    static prepareContractData(contractData, vehicleData, clientData, reservationData) {
        const now = new Date();
        
        return {
            // Datos del arrendatario
            nombreArrendatario: contractData.datosArrendamiento?.nombreArrendatario || 
                              `${clientData.nombre} ${clientData.apellido || ''}`.trim(),
            profesionArrendatario: contractData.datosArrendamiento?.profesionArrendatario || 
                                 clientData.profesion || '',
            direccionArrendatario: contractData.datosArrendamiento?.direccionArrendatario || 
                                 clientData.direccion || '',
            numeroPasaporte: contractData.datosArrendamiento?.numeroPasaporte || 
                           clientData.numeroPasaporte || '',
            numeroLicencia: contractData.datosArrendamiento?.numeroLicencia || 
                          clientData.numeroLicencia || '',
            
            // Datos del vehículo
            marcaModelo: `${vehicleData.nombreVehiculo} ${vehicleData.modelo}`,
            placa: vehicleData.placa,
            anio: vehicleData.anio,
            color: vehicleData.color,
            numeroMotor: vehicleData.numeroMotor,
            numeroChasis: vehicleData.numeroVinChasis,
            
            // Datos del contrato
            fechaEntrega: this.formatDate(reservationData.fechaInicio),
            fechaDevolucion: this.formatDate(reservationData.fechaDevolucion),
            precioDiario: `$${reservationData.precioPorDia}`,
            montoTotal: contractData.datosArrendamiento?.montoTotal || 
                       this.calculateTotal(reservationData),
            diasAlquiler: this.calculateDays(reservationData.fechaInicio, reservationData.fechaDevolucion),
            montoDeposito: contractData.datosArrendamiento?.montoDeposito || 
                          Math.round(reservationData.precioPorDia * 2), // 2 días como depósito por defecto
            
            // Fechas y lugar de firma
            fechaFirma: this.formatDate(contractData.datosArrendamiento?.fechaFirma || now),
            ciudadFirma: contractData.datosArrendamiento?.ciudadFirma || 'Ciudad de Guatemala',
        };
    }
    
    /**
     * Formatea una fecha en formato DD/MM/YYYY
     */
    static formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }
    
    /**
     * Calcula el número de días entre dos fechas
     */
    static calculateDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    /**
     * Calcula el monto total del alquiler
     */
    static calculateTotal(reservationData) {
        const days = this.calculateDays(reservationData.fechaInicio, reservationData.fechaDevolucion);
        return `$${days * reservationData.precioPorDia}`;
    }
    
    /**
     * Guarda el PDF generado en el sistema de archivos
     */
    static async saveContractPDF(pdfBuffer, filename) {
        try {
            // Guardar el PDF en la ruta uploads, pero NO crear el folder si no existe
            const uploadsDir = path.join(process.cwd(), 'uploads');
            const filePath = path.join(uploadsDir, filename);
            fs.writeFileSync(filePath, pdfBuffer);
            return `/uploads/${filename}`;
        } catch (error) {
            console.error('Error guardando PDF:', error);
            throw new Error('Error al guardar el contrato PDF');
        }
    }
    
    /**
     * Agrega texto sobre el PDF cuando no hay campos de formulario
     */
    static async addTextToPDF(pdfDoc, contractInfo) {
        try {
            // Obtener la primera página (donde generalmente están los campos del contrato)
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            
            // Obtener dimensiones de la página
            const { width, height } = firstPage.getSize();
            
            // Cargar fuente
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = 10;
            
            // Posiciones aproximadas donde se suelen colocar los datos en contratos de arrendamiento
            // Estas posiciones pueden necesitar ajuste según la plantilla específica
            const fieldPositions = {
                // Datos del arrendatario
                nombreArrendatario: { x: 150, y: height - 200 },
                profesionArrendatario: { x: 150, y: height - 220 },
                direccionArrendatario: { x: 150, y: height - 240 },
                numeroPasaporte: { x: 150, y: height - 260 },
                numeroLicencia: { x: 150, y: height - 280 },
                
                // Datos del vehículo
                marcaModelo: { x: 150, y: height - 320 },
                placa: { x: 400, y: height - 320 },
                anio: { x: 150, y: height - 340 },
                color: { x: 400, y: height - 340 },
                numeroMotor: { x: 150, y: height - 360 },
                numeroChasis: { x: 400, y: height - 360 },
                
                // Datos del contrato
                fechaEntrega: { x: 150, y: height - 400 },
                fechaDevolucion: { x: 400, y: height - 400 },
                precioDiario: { x: 150, y: height - 420 },
                montoTotal: { x: 400, y: height - 420 },
                diasAlquiler: { x: 150, y: height - 440 },
                montoDeposito: { x: 400, y: height - 440 },
                
                // Fechas y firmas
                fechaFirma: { x: 150, y: height - 500 },
                ciudadFirma: { x: 400, y: height - 500 },
            };
            
            // Rellenar los campos de texto
            Object.entries(fieldPositions).forEach(([field, position]) => {
                const value = contractInfo[field];
                if (value) {
                    firstPage.drawText(String(value), {
                        x: position.x,
                        y: position.y,
                        size: fontSize,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                    });
                }
            });
        } catch (error) {
            console.error('Error agregando texto al PDF:', error);
        }
    }
}

export default ContractGenerator;
