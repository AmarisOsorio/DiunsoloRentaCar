// Controlador para el modelo Clientes
import ClientsModel from "../models/Clientes.js";

const clientsController = {};

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
    const { nombreCompleto, correo, contrasena, telefono, fechaDeNacimiento, pasaporteDui, licencia } = req.body;
    const updated = await ClientsModel.findByIdAndUpdate(
      id,
      { nombreCompleto, correo, contrasena, telefono, fechaDeNacimiento, pasaporteDui, licencia },
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

export default clientsController;
