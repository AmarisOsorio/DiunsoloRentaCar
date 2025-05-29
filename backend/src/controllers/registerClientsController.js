import jsonwebtoken from "jsonwebtoken"; // Token
import bcryptjs from "bcryptjs"; // Encriptar
import nodemailer from "nodemailer"; // Enviar Correo
import crypto from "crypto"; // Codigo aleatorio

import clientsModel from "../models/Clientes.js";
import { config } from "../config.js";

const registerClientsController = {};

registerClientsController.register = async (req, res) => {
  try {
    // LOG para depuración
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    // Si se suben imágenes, estarán en req.files
    let pasaporteBuffer = null;
    let licenciaBuffer = null;
    if (req.files && req.files.pasaporte_dui && req.files.pasaporte_dui[0]) {
      pasaporteBuffer = req.files.pasaporte_dui[0].buffer;
    }
    if (req.files && req.files.licencia && req.files.licencia[0]) {
      licenciaBuffer = req.files.licencia[0].buffer;
    }

    // Los demás campos vienen en req.body
    const {
      nombre_completo,
      fecha_de_nacimiento,
      correo,
      contraseña: contraseñaRaw,
      telefono
    } = req.body;

    // Validación explícita de contraseña
    const contraseña = contraseñaRaw || req.body['contraseÃ±a'];
    if (!contraseña) {
      return res.status(400).json({ message: "El campo 'contraseña' es obligatorio y no fue recibido correctamente." });
    }

    // Log para depuración de correo
    console.log('Correo recibido:', correo);
    const existsClient = await clientsModel.findOne({ correo });
    console.log('Resultado de búsqueda en MongoDB:', existsClient);
    if (existsClient) {
      return res.json({ message: "Client already exists" });
    }

    const passwordHash = await bcryptjs.hash(contraseña, 10);

    const newClient = new clientsModel({
      nombre_completo,
      fecha_de_nacimiento,
      correo,
      contraseña: passwordHash,
      telefono,
      pasaporte_dui: pasaporteBuffer,
      licencia: licenciaBuffer
    });

    await newClient.save();

    const verificationCode = crypto.randomBytes(3).toString("hex");

    if (!config.JWT.secret) {
      return res.status(500).json({ message: "JWT secret is not defined in environment variables" });
    }
    const tokenCode = jsonwebtoken.sign(
      { correo, verificationCode },
      config.JWT.secret,
      { expiresIn: "2h" }
    );

    res.cookie("VerificationToken", tokenCode, { maxAge: 2 * 60 * 60 * 1000 });

    const transporter = nodemailer.createTransport({
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
      subject: "Verificación de correo",
      text: `Para verificar tu correo, utiliza el siguiente código ${verificationCode}\n El codigo vence en dos horas`,
    };

    // Enviar correo y responder SOLO dentro del callback
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error enviando correo:", error);
        return res.status(500).json({ message: "Error enviando correo" });
      }
      console.log("Correo enviado" + info.response);
      res.json({
        message: "Cliente registrado. Por favor verifica tu correo con el código enviado",
      });
    });
  } catch (error) {
    console.error('Error en registerClientsController.register:', error);
    res.json({ message: "Error" + error });
  }
};

registerClientsController.verifyCodeEmail = async (req, res) => {
  // Validación robusta del body
  if (!req.body || !req.body.verificationCode) {
    return res.status(400).json({ message: "El campo 'verificationCode' es obligatorio en el body." });
  }
  const { verificationCode } = req.body;
  const token = req.cookies.VerificationToken;
  try {
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { correo, verificationCode: storedCode } = decoded;
    if (verificationCode !== storedCode) {
      return res.json({ message: "Invalid code" });
    }
    const client = await clientsModel.findOne({ correo });
    client.isVerified = true;
    await client.save();
    res.json({ message: "Correo verificado exitosamente" });
    res.clearCookie("VerificationToken");
  } catch (error) {
    res.json({ message: "error" });
  }
};

export default registerClientsController;
