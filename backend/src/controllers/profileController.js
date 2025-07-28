// --- CAMBIO DE EMAIL SEGURO ---
import { sendEmail, HTMLRecoveryEmail } from "../utils/mailPasswordRecovery.js";
import { HTMLVerifyAccountEmail } from '../utils/mailVerifyAccount.js';

import ClientsModel from "../models/Clientes.js";
import Reservas from "../models/Reservas.js";
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
    
    // Formatear la respuesta para el frontend
    const profileData = {
      id: user._id,
      nombres: user.nombre,
      apellidos: user.apellido,
      correo: user.correo,
      telefono: user.telefono,
      fechaDeNacimiento: user.fechaDeNacimiento,
      licenciaFrente: user.licenciaFrente,
      licenciaReverso: user.licenciaReverso,
      pasaporteFrente: user.pasaporteFrente,
      pasaporteReverso: user.pasaporteReverso,
      isVerified: user.isVerified,
      fechaRegistro: user.createdAt
    };

    res.json({
      success: true,
      user: profileData
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar información del perfil
profileController.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    // Permitir updates parciales
    const allowedFields = [
      'nombre', 'apellido', 'telefono', 'fechaDeNacimiento',
      'licenciaFrente', 'licenciaReverso', 'pasaporteFrente', 'pasaporteReverso',
      'correo'
    ];
    const updateFields = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateFields[key] = req.body[key];
      }
    }
    // Validar correo si se va a actualizar
    if (updateFields.correo) {
      if (!/^\S+@\S+\.\S+$/.test(updateFields.correo)) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico no es válido'
        });
      }
      // Verificar que el correo no esté en uso por otro usuario
      const exists = await ClientsModel.findOne({ correo: updateFields.correo, _id: { $ne: userId } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'El correo ya está en uso por otro usuario'
        });
      }
    }

    // Validaciones solo si se actualizan esos campos
    if (updateFields.telefono && !/^[267][0-9]{3}-[0-9]{4}$/.test(updateFields.telefono)) {
      return res.status(400).json({
        success: false,
        message: 'El teléfono debe tener el formato correcto (ej: 2345-6789, inicia con 2, 6 o 7)'
      });
    }
    if (updateFields.fechaDeNacimiento) {
      const validacionEdad = validarEdadMinima(updateFields.fechaDeNacimiento);
      if (!validacionEdad.isValid) {
        return res.status(400).json({
          success: false,
          message: validacionEdad.message
        });
      }
      updateFields.fechaDeNacimiento = new Date(updateFields.fechaDeNacimiento);
    }

    const updatedUser = await ClientsModel.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Formatear respuesta
    const profileData = {
      id: updatedUser._id,
      nombres: updatedUser.nombre,
      apellidos: updatedUser.apellido,
      correo: updatedUser.correo,
      telefono: updatedUser.telefono,
      fechaDeNacimiento: updatedUser.fechaDeNacimiento,
      licenciaFrente: updatedUser.licenciaFrente,
      licenciaReverso: updatedUser.licenciaReverso,
      pasaporteFrente: updatedUser.pasaporteFrente,
      pasaporteReverso: updatedUser.pasaporteReverso,
      isVerified: updatedUser.isVerified,
      fechaRegistro: updatedUser.createdAt
    };

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: profileData
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
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
    const isSamePassword = await bcrypt.compare(newPassword, user.contraseña);
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
      contraseña: hashedPassword
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
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

    // 2. Verificar contratos activos
    const contratosActivos = await Contratos.findOne({
      clientID: userId.toString(),
      estado: "Activo"
    });

    if (reservasActivas || contratosActivos) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminar tu cuenta porque tienes reservas o contratos activos."
      });
    }

    // Eliminar archivos de documentos si existen
    const user = await ClientsModel.findById(userId);
    if (user) {
      // Eliminar archivos de licencia y pasaporte
      [user.licencia, user.pasaporteDui].forEach(filePath => {
        if (filePath && typeof filePath === 'string' && filePath.startsWith('/uploads/')) {
          const fullPath = path.join(__dirname, '../..', filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });
    }

    // Eliminar usuario de la base de datos
    await ClientsModel.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Cuenta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir documento con lado específico (frente o reverso)
profileController.uploadDocument = [
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ningún archivo'
        });
      }

      const { documentType, side } = req.body;
      const userId = req.user._id;

      // Validar parámetros
      if (!documentType || !side) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento y lado son requeridos'
        });
      }

      if (!['licencia', 'pasaporteDui', 'pasaporte'].includes(documentType)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido'
        });
      }

      if (!['frente', 'reverso'].includes(side)) {
        return res.status(400).json({
          success: false,
          message: 'Lado del documento inválido'
        });
      }

      // Construir el nombre del campo en la base de datos
      let fieldName;
      if (documentType === 'licencia') {
        fieldName = side === 'frente' ? 'licenciaFrente' : 'licenciaReverso';
      } else {
        fieldName = side === 'frente' ? 'pasaporteFrente' : 'pasaporteReverso';
      }

      // Obtener el usuario actual para verificar si ya tiene una imagen
      const user = await ClientsModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Si ya existe una imagen, podrías eliminarla de Cloudinary si guardas el public_id
      // (opcional, aquí solo sobreescribimos la URL)

      // Subir el archivo a Cloudinary
      let fileUrl = null;
      try {
        fileUrl = await uploadBufferToCloudinary(req.file.buffer, `usuarios/${userId}`);
      } catch (cloudErr) {
        return res.status(500).json({ success: false, message: 'Error subiendo a Cloudinary', error: cloudErr.message });
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

// Eliminar documento específico (frente o reverso)
profileController.deleteDocument = async (req, res) => {
  try {
    const { documentType, side } = req.body;
    const userId = req.user._id;

    // Validar parámetros
    if (!documentType || !side) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento y lado son requeridos'
      });
    }

    if (!['licencia', 'pasaporteDui'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento inválido'
      });
    }

    if (!['frente', 'reverso'].includes(side)) {
      return res.status(400).json({
        success: false,
        message: 'Lado del documento inválido'
      });
    }

    // Construir el nombre del campo
    let fieldName;
    if (documentType === 'licencia') {
      fieldName = side === 'frente' ? 'licenciaFrente' : 'licenciaReverso';
    } else {
      fieldName = side === 'frente' ? 'pasaporteFrente' : 'pasaporteReverso';
    }

    // Obtener el usuario
    const user = await ClientsModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Eliminar el archivo físico si existe
    if (user[fieldName]) {
      const filePath = user[fieldName];
      if (typeof filePath === 'string' && filePath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '../..', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    // Actualizar la base de datos
    const updateData = { [fieldName]: null };
    await ClientsModel.findByIdAndUpdate(userId, updateData);

    res.json({
      success: true,
      message: `${documentType === 'licencia' ? 'Licencia' : 'Pasaporte/DUI'} (${side}) eliminado correctamente`,
      updatedFields: updateData
    });

  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Ensure all blocks are closed above. If not, add a closing bracket here.
export default profileController;
