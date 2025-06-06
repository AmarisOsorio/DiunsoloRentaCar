import clientsModel from "../models/Clientes.js";
import empleadosModel from "../models/Empleados.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const loginController = {};

loginController.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    let userFound;
    let userType;
    // Validación robusta de emailAdmin
    if (!config.emailAdmin || !config.emailAdmin.email || !config.emailAdmin.password) {
      return res.status(500).json({ message: "Configuración de emailAdmin incompleta en config.js" });
    }
    if (
      correo === config.emailAdmin.email &&
      contraseña === config.emailAdmin.password
    ) {
      userType = "Admin";
      userFound = { _id: "Admin" };
    } else {
      userFound = await empleadosModel.findOne({ correo });
      userType = "Empleado";
      if (!userFound) {
        userFound = await clientsModel.findOne({ correo });
        userType = "Cliente";
      }
    }
    if (!userFound) {
      return res.json({ message: "Usuario no encontrado" });
    }
    if (userType !== "Admin") {
      const isMatch = await bcryptjs.compare(contraseña, userFound.contraseña);
      if (!isMatch) {
        return res.json({ message: "Contraseña inválida" });
      }
    }
    jsonwebtoken.sign(
      { id: userFound._id, userType },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn },
      (error, token) => {
        if (error) console.log(error);
        res.cookie("authToken", token);
        res.json({ message: "login exitoso" });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
export default loginController;
