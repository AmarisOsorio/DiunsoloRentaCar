//Imports
import brandsModel from "../models/Marcas.js";
import { v2 as cloudinary } from "cloudinary";
import { config as appConfig } from "../config.js";

// Configura Cloudinary (puedes mover esto a un archivo de configuración si ya lo tienes)
cloudinary.config({
  cloud_name: appConfig.cloudinary.cloudinary_name,
  api_key: appConfig.cloudinary.cloudinary_api_key,
  api_secret: appConfig.cloudinary.cloudinary_api_secret,
});

const brandsController = {};

//Select - Get [All]
brandsController.getBrands = async (req, res) => {
  try {
    const brands = await brandsModel.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener marcas: ", error });
  }
};

//Select - Get [By ID]
brandsController.getBrandById = async (req, res) => {
  try {
    const brand = await brandsModel.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener marca: ", error });
  }
};

//Insert - Post
brandsController.addBrand = async (req, res) => {
  try {
    const { nombreMarca } = req.body;
    let logoUrl = null;

    if (req.file) {
      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "brands" },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: "Error subiendo a Cloudinary", error });
          }
          logoUrl = result.secure_url;
          const newBrand = new brandsModel({
            nombreMarca: nombreMarca,
            logo: logoUrl
          });
          await newBrand.save();
          res.status(201).json({ message: "Marca creada exitosamente"});
        }
      );
      // Escribir el buffer en el stream
      result.end(req.file.buffer);
    } else {
      return res.status(400).json({ message: "No se recibió imagen para la marca" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al crear marca: ", error });
    console.error("Error al crear marca:", error);
  }
};

//Update - Put
brandsController.updateBrand = async (req, res) => {
  try {
    const { nombreMarca, descripcion } = req.body;
    const updateData = {
      nombreMarca,
      descripcion
    };

    if (req.file) {
      // Subir nueva imagen a Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image", folder: "brands" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      updateData.logo = result.secure_url;
    }

    const updatedBrand = await brandsModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }

    res.json({ message: "Marca actualizada exitosamente", brand: updatedBrand });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar marca: ", error });
  }
};

//Delete - Delete
brandsController.deleteBrand = async (req, res) => {
  try {
    const deletedBrand = await brandsModel.findByIdAndDelete(req.params.id);
    if (!deletedBrand) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }
    res.json({ message: "Marca eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar marca: ", error });
  }
};

//Export
export default brandsController;