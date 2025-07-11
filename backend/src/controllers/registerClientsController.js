import jsonwebtoken from "jsonwebtoken"; // Token
import bcryptjs from "bcryptjs"; // Encriptar
import nodemailer from "nodemailer"; // Enviar Correo
import crypto from "crypto"; // Codigo aleatorio
import path from "path";
import { fileURLToPath } from "url";

import clientsModel from "../models/Clientes.js";
import cloudinary from '../utils/cloudinary.js';
import { config } from "../config.js";
import sendWelcomeMail from '../utils/mailWelcome.js';
import { HTMLVerifyAccountEmail } from '../utils/mailVerifyAccount.js';
import { validarEdadMinima } from '../utils/ageValidation.js';

// Obtener __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registerClientsController = {};

// Función auxiliar para subir buffer a Cloudinary y devolver la URL
async function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

registerClientsController.register = async (req, res) => {
  try {
    // Eliminar logs de depuración innecesarios
    // console.log('BODY:', req.body);
    // console.log('FILES:', req.files);

    // Recibir nombres y apellidos por separado
    let {
      nombres,
      apellidos,
      fechaDeNacimiento,
      correo,
      contraseña: contraseñaRaw,
      telefono
    } = req.body;

    // Procesar imágenes si existen (Cloudinary)
    let licenciaFrenteUrl = null;
    let licenciaReversoUrl = null;
    let pasaporteFrenteUrl = null;
    let pasaporteReversoUrl = null;
    if (req.files) {
      if (req.files.licenciaFrente) {
        licenciaFrenteUrl = await uploadBufferToCloudinary(req.files.licenciaFrente[0].buffer, 'diunsolo/licencias');
      }
      if (req.files.licenciaReverso) {
        licenciaReversoUrl = await uploadBufferToCloudinary(req.files.licenciaReverso[0].buffer, 'diunsolo/licencias');
      }
      if (req.files.pasaporteFrente) {
        pasaporteFrenteUrl = await uploadBufferToCloudinary(req.files.pasaporteFrente[0].buffer, 'diunsolo/pasaportes');
      }
      if (req.files.pasaporteReverso) {
        pasaporteReversoUrl = await uploadBufferToCloudinary(req.files.pasaporteReverso[0].buffer, 'diunsolo/pasaportes');
      }
    }

    // Normalizar teléfono a 0000-0000 y validar
    if (telefono) {
      // console.log('[BACKEND] Telefono recibido:', telefono);
      let clean = (telefono + '').replace(/[^0-9]/g, '');
      if (clean.length === 8) {
        telefono = clean.slice(0, 4) + '-' + clean.slice(4);
      }
      // console.log('[BACKEND] Telefono normalizado:', telefono);
      // Validación de formato y primer dígito
      const regex = /^[267]\d{3}-\d{4}$/;
      if (!regex.test(telefono)) {
        // console.log('[BACKEND] ERROR: No pasa regex');
        return res.status(400).json({ message: 'El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7' });
      }
    }

    // Soportar variantes mal codificadas, pero nunca 'contrasena'
    const contraseña = contraseñaRaw || req.body['contraseña'] || req.body['contraseÃ±a'];
    if (!contraseña) {
      return res.status(400).json({ message: "El campo 'contraseña' es obligatorio y no fue recibido correctamente." });
    }
    // Validar nombres y apellidos
    if (!nombres || !apellidos) {
      return res.status(400).json({ message: "Los campos 'nombres' y 'apellidos' son obligatorios." });
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
        // Validar edad mínima (18 años) antes de actualizar
        const validacionEdad = validarEdadMinima(fechaDeNacimiento);
        if (!validacionEdad.isValid) {
          return res.status(400).json({ 
            message: validacionEdad.message 
          });
        }
        // Actualizar datos del cliente no verificado
        const passwordHashUpdate = await bcryptjs.hash(contraseña, 10);
        existsClient.nombre = nombres;
        existsClient.apellido = apellidos;
        existsClient.fechaDeNacimiento = fechaDeNacimiento;
        existsClient.telefono = telefono;
        existsClient.contraseña = passwordHashUpdate;
        if (licenciaFrenteUrl) existsClient.licenciaFrente = licenciaFrenteUrl;
        if (licenciaReversoUrl) existsClient.licenciaReverso = licenciaReversoUrl;
        if (pasaporteFrenteUrl) existsClient.pasaporteFrente = pasaporteFrenteUrl;
        if (pasaporteReversoUrl) existsClient.pasaporteReverso = pasaporteReversoUrl;
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
        const nombre = existsClient.nombre || '';
        const apellido = existsClient.apellido || '';
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
              <p>Hola${nombre || apellido ? `, <b>${nombre} ${apellido}</b>` : ''},</p>
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

    // Validar edad mínima (18 años) antes de crear el cliente
    const validacionEdad = validarEdadMinima(fechaDeNacimiento);
    if (!validacionEdad.isValid) {
      return res.status(400).json({ 
        message: validacionEdad.message 
      });
    }

    // Si no existe, crear nuevo cliente
    const passwordHash = await bcryptjs.hash(contraseña, 10);
    const newClient = new clientsModel({
      nombre: nombres,
      apellido: apellidos,
      fechaDeNacimiento,
      correo,
      contraseña: passwordHash,
      telefono,
      licenciaFrente: licenciaFrenteUrl,
      licenciaReverso: licenciaReversoUrl,
      pasaporteFrente: pasaporteFrenteUrl,
      pasaporteReverso: pasaporteReversoUrl
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
    res.json({ message: "Error" + (error && error.message ? ': ' + error.message : '') });
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
      await sendWelcomeMail({ correo, nombre: `${client.nombre || ''} ${client.apellido || ''}`.trim() });
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
    const nombreCompleto = client ? `${client.nombre || ''} ${client.apellido || ''}`.trim() : '';
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
