//Imports
import clientsModel from "../models/Clients.js";
import employeesModel from "../models/Employees.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

//Controller
const loginController = {};

//Maximum login attempts
const maxAttempts = 3;
//Lock time in milliseconds (15 minutes)
const lockTime = 15 * 60 * 1000;

//Login
loginController.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let userFound;
    let userType;


    //Email check
    if (!config.emailAdmin || !config.emailAdmin.email || !config.emailAdmin.password) {
      //Error
      console.log("Configuración de emailAdmin incompleta en config.js");
      return res.status(500).json({ message: "Configuración de emailAdmin incompleta en config.js" });
    }
    if (
      //Admin check
      email === config.emailAdmin.email &&
      password === config.emailAdmin.password
    ) {
      userType = "Admin";
      userFound = { _id: "Admin" };
    }
    else {
      //Employee check
      userFound = await employeesModel.findOne({ email: email });
      userType = "Empleado";

      //Client check
      if (!userFound) {
        userFound = await clientsModel.findOne({ email });
        userType = "Cliente";
      }
    }
    if (!userFound) {
      //User not found
      console.log("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    //Client not verified
    if (userType === "Cliente" && userFound.isVerified === false) {
      //Generate vefification code
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
      //Use HTMLVerifyAccountEmail
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

    //Check if user is locked
    if (userType !== "Admin") {
        if (userFound.lockTime > Date.now()) {
            const remainingTIme = Math.ceil((userFound.lockTime - Data.now() / 60000));
            return res.json({message: `Account locked. Try again in ${remainingTIme} minutes.`});
        };
    };

    if (userType !== "Admin") {
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        //Invalid password, increment login attempts
          userFound.loginAttempts = (userFound.loginAttempts) + 1;
          
          if (userFound.loginAttempts > maxAttempts) {
              userFound.lockTime = Date.now() + lockTime;
              await userFound.save();
              return res.status(403).json({message: "Account locked. Too many failed attempts."});
          }
        return res.status(400).json({ message: "Contraseña inválida" });
      }

      //Reset login attempts
      userFound.loginAttempts = 0;
      userFound.lockTime = null;
      await userFound.save();
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
            fullName: userFound.fullName,
            email: userFound.email,
            phone: userFound.phone,
            birthDate: userFound.birthDate,
            passport: userFound.passpor,
            license: userFound.license,
            isVerified: userFound.isVerified,
            registrationDate: userFound.createdAt
          };
        }

        res.status(200).json({
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

//Export
export default loginController;
