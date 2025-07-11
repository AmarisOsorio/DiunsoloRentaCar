import jwt from 'jsonwebtoken';
import ClientsModel from '../models/Clientes.js';
import { config } from '../config.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.authToken; // Cambio de 'token' a 'authToken'
    
    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, config.JWT.secret); // Usar config.JWT.secret
    
    // Buscar el usuario en la base de datos
    const user = await ClientsModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Adjuntar la información del usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Alias para compatibilidad con rutas existentes
export const verifyAuth = authenticateToken;
