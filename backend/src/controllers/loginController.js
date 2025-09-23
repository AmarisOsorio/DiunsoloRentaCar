import clientsModel from "../models/Clients.js";
import empleadosModel from "../models/Employees.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";
import sendWelcomeMail from "../utils/mailWelcome.js";


const loginController = {};

loginController.login = async (req, res) => {
  const { email, password } = req.body; // Changed from correo/contraseña to email/password

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
      // Buscar empleados por email (changed from correo_electronico)
      userFound = await empleadosModel.findOne({ email: email });
      if (userFound) {
        userType = userFound.rol; // Use the actual role from database
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
      // Generar y enviar código de verificación
      const nodemailer = await import("nodemailer");
      const { fileURLToPath } = await import('url');
      const path = await import('path');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let verificationCode = '';
      for (let i = 0; i < 6; i++) {
        verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const tokenCode = jsonwebtoken.sign(
        { email, verificationCode },
        config.JWT.secret,
        { expiresIn: "15m" }
      );
      res.cookie("VerificationToken", tokenCode, { maxAge: 15 * 60 * 1000 });
      const transporter = nodemailer.default.createTransport({
        service: "gmail",
        auth: {
          user: config.email.email_user,
          pass: config.email.email_pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      // Usar plantilla HTMLVerifyAccountEmail
      const { HTMLVerifyAccountEmail } = await import('../utils/mailVerifyAccount.js');
      const mailOptions = {
        from: config.email.email_user,
        to: email,
        subject: "Verificación de correo - Código de activación | Diunsolo RentaCar",
        html: HTMLVerifyAccountEmail(verificationCode),
        attachments: [
          {
            filename: 'diunsolologo.png',
            path: path.join(__dirname, '../../../frontend/src/assets/diunsolologo.png'),
            cid: 'diunsolologo'
          }
        ],
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error enviando correo de verificación:', error);
          return res.status(500).json({ message: "Error enviando correo de verificación", error: error.toString() });
        }
        return res.json({ message: "Cuenta no verificada. Se ha enviado un nuevo código de verificación a tu correo.", needVerification: true });
      });
      return;
    }


    //Check if user is locked
  if (userType !== "Admin") {
    if (userFound.lockTime && userFound.lockTime > Date.now()) {
      const remainingTime = Math.ceil((userFound.lockTime - Date.now()) / 60000);
      return res.json({message: `Account locked. Try again in ${remainingTime} minutes.`});
    }
  }

    if (userType !== "Admin") {
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
            nombreCompleto: userFound.nombreCompleto,
            correo: userFound.correo,
            telefono: userFound.telefono,
            fechaDeNacimiento: userFound.fechaDeNacimiento,
            pasaporteDui: userFound.pasaporteDui,
            licencia: userFound.licencia,
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
          message: "Login exitoso",
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

export default loginController;