import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

import clientsModel from "../models/Clientes.js";
import { config } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registerClientsController = {};

function validarEdadMinima(fechaDeNacimiento) {
  try {
    const hoy = new Date();
    const fechaNacimiento = new Date(fechaDeNacimiento);
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    
    if (edad < 18) {
      return {
        isValid: false,
        message: 'Debes ser mayor de 18 años para registrarte'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      message: 'Fecha de nacimiento inválida'
    };
  }
}

async function uploadBufferToCloudinary(buffer, folder) {
  return null;
}

registerClientsController.register = async (req, res) => {
  try {
    let {
      nombres,
      apellidos,
      fechaDeNacimiento,
      correo,
      contraseña: contraseñaRaw,
      telefono
    } = req.body;

    let licenciaFrenteUrl = null;
    let licenciaReversoUrl = null;
    let pasaporteFrenteUrl = null;
    let pasaporteReversoUrl = null;

    if (telefono) {
      let clean = (telefono + '').replace(/[^0-9]/g, '');
      
      if (clean.length === 8) {
        telefono = clean.slice(0, 4) + '-' + clean.slice(4);
      }
      
      const regex = /^[267]\d{3}-\d{4}$/;
      if (!regex.test(telefono)) {
        return res.status(400).json({ message: 'El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7' });
      }
    }

    const contraseña = contraseñaRaw || req.body['contraseña'] || req.body['contraseÃ±a'];
    if (!contraseña) {
      return res.status(400).json({ message: "El campo 'contraseña' es obligatorio y no fue recibido correctamente." });
    }
    
    if (!nombres || !apellidos) {
      return res.status(400).json({ message: "Los campos 'nombres' y 'apellidos' son obligatorios." });
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
    
    const existsClient = await clientsModel.findOne({ correo });
    
    if (existsClient) {
      if (existsClient.isVerified) {
        return res.json({ message: "Client already exists", isVerified: true });
      } else {
        const validacionEdad = validarEdadMinima(fechaDeNacimiento);
        if (!validacionEdad.isValid) {
          return res.status(400).json({ 
            message: validacionEdad.message 
          });
        }
        
        const passwordHashUpdate = await bcryptjs.hash(contraseña, 10);
        existsClient.nombre = nombres;
        existsClient.apellido = apellidos;
        existsClient.fechaDeNacimiento = fechaDeNacimiento;
        existsClient.telefono = telefono;
        existsClient.contraseña = passwordHashUpdate;
        
        await existsClient.save();
        
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
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px;">
              <h2>Código de verificación</h2>
              <p>Tu código de verificación es: <strong>${verificationCodeUpdate}</strong></p>
              <p>Este código expirará en 15 minutos.</p>
            </div>
          `
        };
        
        transporter.sendMail(mailOptionsUpdate, (error) => {
          if (error) {
            return res.status(500).json({ message: "Error enviando correo" });
          }
          return res.json({ message: "Nuevo código enviado. La cuenta ya está registrada pero no verificada.", isVerified: false });
        });
        return;
      }
    }

    const validacionEdad = validarEdadMinima(fechaDeNacimiento);
    if (!validacionEdad.isValid) {
      return res.status(400).json({ 
        message: validacionEdad.message 
      });
    }

    const passwordHash = await bcryptjs.hash(contraseña, 10);
    
    const newClient = new clientsModel({
      nombre: nombres,
      apellido: apellidos,
      fechaDeNacimiento,
      correo,
      contraseña: passwordHash,
      telefono,
    });
    
    await newClient.save();
    
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
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px;">
          <h2>¡Bienvenido a Diunsolo RentaCar!</h2>
          <p>Hola <strong>${nombres} ${apellidos}</strong>,</p>
          <p>Tu código de verificación es: <strong style="font-size: 1.5em; color: #007bff;">${verificationCode}</strong></p>
          <p>Este código expirará en 15 minutos.</p>
        </div>
      `
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error enviando correo: " + error.message });
      }
      
      res.json({
        message: "Cliente registrado. Por favor verifica tu correo con el código enviado"
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro: " + (error.message || 'Error desconocido') });
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
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px;">
          <h2>Nuevo código de verificación</h2>
          <p>Hola${nombreCompleto ? `, <strong>${nombreCompleto}</strong>` : ''},</p>
          <p>Tu nuevo código de verificación es: <strong style="font-size: 1.5em; color: #007bff;">${verificationCode}</strong></p>
          <p>Este código expirará en 15 minutos.</p>
        </div>
      `
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