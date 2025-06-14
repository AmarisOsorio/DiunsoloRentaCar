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
      const mailOptions = {
        from: config.email.email_user,
        to: correo,
        subject: "Verificación de correo - Código de activación | Diunsolo RentaCar",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafbfc;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src=\"cid:diunsolologo\" alt=\"Diunsolo RentaCar\" style=\"max-width: 120px; margin-bottom: 12px;\" />
            </div>
            <h2 style="color: #1a202c; text-align: center;">¡Verifica tu cuenta en <span style='color:#007bff;'>Diunsolo RentaCar</span>!</h2>
            <p>Hola${userFound.nombreCompleto ? `, <b>${userFound.nombreCompleto}</b>` : ''},</p>
            <p>Para activar tu cuenta y comenzar a explorar nuestra flota de vehículos, por favor utiliza el siguiente código de verificación:</p>
            <div style="text-align: center; margin: 32px 0;">
              <span style="display: inline-block; font-size: 2.2em; font-weight: bold; letter-spacing: 8px; background: #e9f5ff; color: #007bff; padding: 16px 32px; border-radius: 8px; border: 1px dashed #007bff;">${verificationCode}</span>
            </div>
            <p style="text-align: center; color: #555;">Este código expirará en <b>15 minutos</b>.<br>Regresa a la página de verificación y cópialo o escríbelo en el campo correspondiente.</p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 0.95em; color: #888;">¿No solicitaste este código? Si no fuiste tú quien se registró, por favor ignora este correo electrónico.</p>
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://diunsolorentacar.com" style="color: #007bff; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a><br>
              <a href="https://diunsolorentacar.com/soporte" style="color: #888; font-size: 0.95em;">Soporte</a>
            </div>
          </div>
        `,
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
        res.json({ message: "login exitoso" });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
export default loginController;
