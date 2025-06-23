const contratosController = {};
import { Contratos } from "../models/Contratos.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
    secure: true
});

// Función helper para subir múltiples imágenes
const uploadMultipleImages = async (files, folder = "contratos") => {
    const uploadPromises = files.map(file => 
        cloudinary.uploader.upload(file.path, {
            folder: folder,
            allowed_formats: ["jpg", "png", "jpeg"]
        })
    );
    
    const results = await Promise.all(uploadPromises);
    return results.map(result => result.secure_url);
};

// Función helper para eliminar imágenes de Cloudinary
const deleteImageFromCloudinary = async (imageUrl, folder = "contratos") => {
    try {
        if (imageUrl) {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`${folder}/${publicId}`);
        }
    } catch (error) {
        console.log("Error al eliminar imagen:", error);
    }
};

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

// INSERT - Crear nuevo contrato (con soporte para imágenes)
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

        // Preparar datos del contrato
        let contratoData = {
            reservationId,
            clientID,
            carID,
            estado,
            datosHojaEstado: datosHojaEstado ? JSON.parse(datosHojaEstado) : undefined,
            datosArrendamiento: datosArrendamiento ? JSON.parse(datosArrendamiento) : undefined,
            documentos: documentos ? JSON.parse(documentos) : undefined
        };

        // Manejar subida de imágenes si existen archivos
        if (req.files && req.files.length > 0) {
            try {
                // Subir fotos de condición general
                const fotosCondicionGeneral = await uploadMultipleImages(req.files, "contratos/fotos-condicion");
                
                // Si ya existen datosHojaEstado, agregar las fotos
                if (contratoData.datosHojaEstado) {
                    contratoData.datosHojaEstado[0] = {
                        ...contratoData.datosHojaEstado[0],
                        fotosCondicionGeneral: fotosCondicionGeneral
                    };
                } else {
                    // Crear estructura básica con las fotos
                    contratoData.datosHojaEstado = [{
                        fotosCondicionGeneral: fotosCondicionGeneral
                    }];
                }
            } catch (uploadError) {
                return res.status(400).json({ 
                    message: "Error al subir imágenes", 
                    error: uploadError.message 
                });
            }
        }

        // Manejar firma de entrega si se proporciona
        if (req.body.firmaEntrega) {
            try {
                const firmaResult = await cloudinary.uploader.upload(req.body.firmaEntrega, {
                    folder: "contratos/firmas",
                    resource_type: "auto"
                });
                
                if (contratoData.datosHojaEstado && contratoData.datosHojaEstado[0]) {
                    contratoData.datosHojaEstado[0].firmaEntrega = firmaResult.secure_url;
                }
            } catch (firmaError) {
                console.log("Error al subir firma:", firmaError);
            }
        }

        // Manejar firmas de arrendamiento
        if (req.body.firmaArrendador || req.body.firmaArrendatario) {
            try {
                let firmasArrendamiento = {};
                
                if (req.body.firmaArrendador) {
                    const firmaArrendadorResult = await cloudinary.uploader.upload(req.body.firmaArrendador, {
                        folder: "contratos/firmas-arrendamiento",
                        resource_type: "auto"
                    });
                    firmasArrendamiento.firmaArrendador = firmaArrendadorResult.secure_url;
                }
                
                if (req.body.firmaArrendatario) {
                    const firmaArrendatarioResult = await cloudinary.uploader.upload(req.body.firmaArrendatario, {
                        folder: "contratos/firmas-arrendamiento",
                        resource_type: "auto"
                    });
                    firmasArrendamiento.firmaArrendatario = firmaArrendatarioResult.secure_url;
                }
                
                if (contratoData.datosArrendamiento && contratoData.datosArrendamiento[0]) {
                    contratoData.datosArrendamiento[0] = {
                        ...contratoData.datosArrendamiento[0],
                        ...firmasArrendamiento
                    };
                }
            } catch (firmaError) {
                console.log("Error al subir firmas de arrendamiento:", firmaError);
            }
        }

        const newContrato = new Contratos(contratoData);
        await newContrato.save();
        
        res.status(201).json({ 
            message: "Contrato creado exitosamente", 
            contrato: newContrato 
        });
    } catch (error) {
        res.status(400).json({ 
            message: "Error al crear contrato", 
            error: error.message 
        });
    }
};

// UPDATE - Actualizar contrato completo (con soporte para imágenes)
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

        // Buscar contrato existente
        const existingContrato = await Contratos.findById(req.params.id);
        if (!existingContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        // Preparar datos de actualización
        let updateData = {
            reservationId,
            clientID,
            carID,
            estado,
            datosHojaEstado: datosHojaEstado ? JSON.parse(datosHojaEstado) : existingContrato.datosHojaEstado,
            datosArrendamiento: datosArrendamiento ? JSON.parse(datosArrendamiento) : existingContrato.datosArrendamiento,
            documentos: documentos ? JSON.parse(documentos) : existingContrato.documentos
        };

        // Manejar nuevas imágenes de condición general
        if (req.files && req.files.length > 0) {
            try {
                // Eliminar imágenes anteriores si existen
                if (existingContrato.datosHojaEstado && 
                    existingContrato.datosHojaEstado[0] && 
                    existingContrato.datosHojaEstado[0].fotosCondicionGeneral) {
                    
                    const fotosAnteriores = Array.isArray(existingContrato.datosHojaEstado[0].fotosCondicionGeneral)
                        ? existingContrato.datosHojaEstado[0].fotosCondicionGeneral
                        : [existingContrato.datosHojaEstado[0].fotosCondicionGeneral];
                    
                    for (const foto of fotosAnteriores) {
                        await deleteImageFromCloudinary(foto, "contratos/fotos-condicion");
                    }
                }

                // Subir nuevas imágenes
                const nuevasFotos = await uploadMultipleImages(req.files, "contratos/fotos-condicion");
                
                if (updateData.datosHojaEstado && updateData.datosHojaEstado[0]) {
                    updateData.datosHojaEstado[0].fotosCondicionGeneral = nuevasFotos;
                }
            } catch (uploadError) {
                return res.status(400).json({ 
                    message: "Error al actualizar imágenes", 
                    error: uploadError.message 
                });
            }
        }

        // Manejar actualización de firmas
        if (req.body.firmaEntrega) {
            try {
                // Eliminar firma anterior si existe
                if (existingContrato.datosHojaEstado && 
                    existingContrato.datosHojaEstado[0] && 
                    existingContrato.datosHojaEstado[0].firmaEntrega) {
                    await deleteImageFromCloudinary(existingContrato.datosHojaEstado[0].firmaEntrega, "contratos/firmas");
                }

                const firmaResult = await cloudinary.uploader.upload(req.body.firmaEntrega, {
                    folder: "contratos/firmas",
                    resource_type: "auto"
                });
                
                if (updateData.datosHojaEstado && updateData.datosHojaEstado[0]) {
                    updateData.datosHojaEstado[0].firmaEntrega = firmaResult.secure_url;
                }
            } catch (firmaError) {
                console.log("Error al actualizar firma:", firmaError);
            }
        }

        const updatedContrato = await Contratos.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({ 
            message: "Contrato actualizado exitosamente", 
            contrato: updatedContrato 
        });
    } catch (error) {
        res.status(400).json({ 
            message: "Error al actualizar contrato", 
            error: error.message 
        });
    }
};

// UPDATE - Actualizar hoja de estado (con soporte para imágenes)
contratosController.updateHojaEstado = async (req, res) => {
    try {
        const { datosHojaEstado } = req.body;
        
        // Buscar contrato existente
        const existingContrato = await Contratos.findById(req.params.id);
        if (!existingContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        let updateData = {
            datosHojaEstado: datosHojaEstado ? JSON.parse(datosHojaEstado) : {}
        };

        // Manejar imágenes de condición general
        if (req.files && req.files.length > 0) {
            try {
                // Eliminar imágenes anteriores si existen
                if (existingContrato.datosHojaEstado && 
                    existingContrato.datosHojaEstado[0] && 
                    existingContrato.datosHojaEstado[0].fotosCondicionGeneral) {
                    
                    const fotosAnteriores = Array.isArray(existingContrato.datosHojaEstado[0].fotosCondicionGeneral)
                        ? existingContrato.datosHojaEstado[0].fotosCondicionGeneral
                        : [existingContrato.datosHojaEstado[0].fotosCondicionGeneral];
                    
                    for (const foto of fotosAnteriores) {
                        await deleteImageFromCloudinary(foto, "contratos/fotos-condicion");
                    }
                }

                // Subir nuevas imágenes
                const fotosCondicionGeneral = await uploadMultipleImages(req.files, "contratos/fotos-condicion");
                
                if (updateData.datosHojaEstado[0]) {
                    updateData.datosHojaEstado[0].fotosCondicionGeneral = fotosCondicionGeneral;
                }
            } catch (uploadError) {
                return res.status(400).json({ 
                    message: "Error al subir imágenes", 
                    error: uploadError.message 
                });
            }
        }

        // Manejar firma de entrega
        if (req.body.firmaEntrega) {
            try {
                // Eliminar firma anterior si existe
                if (existingContrato.datosHojaEstado && 
                    existingContrato.datosHojaEstado[0] && 
                    existingContrato.datosHojaEstado[0].firmaEntrega) {
                    await deleteImageFromCloudinary(existingContrato.datosHojaEstado[0].firmaEntrega, "contratos/firmas");
                }

                const firmaResult = await cloudinary.uploader.upload(req.body.firmaEntrega, {
                    folder: "contratos/firmas",
                    resource_type: "auto"
                });
                
                if (updateData.datosHojaEstado[0]) {
                    updateData.datosHojaEstado[0].firmaEntrega = firmaResult.secure_url;
                }
            } catch (firmaError) {
                console.log("Error al subir firma:", firmaError);
            }
        }

        const updatedContrato = await Contratos.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({ 
            message: "Hoja de estado actualizada exitosamente", 
            contrato: updatedContrato 
        });
    } catch (error) {
        res.status(400).json({ 
            message: "Error al actualizar hoja de estado", 
            error: error.message 
        });
    }
};

// UPDATE - Actualizar datos de arrendamiento (con soporte para firmas)
contratosController.updateDatosArrendamiento = async (req, res) => {
    try {
        const { datosArrendamiento } = req.body;
        
        // Buscar contrato existente
        const existingContrato = await Contratos.findById(req.params.id);
        if (!existingContrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        let updateData = {
            datosArrendamiento: datosArrendamiento ? JSON.parse(datosArrendamiento) : {}
        };

        // Manejar firmas de arrendamiento
        if (req.body.firmaArrendador || req.body.firmaArrendatario) {
            try {
                // Eliminar firmas anteriores si existen
                if (existingContrato.datosArrendamiento && existingContrato.datosArrendamiento[0]) {
                    if (existingContrato.datosArrendamiento[0].firmaArrendador) {
                        await deleteImageFromCloudinary(existingContrato.datosArrendamiento[0].firmaArrendador, "contratos/firmas-arrendamiento");
                    }
                    if (existingContrato.datosArrendamiento[0].firmaArrendatario) {
                        await deleteImageFromCloudinary(existingContrato.datosArrendamiento[0].firmaArrendatario, "contratos/firmas-arrendamiento");
                    }
                }

                // Subir nuevas firmas
                if (req.body.firmaArrendador) {
                    const firmaArrendadorResult = await cloudinary.uploader.upload(req.body.firmaArrendador, {
                        folder: "contratos/firmas-arrendamiento",
                        resource_type: "auto"
                    });
                    updateData.datosArrendamiento[0].firmaArrendador = firmaArrendadorResult.secure_url;
                }
                
                if (req.body.firmaArrendatario) {
                    const firmaArrendatarioResult = await cloudinary.uploader.upload(req.body.firmaArrendatario, {
                        folder: "contratos/firmas-arrendamiento",
                        resource_type: "auto"
                    });
                    updateData.datosArrendamiento[0].firmaArrendatario = firmaArrendatarioResult.secure_url;
                }
            } catch (firmaError) {
                return res.status(400).json({ 
                    message: "Error al subir firmas", 
                    error: firmaError.message 
                });
            }
        }

        const updatedContrato = await Contratos.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({ 
            message: "Datos de arrendamiento actualizados exitosamente", 
            contrato: updatedContrato 
        });
    } catch (error) {
        res.status(400).json({ 
            message: "Error al actualizar datos de arrendamiento", 
            error: error.message 
        });
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

// DELETE - Eliminar contrato (con limpieza de imágenes)
contratosController.deleteContrato = async (req, res) => {
    try {
        const contrato = await Contratos.findById(req.params.id);
        
        if (!contrato) {
            return res.status(404).json({ message: "Contrato no encontrado" });
        }

        // Eliminar imágenes de Cloudinary antes de eliminar el contrato
        try {
            // Eliminar fotos de condición general
            if (contrato.datosHojaEstado && 
                contrato.datosHojaEstado[0] && 
                contrato.datosHojaEstado[0].fotosCondicionGeneral) {
                
                const fotos = Array.isArray(contrato.datosHojaEstado[0].fotosCondicionGeneral)
                    ? contrato.datosHojaEstado[0].fotosCondicionGeneral
                    : [contrato.datosHojaEstado[0].fotosCondicionGeneral];
                
                for (const foto of fotos) {
                    await deleteImageFromCloudinary(foto, "contratos/fotos-condicion");
                }
            }

            // Eliminar firma de entrega
            if (contrato.datosHojaEstado && 
                contrato.datosHojaEstado[0] && 
                contrato.datosHojaEstado[0].firmaEntrega) {
                await deleteImageFromCloudinary(contrato.datosHojaEstado[0].firmaEntrega, "contratos/firmas");
            }

            // Eliminar firmas de arrendamiento
            if (contrato.datosArrendamiento && contrato.datosArrendamiento[0]) {
                if (contrato.datosArrendamiento[0].firmaArrendador) {
                    await deleteImageFromCloudinary(contrato.datosArrendamiento[0].firmaArrendador, "contratos/firmas-arrendamiento");
                }
                if (contrato.datosArrendamiento[0].firmaArrendatario) {
                    await deleteImageFromCloudinary(contrato.datosArrendamiento[0].firmaArrendatario, "contratos/firmas-arrendamiento");
                }
            }
        } catch (deleteImagesError) {
            console.log("Error al eliminar imágenes:", deleteImagesError);
        }

        // Eliminar el contrato de la base de datos
        await Contratos.findByIdAndDelete(req.params.id);
        
        res.json({ message: "Contrato eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar contrato", error: error.message });
    }
};

export default contratosController;