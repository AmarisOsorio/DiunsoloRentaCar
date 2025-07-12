import ClientsModel from "../models/Clientes.js";

// CLOUDINARY SETUP
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

const clientsController = {
  getClients: async (req, res) => {
    try {
      const clients = await ClientsModel.find().sort({ createdAt: -1 });
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener clientes", error: error.message });
    }
  },

  getClientById: async (req, res) => {
    try {
      const client = await ClientsModel.findById(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "ID inválido o error en la consulta" });
    }
  },

  updateClient: async (req, res) => {
    try {
      const { id } = req.params;
      let { 
        nombre, 
        apellido, 
        correo, 
        contraseña, 
        telefono, 
        fechaDeNacimiento 
      } = req.body;

      const currentClient = await ClientsModel.findById(id);
      if (!currentClient) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }

      let updateData = {
        nombre,
        apellido,
        telefono,
        fechaDeNacimiento
      };

      if (correo && correo !== currentClient.correo) {
        const existsEmail = await ClientsModel.findOne({ correo, _id: { $ne: id } });
        if (existsEmail) {
          return res.status(400).json({ message: "El correo ya está en uso por otro cliente" });
        }
        updateData.correo = correo;
      }

      if (contraseña && contraseña.trim()) {
        updateData.contraseña = await bcryptjs.hash(contraseña, 10);
      }

      if (telefono) {
        let clean = (telefono + '').replace(/[^0-9]/g, '');
        if (clean.length === 8) {
          telefono = clean.slice(0, 4) + '-' + clean.slice(4);
        }
        const regex = /^[267]\d{3}-\d{4}$/;
        if (!regex.test(telefono)) {
          return res.status(400).json({ 
            message: 'El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7' 
          });
        }
        updateData.telefono = telefono;
      }

      if (req.files) {
        if (req.files.licenciaFrente) {
          updateData.licenciaFrente = await uploadBufferToCloudinary(
            req.files.licenciaFrente[0].buffer, 
            'diunsolo/licencias'
          );
        }
        
        if (req.files.licenciaReverso) {
          updateData.licenciaReverso = await uploadBufferToCloudinary(
            req.files.licenciaReverso[0].buffer, 
            'diunsolo/licencias'
          );
        }
        
        if (req.files.pasaporteFrente) {
          updateData.pasaporteFrente = await uploadBufferToCloudinary(
            req.files.pasaporteFrente[0].buffer, 
            'diunsolo/pasaportes'
          );
        }
        
        if (req.files.pasaporteReverso) {
          updateData.pasaporteReverso = await uploadBufferToCloudinary(
            req.files.pasaporteReverso[0].buffer, 
            'diunsolo/pasaportes'
          );
        }
      }

      const updated = await ClientsModel.findByIdAndUpdate(id, updateData, { new: true });

      res.json({ 
        message: "Cliente actualizado exitosamente", 
        cliente: updated 
      });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar cliente", error: error.message });
    }
  },

  deleteClient: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deleted = await ClientsModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      
      res.json({ message: "Cliente eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar cliente", error: error.message });
    }
  },

  checkEmailExists: async (req, res) => {
    try {
      const { correo } = req.body;
      
      const exists = await ClientsModel.findOne({ correo });
      const result = { exists: !!exists };
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error al verificar el correo" });
    }
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