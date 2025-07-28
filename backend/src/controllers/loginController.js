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
    }
    else {
      // Buscar empleados por correo_electronico y clientes por correo
      userFound = await empleadosModel.findOne({ correo_electronico: correo });
      userType = "Empleado";
      if (!userFound) {
        // Log búsqueda exacta y resultado
        // const allClients = await clientsModel.find({});
        // console.log('Correo recibido:', correo);
        // console.log('Primeros 3 clientes:', allClients.slice(0,3).map(c=>c.correo));
        userFound = await clientsModel.findOne({ correo });
        // console.log('Resultado búsqueda cliente:', userFound);
        userType = "Cliente";
      }
    }
    // console.log('Tipo de usuario:', userType);
    if (!userFound) {
      // console.log('No se encontró usuario para:', correo);
      return res.json({ message: "Usuario no encontrado" });
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
        { correo, verificationCode },
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
        to: correo,
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
          if (error.response) {
            console.error('Respuesta SMTP:', error.response);
          }
          if (error.code === 'EAUTH') {
            console.error('TIP: Verifica usuario y contraseña de Gmail y que la cuenta permita acceso a apps menos seguras o uses una App Password.');
          }
          return res.status(500).json({ message: "Error enviando correo de verificación", error: error.toString(), smtp: error.response });
        }
        return res.json({ message: "Cuenta no verificada. Se ha enviado un nuevo código de verificación a tu correo.", needVerification: true });
      });
      return;
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

        res.json({
          message: "login exitoso",
          userType,
          user: userData
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
export default loginController;
