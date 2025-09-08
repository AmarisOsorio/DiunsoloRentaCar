
// --- CAMBIO DE EMAIL SEGURO ---
import { sendEmail, HTMLRecoveryEmail } from "../utils/mailPasswordRecovery.js";
import { HTMLVerifyAccountEmail } from '../utils/mailVerifyAccount.js';

import ClientsModel from "../models/Clients.js";
import Reservas from "../models/Reservations.js";
import { Contratos } from "../models/Contratos.js";
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer para subir archivos a memoria (necesario para Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

const profileController = {};

// Eliminar documento específico (licencia/pasaporte, frente/reverso)
profileController.deleteDocument = async (req, res) => {
  try {
    let { documentType, side } = req.body;
    const userId = req.user._id;

    // Permitir valores en inglés y mapear a español
    if (documentType === 'license') documentType = 'licencia';
    if (documentType === 'passport') documentType = 'pasaporte';
    if (side === 'front') side = 'frente';
    if (side === 'back') side = 'reverso';

    // Validar parámetros
    if (!documentType || !side) {
      return res.status(400).json({ success: false, message: 'Tipo de documento y lado son requeridos' });
    }
    if (!['licencia', 'pasaporteDui', 'pasaporte'].includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Tipo de documento inválido' });
    }
    if (!['frente', 'reverso'].includes(side)) {
      return res.status(400).json({ success: false, message: 'Lado inválido' });
    }

    // Construir el nombre del campo en la base de datos
    let fieldName;
    if (documentType === 'licencia') {
      fieldName = side === 'frente' ? 'licenseFront' : 'licenseBack';
    } else {
      fieldName = side === 'frente' ? 'passportFront' : 'passportBack';
    }

    // Obtener el usuario
    const user = await ClientsModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Eliminar la referencia al archivo en la base de datos
    user[fieldName] = null;
    await user.save();

    res.json({ success: true, message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// --- CAMBIO DE EMAIL: Solicitar y verificar código de cambio de correo ---
// Guardar los códigos temporalmente en memoria (en producción usar Redis o DB)
const emailChangeCodes = new Map(); // userId -> { code, correo, expires }

// Enviar código de verificación al nuevo correo
profileController.requestEmailChange = async (req, res) => {
  try {
    const userId = req.user._id;
    const { correo } = req.body;
    // Validar correo no vacío y formato válido
    if (!correo || typeof correo !== 'string' || !correo.trim() || !/^\S+@\S+\.\S+$/.test(correo.trim())) {
      return res.status(400).json({ success: false, message: 'Correo inválido' });
    }
    // Evitar enviar si el correo es vacío o solo espacios
    const correoNormalized = correo.trim().toLowerCase();
    if (correoNormalized.length === 0) {
      return res.status(400).json({ success: false, message: 'Correo vacío' });
    }
    // Verificar que el correo no esté en uso (case-insensitive)
    const exists = await ClientsModel.findOne({
      $expr: {
        $and: [
          { $eq: [ { $toLower: "$correo" }, correoNormalized ] },
          { $ne: ["$_id", userId] }
        ]
      }
    });
    if (exists) {
      return res.status(400).json({ success: false, message: 'El correo ya está en uso por otro usuario' });
    }
    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Guardar en memoria
    emailChangeCodes.set(userId.toString(), {
      code,
      correo,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutos
    });
    // Enviar email con plantilla
    await sendEmail(
      correo.trim(),
      'Código de verificación para cambio de correo',
      '',
      HTMLVerifyAccountEmail(code)
    );
    return res.json({ success: true, message: 'Código enviado al correo' });
  } catch (e) {
    console.error('Error requestEmailChange:', e);
    return res.status(500).json({ success: false, message: 'Error enviando código' });
  }
};

// Verificar código y actualizar correo
profileController.verifyEmailChange = async (req, res) => {
  try {
    const userId = req.user._id;
    const { correo, code } = req.body;
    const entry = emailChangeCodes.get(userId.toString());
    if (!entry || entry.correo !== correo) {
      return res.status(400).json({ success: false, message: 'No se solicitó código para este correo' });
    }
    if (Date.now() > entry.expires) {
      emailChangeCodes.delete(userId.toString());
      return res.status(400).json({ success: false, message: 'El código ha expirado' });
    }
    if (entry.code !== code) {
      return res.status(400).json({ success: false, message: 'Código incorrecto' });
    }
    // Actualizar correo en la base de datos
    await ClientsModel.findByIdAndUpdate(userId, { correo });
    emailChangeCodes.delete(userId.toString());
    return res.json({ success: true, message: 'Correo actualizado correctamente' });
  } catch (e) {
    console.error('Error verifyEmailChange:', e);
    return res.status(500).json({ success: false, message: 'Error verificando código' });
  }
};

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

// Obtener información del perfil
profileController.getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // Use English field names from Clients model
    const profileData = {
      id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      licenseFront: user.licenseFront,
      licenseBack: user.licenseBack,
      passportFront: user.passportFront,
      passportBack: user.passportBack,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      user: profileData
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Actualizar información del perfil
profileController.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    // Allow partial updates with English field names
    const allowedFields = [
      'name', 'lastName', 'email', 'phone', 'birthDate',
      'licenseFront', 'licenseBack', 'passportFront', 'passportBack'
    ];
    const updateFields = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateFields[key] = req.body[key];
      }
    }
    // Validate email if updating
    if (updateFields.email) {
      if (!/^\S+@\S+\.\S+$/.test(updateFields.email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address'
        });
      }
      // Check if email is already in use by another user
      const exists = await ClientsModel.findOne({ email: updateFields.email, _id: { $ne: userId } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another user'
        });
      }
    }

    // Validate phone if updating
    if (updateFields.phone && !/^[267][0-9]{3}-[0-9]{4}$/.test(updateFields.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be in format 0000-0000 and start with 2, 6, or 7'
      });
    }
    // Validate birthDate if updating
    if (updateFields.birthDate) {
      // You may want to add age validation here if needed
      updateFields.birthDate = new Date(updateFields.birthDate);
    }

    const updatedUser = await ClientsModel.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format response (English fields)
    const profileData = {
      id: updatedUser._id,
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      birthDate: updatedUser.birthDate,
      licenseFront: updatedUser.licenseFront,
      licenseBack: updatedUser.licenseBack,
      passportFront: updatedUser.passportFront,
      passportBack: updatedUser.passportBack,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: profileData
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cambiar contraseña
profileController.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newPassword } = req.body;

    // Validaciones
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña es requerida'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener usuario actual para comparar la contraseña
    const user = await ClientsModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Comparar la nueva contraseña con la anterior


    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña no puede ser igual a la anterior'
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña en la base de datos
    await ClientsModel.findByIdAndUpdate(userId, {
      password: hashedPassword
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Eliminar cuenta
profileController.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Verificar reservas activas o pendientes
    const reservasActivas = await Reservas.findOne({
      clientId: userId.toString(),
      estado: { $in: ["Pendiente", "Activa"] }
    });
    if (reservasActivas) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar la cuenta con reservas activas o pendientes.'
      });
    }

    // Eliminar usuario de la base de datos
    await ClientsModel.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


// Subir documento con lado específico (frente o reverso)
profileController.uploadDocument = [
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
      }

      let { documentType, side } = req.body;
      const userId = req.user._id;

      // Permitir valores en inglés y mapear a español
      if (documentType === 'license') documentType = 'licencia';
      if (documentType === 'passport') documentType = 'pasaporte';
      if (side === 'front') side = 'frente';
      if (side === 'back') side = 'reverso';

      // Validar parámetros
      if (!documentType || !side) {
        return res.status(400).json({ success: false, message: 'Tipo de documento y lado son requeridos' });
      }

      if (!['licencia', 'pasaporteDui', 'pasaporte'].includes(documentType)) {
        return res.status(400).json({ success: false, message: 'Tipo de documento inválido' });
      }

      if (!['frente', 'reverso'].includes(side)) {
        return res.status(400).json({ success: false, message: 'Lado inválido' });
      }

      // Construir el nombre del campo en la base de datos
      let fieldName;
      if (documentType === 'licencia') {
        fieldName = side === 'frente' ? 'licenseFront' : 'licenseBack';
      } else {
        fieldName = side === 'frente' ? 'passportFront' : 'passportBack';
      }

      // Obtener el usuario actual para verificar si ya tiene una imagen
      const user = await ClientsModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      // Subir el archivo a Cloudinary
      let fileUrl = null;
      try {
        fileUrl = await uploadBufferToCloudinary(req.file.buffer, `diunsolo/${fieldName}`);
      } catch (cloudErr) {
        return res.status(500).json({ success: false, message: 'Error al subir a Cloudinary' });
      }

      // Guardar la URL de Cloudinary en la base de datos

      user[fieldName] = fileUrl;
      await user.save();

      res.json({
        success: true,
        message: `${documentType === 'licencia' ? 'Licencia' : 'Pasaporte/DUI'} (${side}) subida correctamente`,
        fileUrl: fileUrl,
        updatedFields: { [fieldName]: fileUrl }
      });

    } catch (error) {
      console.error('Error al subir documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
];


export default profileController;
