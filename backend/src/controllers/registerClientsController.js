//Imports
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import cloudinary from 'cloudinary';

import clientsModel from "../models/Clients.js";
import { config } from "../config.js";
import { sendVerificationEmail } from "../utils/mailVerifyAccount.js";

//Cloudinary config
cloudinary.v2.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

//Cloudinary image upload function
const uploadImage = async (file, folder = "public") => {
  try {
    if (!file || !file.path) return "";
    
    const result = await cloudinary.v2.uploader.upload(
      file.path, 
      {
        folder: folder,
        allowed_formats: ["jpg", "png", "jpeg"]
      }
    );
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return "";
  }
};

//Controller
const registerClientsController = {};

//Register
registerClientsController.registerClients = async (req, res) => {
  try {
    //Required data
    const {
      name, 
      lastName, 
      email, 
      password, 
      phone, 
      birthDate
    } = req.body;

    //Check existing email
    const existingClient = await clientsModel.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    //Validate phone format
    const phoneRegex = /^[267]\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7" });
    }

    //Birthdate validation
    const birth = new Date(birthDate);
    
    //Date validation
    if (isNaN(birth.getTime())) {
      return res.status(400).json({ 
        message: "Fecha de nacimiento inválida. Formato esperado: YYYY-MM-DD",
        receivedDate: birthDate
      });
    }

    //Age validation
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const currentMonth = today.getMonth();
    const birthMonth = birth.getMonth();
    
    if (currentMonth < birthMonth || (currentMonth === birthMonth && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return res.status(400).json({ message: "Debes ser mayor de 18 años para registrarte" });
    }

    //Setup images for cloudinary
    let lFrontUrl = "";
    let lBackUrl = "";
    let pFrontUrl = "";
    let pBackUrl = "";
    let photoUrl = ""; // AGREGADO: Variable para foto de perfil

    if (req.files) {      
      if (req.files.licenseFront && req.files.licenseFront[0]) {
        lFrontUrl = await uploadImage(req.files.licenseFront[0], "diunsolo/licenses");
      }
      
      if (req.files.licenseBack && req.files.licenseBack[0]) {
        lBackUrl = await uploadImage(req.files.licenseBack[0], "diunsolo/licenses");
      }
      
      if (req.files.passportFront && req.files.passportFront[0]) {
        pFrontUrl = await uploadImage(req.files.passportFront[0], "diunsolo/passports");
      }
      
      if (req.files.passportBack && req.files.passportBack[0]) {
        pBackUrl = await uploadImage(req.files.passportBack[0], "diunsolo/passports");
      }

      // AGREGADO: Manejar foto de perfil
      if (req.files.photo && req.files.photo[0]) {
        photoUrl = await uploadImage(req.files.photo[0], "diunsolo/profiles");
      }
    }

    //Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    //Create new client
    const newClient = new clientsModel({
      name,
      lastName,
      email,
      password: passwordHash,
      phone,
      birthDate,
      licenseFront: lFrontUrl,
      licenseBack: lBackUrl,
      passportFront: pFrontUrl,
      passportBack: pBackUrl,
      photo: photoUrl, // AGREGADO: Guardar la foto de perfil
      isVerified: false
    });

    //Save client
    await newClient.save();

    //Generate verification code
    const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    //JWT Sign
    const token = jwt.sign(
      { email, verificationCode },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    //Cookie setup
    res.cookie("VerificationToken", token);

    //Send verification email
    try {
      await sendVerificationEmail(email, name, lastName, verificationCode);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      // El cliente ya está registrado, solo notificar del error del email
      return res.status(201).json({ 
        message: "Cliente registrado exitosamente, pero hubo un error enviando el correo de verificación. Puedes solicitar un reenvío.",
        emailError: true
      });
    }

    //OK
    res.status(201).json({ 
      message: "Cliente registrado exitosamente. Se ha enviado un correo de verificación."
    });

  } catch (error) {
    console.error('Error en registerClientsController:', error);
    
    //Specific mongoose validation
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación: " + errorMessages.join(', '),
        validationErrors: error.errors
      });
    }
    
    res.status(500).json({ 
      message: "Error al registrar cliente: " + error.message 
    });
  }
};

//Email verification
registerClientsController.verifyEmail = async (req, res) => {
  try {
    //Required data
    const { verificationCode } = req.body;
    const token = req.cookies.VerificationToken;

    //Check required fields
    if (!verificationCode) {
      return res.status(400).json({ message: "Código de verificación requerido" });
    }

    if (!token) {
      return res.status(400).json({ message: "Token de verificación no encontrado" });
    }

    //Verify and decode token
    const decoded = jwt.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    //Compare verification codes
    if (verificationCode.toUpperCase() !== storedCode.toUpperCase()) {
      return res.status(400).json({ message: "Código de verificación incorrecto" });
    }

    //Verify client
    const client = await clientsModel.findOne({ email });
    
    //Client not found
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    //Update verification status
    client.isVerified = true;
    await client.save();

    //OK
    res.status(200).json({ message: "Correo verificado exitosamente" });

    //Clear cookie
    //res.clearCookie("VerificationToken");

  } catch (error) {
    console.error('Error al verificar correo:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: "Token de verificación inválido" });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Token de verificación expirado" });
    }
    
    res.status(500).json({ message: "Error al verificar correo" });
  }
};

//Resend verification email
registerClientsController.resendVerificationEmail = async (req, res) => {
  try {
    //Required data
    const token = req.cookies.VerificationToken;

    if (!token) {
      return res.status(400).json({ message: "Token de verificación no encontrado" });
    }

    //Verify and decode token
    const decoded = jwt.verify(token, config.JWT.secret);
    const { email } = decoded;

    //Search client
    const client = await clientsModel.findOne({ email });
    
    //Client not found
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    //Client already verified
    if (client.isVerified) {
      return res.status(400).json({ message: "El correo ya está verificado" });
    }

    //Generate new verification code
    const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    //JWT Sign
    const newToken = jwt.sign(
      { email: client.email, verificationCode },
      config.JWT.secret,
      { expiresIn: "2h" }
    );

    //Update cookie
    res.cookie("VerificationToken", newToken, { maxAge: 2 * 60 * 60 * 1000 });

    //Send new email
    await sendVerificationEmail(client.email, client.name, client.lastName, verificationCode);
    
    //OK
    res.status(200).json({ message: "Correo de verificación reenviado exitosamente" });

  } catch (error) {
    console.error('Error al reenviar correo de verificación:', error);
    
    //Specific JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Sesión de verificación inválida o expirada" });
    }
    
    res.status(500).json({ message: "Error al reenviar correo de verificación" });
  }
};

//Export
export default registerClientsController;