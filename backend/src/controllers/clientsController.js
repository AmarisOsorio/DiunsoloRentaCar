//Imports
import clientsModel from "../models/Clients.js";
import bcryptjs from "bcryptjs";
import { config } from "../config.js";

//Controller
const clientsController = {};

// CLOUDINARY SETUP
import cloudinary from 'cloudinary';

// OJO: Se utilizara la parte de Cloudinary en el código no importandolo
//Cloudinary config
cloudinary.v2.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

//Cloudinary image upload function
const uploadImage = async (file, folder = "public") => {
  try {
    if (!file || !file.path) return "";
    
    const result = await cloudinary.v2.uploader.upload(
      file.path, 
      {
        folder: folder,
        allowed_formats: ["jpg", "png", "jpeg"]
      }
    );
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return "";
  }
};

//Select - Get [All]
clientsController.getClients = async (req, res) => {
  try {
    const clients = await clientsModel.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes", error: error.message });
  }
};

// Select - Get [By ID]
clientsController.getClientById = async (req, res) => {
  try {
    const client = await clientsModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: "ID inválido o error en la consulta" });
  }
};

//Update - Put [By ID]
clientsController.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      name,
      lastName,
      email,
      password,
      phone,
      birthDate
    } = req.body;

    const currentClient = await clientsModel.findById(id);
    if (!currentClient) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    let updateData = {
      name,
      lastName,
      phone,
      birthDate
    };

    if (email && email !== currentClient.email) {
      const existsEmail = await clientsModel.findOne({ correo, _id: { $ne: id } });
      if (existsEmail) {
        return res.status(400).json({ message: "El correo ya está en uso por otro cliente" });
      }
      updateData.email = email;
    }

    if (password && password.trim()) {
      updateData.password = await bcryptjs.hash(password, 10);
    }

    //Validate phone format
    const phoneRegex = /^[267]\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7" });
    }

    //Setup images for cloudinary
    let lFrontUrl = "";
    let lBackUrl = "";
    let pFrontUrl = "";
    let pBackUrl = "";

    if (req.files) {      
      if (req.files.licenseFront && req.files.licenseFront[0]) {
        lFrontUrl = await uploadImage(req.files.licenseFront[0], "diunsolo/licenses");
      }
      
      if (req.files.licenseBack && req.files.licenseBack[0]) {
        lBackUrl = await uploadImage(req.files.licenseBack[0], "diunsolo/licenses");
      }
      
      if (req.files.passportFront && req.files.passportFront[0]) {
        pFrontUrl = await uploadImage(req.files.passportFront[0], "diunsolo/passports");
      }
      
      if (req.files.passportBack && req.files.passportBack[0]) {
        pBackUrl = await uploadImage(req.files.passportBack[0], "diunsolo/passports");
      }
    }

    const updated = await clientsModel.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      message: "Cliente actualizado exitosamente",
      client: updated
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar cliente", error: error.message });
  }
};

//Delete [By ID]
clientsController.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await clientsModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar cliente", error: error.message });
  }
};

//Get [Recent Clients]
clientsController.getNewClients = async (req, res) => {
try {
const result = await clientsModel.aggregate([
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$createdAt"
        }
      },
      totalClients: { $sum: 1 }
    }
  },
  {
    $sort: { _id: -1 }
  }
]);

  res.status(200).json(result);
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Existing email check
clientsController.checkEmailExists = async (req, res) => {
try {
  const { correo } = req.body;

  const exists = await clientsModel.findOne({ correo });
  const result = { exists: !!exists };

  res.json(result);
} catch (error) {
  res.status(500).json({ message: "Error al verificar el correo" });
}
};

//Export
export default clientsController;