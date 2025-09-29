import clientsModel from "../models/Clients.js";
import empleadosModel from "../models/Employees.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config.js";
import sendWelcomeMail from "../utils/mailWelcome.js";
import { sendVerificationEmail } from "../utils/mailVerifyAccount.js";

const loginController = {};

loginController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let userFound;
    let userType;

    // Validación robusta de emailAdmin
    if (!config.emailAdmin || !config.emailAdmin.email || !config.emailAdmin.password) {
      return res.status(500).json({ message: "Configuración de emailAdmin incompleta en config.js" });
    }

    if (email === config.emailAdmin.email && password === config.emailAdmin.password) {
      userType = "Administrador";
      userFound = { _id: "Admin" };
    }
    else {
      // Buscar empleados por email
      userFound = await empleadosModel.findOne({ email: email });
      if (userFound) {
        userType = userFound.rol;
      }

      if (!userFound) {
        // Buscar clientes por correo
        userFound = await clientsModel.findOne({ email: email });
        if (userFound) {
          userType = "Cliente";
        }
      }
    }

    if (!userFound) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Si es cliente y no está verificado
    if (userType === "Cliente" && userFound.isVerified === false) {
      // Generar código de verificación usando crypto (más seguro)
      const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
      
      // JWT Sign
      const tokenCode = jwt.sign(
        { email, verificationCode },
        config.JWT.secret,
        { expiresIn: "15m" }
      );

      // Cookie setup con configuración más robusta
      res.cookie("VerificationToken", tokenCode, { 
        maxAge: 15 * 60 * 1000, // 15 minutos
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      // Usar la función de utilidad existente para enviar email
      try {
        await sendVerificationEmail(email, userFound.name, userFound.lastName, verificationCode);
        return res.json({ 
          message: "Cuenta no verificada. Se ha enviado un nuevo código de verificación a tu correo.", 
          needVerification: true 
        });
      } catch (emailError) {
        console.error('Error enviando correo de verificación:', emailError);
        return res.status(500).json({ 
          message: "Error enviando correo de verificación", 
          needVerification: true 
        });
      }
    }

    // Verificar contraseña
    if (userType !== "Administrador") {
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        //Invalid password, increment login attempts
        userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;
        if (userFound.loginAttempts > maxAttempts) {
          userFound.lockTime = Date.now() + lockTime;
        }
        await userFound.save();
        if (userFound.loginAttempts > maxAttempts) {
          return res.status(403).json({message: "Account locked. Too many failed attempts."});
        }
        return res.status(400).json({ message: "Contraseña inválida" });
      }
    }

    jsonwebtoken.sign(
      { id: userFound._id, userType },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn },
      (error, token) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Error generando token" });
        }

        res.cookie("authToken", token);

        // Formatear información del usuario para enviar al frontend
        let userData = null;
        if (userType === "Cliente") {
          userData = {
            id: userFound._id,
            name: userFound.name,
            lastName: userFound.lastName,
            email: userFound.email,
            phone: userFound.phone,
            birthDate: userFound.birthDate,
            photo: userFound.photo,
            isVerified: userFound.isVerified,
            fechaRegistro: userFound.createdAt
          };
        }
        else if (userType === "Administrador") {
          userData = {
            id: userFound._id,
            name: "Administrador",
            email: config.emailAdmin.email,
            rol: "Administrador"
          };
        } else {
          // Empleados (Gestor, Empleado)
          userData = {
            id: userFound._id,
            name: userFound.name,
            email: userFound.email,
            phone: userFound.phone,
            birthDate: userFound.birthDate,
            passport: userFound.passport,
            license: userFound.license,
            isVerified: userFound.isVerified,
            registrationDate: userFound.createdAt
          };
        }

        res.json({
          message: "login exitoso",
          userType,
          user: userData
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Nueva función para generar token de verificación desde login
loginController.generateVerificationToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    // Buscar el cliente
    const client = await clientsModel.findOne({ email });
    
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (client.isVerified) {
      return res.status(400).json({ message: "El correo ya está verificado" });
    }

    // Generar nuevo código de verificación
    const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    // JWT Sign
    const token = jwt.sign(
      { email, verificationCode },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    // Cookie setup
    res.cookie("VerificationToken", token, { 
      maxAge: 15 * 60 * 1000, // 15 minutos
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Enviar email de verificación
    try {
      await sendVerificationEmail(client.email, client.name, client.lastName, verificationCode);
      res.status(200).json({ 
        message: "Código de verificación enviado exitosamente"
      });
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      res.status(500).json({ 
        message: "Error enviando el correo de verificación"
      });
    }

  } catch (error) {
    console.error('Error en generateVerificationToken:', error);
    res.status(500).json({ 
      message: "Error interno del servidor" 
    });
  }
};

export default loginController;