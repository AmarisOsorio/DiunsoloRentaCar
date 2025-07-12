// Controlador para el modelo Clientes
import ClientsModel from "../models/Clientes.js";
import mongoose from "mongoose";


const clientsController = {};

// CLOUDINARY SETUP
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// El registro de clientes (POST) ha sido movido a registerClientsController.js

// GET BY ID
clientsController.getClientById = async (req, res) => {
  try {
    const client = await ClientsModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: "ID inválido o error en la consulta" });
  }
};

// UPDATE
clientsController.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, apellido, correo, contraseña, telefono, fechaDeNacimiento, licenciaFrente, licenciaReverso, pasaporteFrente, pasaporteReverso } = req.body;
    // Normalizar teléfono a 0000-0000 y validar
    if (telefono) {
      let clean = (telefono + '').replace(/[^0-9]/g, '');
      if (clean.length === 8) {
        telefono = clean.slice(0, 4) + '-' + clean.slice(4);
      }
      // Validación de formato y primer dígito
      const regex = /^[267]\d{3}-\d{4}$/;
      if (!regex.test(telefono)) {
        return res.status(400).json({ message: 'El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7' });
      }
    }
    const updated = await ClientsModel.findByIdAndUpdate(
      id,
      { nombre, apellido, correo, contraseña, telefono, fechaDeNacimiento, licenciaFrente, licenciaReverso, pasaporteFrente, pasaporteReverso },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente actualizado" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar cliente", error });
  }
};

// DELETE
clientsController.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await ClientsModel.findByIdAndDelete(id);
    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar cliente", error });
  }
};

// GET ALL
clientsController.getClients = async (req, res) => {
  try {
    const clients = await ClientsModel.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes", error });
  }
};

// Verificar si un correo ya está registrado
clientsController.checkEmailExists = async (req, res) => {
  try {
    const { correo } = req.body;
    const exists = await ClientsModel.findOne({ correo });
    res.json({ exists: !!exists });
  } catch (error) {
    res.status(500).json({ message: "Error al verificar el correo" });
  }
};


/************************* NUEVOS CLIENTES REGISTRADOS *******************************/

clientsController.getNuevosClientesRegistrados = async (req, res) => {
    try {
        const resultado = await ClientsModel.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$createdAt" 
                        }
                    },
                    totalClientes: { $sum: 1 }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);

        res.status(200).json(resultado);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export default clientsController;
