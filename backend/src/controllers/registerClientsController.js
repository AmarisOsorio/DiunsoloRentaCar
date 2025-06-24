import jsonwebtoken from "jsonwebtoken"; // Token
import bcryptjs from "bcryptjs"; // Encriptar
import nodemailer from "nodemailer"; // Enviar Correo
import crypto from "crypto"; // Codigo aleatorio
import path from "path";
import { fileURLToPath } from "url";

import clientsModel from "../models/Clientes.js";
import { config } from "../config.js";
import sendWelcomeMail from '../utils/mailWelcome.js';

// Obtener __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registerClientsController = {};

registerClientsController.register = async (req, res) => {
  try {
    // LOG para depuración
    // console.log('BODY:', req.body);
    // console.log('FILES:', req.files);
    let pasaporteBuffer = null;
    let licenciaBuffer = null;
    if (req.files && req.files.pasaporteDui && req.files.pasaporteDui[0]) {
      pasaporteBuffer = req.files.pasaporteDui[0].buffer;
    }
    if (req.files && req.files.licencia && req.files.licencia[0]) {
      licenciaBuffer = req.files.licencia[0].buffer;
    }

    const {
      nombreCompleto,
      fechaDeNacimiento,
      correo,
      contraseña: contraseñaRaw,
      contrasena: contrasenaRaw,
      telefono,
      pasaporteDui,
      licencia
    } = req.body;

    // Soportar ambos: 'contraseña', 'contrasena', y variantes mal codificadas
    const contraseña = contraseñaRaw || contrasenaRaw || req.body['contraseña'] || req.body['contrasena'] || req.body['contraseÃ±a'];
    if (!contraseña) {
      return res.status(400).json({ message: "El campo 'contraseña' es obligatorio y no fue recibido correctamente." });
    }

    // Declarar transporter y chars solo una vez
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // Buscar cliente existente
    const existsClient = await clientsModel.findOne({ correo });
    if (existsClient) {
      if (existsClient.isVerified) {
        return res.json({ message: "Client already exists", isVerified: true });
      } else {
        // Actualizar datos del cliente no verificado
        const passwordHashUpdate = await bcryptjs.hash(contraseña, 10);
        existsClient.nombreCompleto = nombreCompleto;
        existsClient.fechaDeNacimiento = fechaDeNacimiento;
        existsClient.telefono = telefono;
        existsClient.contraseña = passwordHashUpdate;
        if (req.body.pasaporteDui) existsClient.pasaporteDui = req.body.pasaporteDui;
        if (req.body.licencia) existsClient.licencia = req.body.licencia;
        await existsClient.save();
        // console.log("Cliente actualizado: ", correo);
        // Generar y enviar nuevo código de verificación (6 caracteres alfanuméricos)
        let verificationCodeUpdate = '';
        for (let i = 0; i < 6; i++) {
          verificationCodeUpdate += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const tokenCodeUpdate = jsonwebtoken.sign(
          { correo, verificationCode: verificationCodeUpdate },
          config.JWT.secret,
          { expiresIn: "15m" }
        );
        res.cookie("VerificationToken", tokenCodeUpdate, { maxAge: 15 * 60 * 1000 });
        const mailOptionsUpdate = {
          from: config.email.email_user,
          to: correo,
          subject: "Verificación de correo - Código de activación | Diunsolo RentaCar",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafbfc;">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src=\"cid:diunsolologo\" alt=\"Diunsolo RentaCar\" style=\"max-width: 120px; margin-bottom: 12px;\" />
              </div>
              <h2 style="color: #1a202c; text-align: center;">¡Gracias por registrarte en <span style='color:#007bff;'>Diunsolo RentaCar</span>!</h2>
              <p>Hola${nombreCompleto ? `, <b>${nombreCompleto}</b>` : ''},</p>
              <p>Para activar tu cuenta y comenzar a explorar nuestra flota de vehículos, por favor utiliza el siguiente código de verificación:</p>
              <div style="text-align: center; margin: 32px 0;">
                <span style="display: inline-block; font-size: 2.2em; font-weight: bold; letter-spacing: 8px; background: #e9f5ff; color: #007bff; padding: 16px 32px; border-radius: 8px; border: 1px dashed #007bff;">${verificationCodeUpdate}</span>
              </div>
              <p style="text-align: center; color: #555;">Este código expirará en <b>15 minutos</b>.<br>Regresa a la página de verificación y cópialo o escríbelo en el campo correspondiente.</p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 0.95em; color: #888;">¿No solicitaste este código? Si no fuiste tú quien se registró, por favor ignora este correo electrónico.</p>
              <div style="margin-top: 24px; text-align: center;">
                <a href="http://localhost:5173" style="color: #007bff; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a><br>
                <a href="http://localhost:5173/contacto" style="color: #888; font-size: 0.95em;">Soporte</a>
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
        transporter.sendMail(mailOptionsUpdate, (error) => {
          if (error) {
            console.error("Error enviando correo:", error);
            return res.status(500).json({ message: "Error enviando correo" });
          }
          // Cambia el mensaje para que incluya la frase clave que espera el frontend
          return res.json({ message: "Nuevo código enviado. La cuenta ya está registrada pero no verificada. Si modificas tus datos, se actualizarán.", isVerified: false });
        });
        return;
      }
    }

    // Si no existe, crear nuevo cliente
    const passwordHash = await bcryptjs.hash(contraseña, 10);
    const newClient = new clientsModel({
      nombreCompleto,
      fechaDeNacimiento,
      correo,
      contraseña: passwordHash,
      telefono,
      pasaporteDui: pasaporteDui || null, // URL
      licencia: licencia || null // URL
    });
    await newClient.save();
    // console.log("Nuevo cliente registrado: ", correo);
    // Generar código de 6 caracteres alfanuméricos (números y letras mayúsculas)
    let verificationCode = '';
    for (let i = 0; i < 6; i++) {
      verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!config.JWT.secret) {
      return res.status(500).json({ message: "JWT secret is not defined in environment variables" });
    }
    const tokenCode = jsonwebtoken.sign(
      { correo, verificationCode },
      config.JWT.secret,
      { expiresIn: "15m" }
    );
    res.cookie("VerificationToken", tokenCode, { maxAge: 15 * 60 * 1000 });
    const mailOptions = {
      from: config.email.email_user,
      to: correo,
      subject: "Verificación de correo - Código de activación | Diunsolo RentaCar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafbfc;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src=\"cid:diunsolologo\" alt=\"Diunsolo RentaCar\" style=\"max-width: 120px; margin-bottom: 12px;\" />
          </div>
          <h2 style="color: #1a202c; text-align: center;">¡Gracias por registrarte en <span style='color:#007bff;'>Diunsolo RentaCar</span>!</h2>
          <p>Hola${nombreCompleto ? `, <b>${nombreCompleto}</b>` : ''},</p>
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
        console.error("Error enviando correo:", error);
        if (error.response) {
          console.error('Respuesta SMTP:', error.response);
        }
        if (error.code === 'EAUTH') {
          console.error('TIP: Verifica que el usuario y contraseña de Gmail sean correctos y que la cuenta permita acceso a apps menos seguras o uses una App Password.');
        }
        return res.status(500).json({ message: "Error enviando correo", error: error.toString(), smtp: error.response });
      }
      res.json({
        message: "Cliente registrado. Por favor verifica tu correo con el código enviado"
      });
    });
  } catch (error) {
    res.json({ message: "Error" + error });
  }
};

registerClientsController.verifyCodeEmail = async (req, res) => {
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
    // Enviar correo de bienvenida tras verificación exitosa
    try {
      await sendWelcomeMail({ correo, nombre: client.nombreCompleto });
    } catch (e) {
      // No bloquear la verificación si el correo de bienvenida falla
      console.error('Error enviando correo de bienvenida:', e);
    }
    res.json({ message: "Correo verificado exitosamente" });
    res.clearCookie("VerificationToken");
    return;
  } catch (error) {
    if (!res.headersSent) {
      return res.json({ message: "error" });
    }
  }
};

registerClientsController.resendCodeEmail = async (req, res) => {
  const token = req.cookies.VerificationToken;
  if (!token) {
    return res.status(400).json({ message: "No hay sesión de verificación activa." });
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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
  try {
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { correo } = decoded;
    if (!correo) {
      return res.status(400).json({ message: "No se encontró el correo en la sesión." });
    }
    const client = await clientsModel.findOne({ correo });
    const nombreCompleto = client ? client.nombreCompleto : '';
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
    const mailOptions = {
      from: config.email.email_user,
      to: correo,
      subject: "Verificación de correo - Código de activación | Diunsolo RentaCar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafbfc;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src=\"cid:diunsolologo\" alt=\"Diunsolo RentaCar\" style=\"max-width: 120px; margin-bottom: 12px;\" />
          </div>
          <h2 style="color: #1a202c; text-align: center;">¡Gracias por registrarte en <span style='color:#007bff;'>Diunsolo RentaCar</span>!</h2>
          <p>Hola${nombreCompleto ? `, <b>${nombreCompleto}</b>` : ''},</p>
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
        return res.status(500).json({ message: "Error enviando correo" });
      }
      return res.json({ message: "Nuevo código enviado" });
    });
  } catch (error) {
    res.status(500).json({ message: "Error reenviando código" });
  }
};

export default registerClientsController;
