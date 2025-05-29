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

// INSERT
clientsController.insertClient = async (req, res) => {
  try {
    const { nombre_completo, correo, contraseña, telefono, fecha_de_nacimiento, pasaporte_dui, licencia } = req.body;
    const newClient = new ClientsModel({ nombre_completo, correo, contraseña, telefono, fecha_de_nacimiento, pasaporte_dui, licencia });
    await newClient.save();
    res.json({ message: "Cliente guardado" });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar cliente", error });
  }
};

// UPDATE
clientsController.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, correo, contraseña, telefono, fecha_de_nacimiento, pasaporte_dui, licencia } = req.body;
    const updated = await ClientsModel.findByIdAndUpdate(
      id,
      { nombre_completo, correo, contraseña, telefono, fecha_de_nacimiento, pasaporte_dui, licencia },
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

export default clientsController;
