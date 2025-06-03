import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clientes.js";
import empleadosModel from "../models/Empleados.js";
import { sendEmail, HTMLRecoveryEmail } from "../utils/mailPasswordRecovery.js";
import { config } from "../config.js";

const passwordRecoveryController = {};

passwordRecoveryController.requestCode = async (req, res) => {
  const { correo } = req.body;
  try {
    let userFound;
    let userType;
    userFound = await clientsModel.findOne({ correo });
    if (userFound) {
      userType = "cliente";
    } else {
      userFound = await empleadosModel.findOne({ correo });
      userType = "empleado";
    }
    if (!userFound) {
      return res.json({ message: "Usuario no encontrado" });
    }
    const code = Math.floor(10000 + Math.random() * 60000).toString();
    const token = jsonwebtoken.sign(
      { correo, code, userType, verfied: false },
      config.JWT.secret,
      { expiresIn: "25m" }
    );
    res.cookie("tokenRecoveryCode", token, { maxAge: 25 * 60 * 1000 });
    await sendEmail(
      correo,
      "Código de recuperación de contraseña",
      `Tu código de verificación es ${code}`,
      HTMLRecoveryEmail(code)
    );
    res.json({ message: "Código de verificación enviado" });
  } catch (error) {
    console.log("error" + error);
  }
};

passwordRecoveryController.verifyCode = async (req, res) => {
  const { code } = req.body;
  try {
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Token de recuperación no proporcionado o expirado." });
    }
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    if (decoded.code !== code) {
      return res.json({ message: "Código inválido" });
    }
    const newToken = jsonwebtoken.sign(
      {
        correo: decoded.correo,
        code: decoded.code,
        userType: decoded.userType,
        verfied: true,
      },
      config.JWT.secret,
      { expiresIn: "25m" }
    );
    res.cookie("tokenRecoveryCode", newToken, { maxAge: 25 * 60 * 1000 });
    res.json({ message: "Código verificado correctamente" });
  } catch (error) {
    console.log("error" + error);
  }
};

passwordRecoveryController.newPassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Token de recuperación no proporcionado o expirado." });
    }
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    if (!decoded.verfied) {
      return res.json({ message: "Código no verificado" });
    }
    const { correo } = decoded;
    // Verificar que la nueva contraseña no sea igual a la anterior
    let user;
    if (decoded.userType === "cliente") {
      user = await clientsModel.findOne({ correo });
    } else if (decoded.userType === "empleado") {
      user = await empleadosModel.findOne({ correo });
    }
    if (!user) {
      return res.json({ message: "Usuario no encontrado" });
    }
    const isSame = await bcryptjs.compare(newPassword, user.contraseña);
    if (isSame) {
      return res.json({ message: "La nueva contraseña no puede ser igual a la anterior." });
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    if (decoded.userType === "cliente") {
      await clientsModel.findOneAndUpdate(
        { correo },
        { contraseña: hashedPassword },
        { new: true }
      );
    } else if (decoded.userType === "empleado") {
      await empleadosModel.findOneAndUpdate(
        { correo },
        { contraseña: hashedPassword },
        { new: true }
      );
    }
    res.clearCookie("tokenRecoveryCode");
    res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    console.log("error" + error);
  }
};

export default passwordRecoveryController;
