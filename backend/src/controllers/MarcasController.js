import MarcasModel from "../models/Marcas.js"; 
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
    secure: true
});

const MarcasController = {}

MarcasController.getAllMarcas = async (req, res) => {
    const Marcas = await MarcasModel.find();
    res.json(Marcas);
}

MarcasController.createMarcas = async (req, res) => {
    try {
        const { nombreMarca} = req.body;
        let imageURL = ""

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "public",
                allowed_formats: ["jpg", "png", "jpeg"]
              
            });
            imageURL = result.secure_url;
        }

        const newMarcas = new MarcasModel({
            nombreMarca,
            logo: imageURL
        });
        newMarcas.save()

        res.json({message: "Marcas Saved"})

    } catch (error) {
        console.log("error"+ error);
    }
}


MarcasController.deleteMarcas = async (req, res) => {
    await MarcasModel.findByIdAndDelete(req.params.id);
    res.json({message: "employees Deleted"})
}; 


//update
MarcasController.updateMarcas = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreMarca } = req.body;
        
        // Buscar la marca existente
        const existingMarca = await MarcasModel.findById(id);
        if (!existingMarca) {
            return res.status(404).json({ message: "Marca no encontrada" });
        }

        // Preparar los datos a actualizar
        const updateData = {};
        
        // Actualizar nombre si se proporciona
        if (nombreMarca) {
            updateData.nombreMarca = nombreMarca;
        }

        // Si se proporciona una nueva imagen
        if (req.file) {
            // Eliminar la imagen anterior de Cloudinary si existe
            if (existingMarca.logo) {
                try {
                    // Extraer el public_id de la URL de Cloudinary
                    const publicId = existingMarca.logo.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`public/${publicId}`);
                } catch (deleteError) {
                    console.log("Error al eliminar imagen anterior:", deleteError);
                }
            }

            // Subir la nueva imagen
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "public",
                allowed_formats: ["jpg", "png", "jpeg"]
            });
            
            updateData.logo = result.secure_url;
        }

        // Actualizar la marca en la base de datos
        const updatedMarca = await MarcasModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.json({
            message: "Marca actualizada exitosamente",
            marca: updatedMarca
        });

    } catch (error) {
        console.log("Error al actualizar marca:", error);
        res.status(500).json({ 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};


export default MarcasController;