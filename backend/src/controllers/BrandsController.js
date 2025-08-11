import BrandsModel from "../models/Brands.js"; 
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
    secure: true
});

const BrandsController = {}

// Get all brands
BrandsController.getAllBrands = async (req, res) => {
    try {
        const brands = await BrandsModel.find();
        res.status(200).json(brands);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({message: "Error interno del servidor"});
    }
}

// Create new brand
BrandsController.createBrand = async (req, res) => {
    try {
        const { brandName } = req.body;
        
        // Basic validation
        if (!brandName) {
            return res.status(400).json({message: "El nombre de la marca es requerido"});
        }

        let imageURL = ""

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "public",
                allowed_formats: ["jpg", "png", "jpeg"]
            });
            imageURL = result.secure_url;
        } else {
            return res.status(400).json({message: "El logo es requerido"});
        }

        const newBrand = new BrandsModel({
            brandName,
            logo: imageURL
        });
        
        await newBrand.save();
        res.status(201).json({message: "Marca guardada exitosamente"});

    } catch (error) {
        console.log("Error: " + error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({message: "Ya existe una marca con ese nombre"});
        }
        
        res.status(500).json({message: "Error interno del servidor"});
    }
}

// Delete brand
BrandsController.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if brand exists
        const brand = await BrandsModel.findById(id);
        if (!brand) {
            return res.status(404).json({message: "Marca no encontrada"});
        }

        await BrandsModel.findByIdAndDelete(id);
        res.status(200).json({message: "Marca eliminada exitosamente"});
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({message: "Error interno del servidor"});
    }
}; 

// Update brand
BrandsController.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { brandName } = req.body;
        
        // Find existing brand
        const existingBrand = await BrandsModel.findById(id);
        if (!existingBrand) {
            return res.status(404).json({ message: "Marca no encontrada" });
        }

        // Prepare update data
        const updateData = {};
        
        // Update name if provided
        if (brandName) {
            updateData.brandName = brandName;
        }

        // Handle new image upload
        if (req.file) {
            // Delete old image from Cloudinary if exists
            if (existingBrand.logo) {
                try {
                    // Extract public_id from Cloudinary URL
                    const publicId = existingBrand.logo.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`public/${publicId}`);
                } catch (deleteError) {
                    console.log("Error al eliminar imagen anterior:", deleteError);
                }
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "public",
                allowed_formats: ["jpg", "png", "jpeg"]
            });
            
            updateData.logo = result.secure_url;
        }

        // Update brand in database
        const updatedBrand = await BrandsModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Marca actualizada exitosamente"
        });

    } catch (error) {
        console.log("Error al actualizar marca:", error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({message: "Ya existe una marca con ese nombre"});
        }
        
        res.status(500).json({ 
            message: "Error interno del servidor"
        });
    }
};

export default BrandsController;