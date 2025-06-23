//Imports
import brandsModel from "../models/Marcas.js";

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
    const { nombreMarca, descripcion } = req.body;

    const newBrand = new brandsModel({
      nombreMarca,
      descripcion,
      imagen: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newBrand.save();
    res.status(201).json({ message: "Marca creada exitosamente", brand: newBrand });
  } catch (error) {
    res.status(500).json({ message: "Error al crear marca: ", error });
  }
};

//Update - Put
brandsController.updateBrand = async (req, res) => {
  try {
    const { nombreMarca, descripcion } = req.body;
    const updatedBrand = await brandsModel.findByIdAndUpdate(
      req.params.id,
      {
        nombreMarca,
        descripcion,
        imagen: req.file ? `/uploads/${req.file.filename}` : undefined
      },
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