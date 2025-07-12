// Controlador para el modelo Empleados
import EmpleadosModel from "../models/Empleados.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js"; // Asumiendo que tienes el mismo config.js

// CLOUDINARY SETUP - igual que en tu BlogController
cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
    secure: true
});

const EmpleadosController = {};

// GET BY ID
EmpleadosController.getEmpleadoById = async (req, res) => {
  try {
    const Empleado = await EmpleadosModel.findById(req.params.id);
    if (!Empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
    res.json(Empleado);
  } catch (error) {
    res.status(400).json({ message: "ID inválido o error en la consulta" });
  }
};

EmpleadosController.RegisterEmpleado = async (req, res) => {
  try {
    let { nombre, apellido, correoElectronico, contrasena, dui, telefono, rol } = req.body;
    
    console.log('Datos recibidos:', req.body);
    console.log('Archivo recibido:', req.file ? 'Sí' : 'No');

   
    let fotoURL = "";
    if (req.file) {
      try {
        console.log('Subiendo imagen desde:', req.file.path);
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "empleados",
          allowed_formats: ["jpg", "png", "jpeg", "gif"]
        });
        fotoURL = result.secure_url;
        console.log('Imagen subida exitosamente:', fotoURL);
      } catch (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        return res.status(400).json({ 
          message: 'Error al subir la imagen: ' + uploadError.message 
        });
      }
    }
    
    // Validar campos requeridos
    if (!nombre || !apellido || !correoElectronico || !contrasena || !dui || !telefono) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos" 
      });
    }
    
    // Normalizar teléfono a 0000-0000 y validar
    if (telefono) {
      let clean = (telefono + '').replace(/[^0-9]/g, '');
      console.log('Teléfono limpio:', clean);
      
      if (clean.length === 8) {
        telefono = clean.slice(0, 4) + '-' + clean.slice(4);
      }
      
      console.log('Teléfono formateado:', telefono);
      
      // Validación de formato y primer dígito
      const regex = /^[267]\d{3}-\d{4}$/;
      if (!regex.test(telefono)) {
        return res.status(400).json({ 
          message: 'El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7' 
        });
      }
    }

    // Encriptar contraseña
    const passwordHash = await bcryptjs.hash(contrasena, 10);

    // Crear datos del empleado
    const empleadoData = {
      nombre, 
      apellido, 
      correoElectronico, 
      contrasena: passwordHash, 
      dui, 
      telefono, 
      rol: rol || 'Empleado'
    };

    // Solo agregar foto si existe
    if (fotoURL) {
      empleadoData.foto = fotoURL;
    }

    console.log('Datos a guardar:', empleadoData);

    const newEmpleado = new EmpleadosModel(empleadoData);
    await newEmpleado.save(); // Agregué await aquí

    res.status(201).json({ 
      message: "Nuevo empleado registrado", 
      empleado: newEmpleado 
    });
  } catch (error) {
    console.error('Error al registrar empleado:', error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `Ya existe un empleado con ese ${field}` 
      });
    }
    
    res.status(500).json({ 
      message: "Error al registrar empleado", 
      error: error.message 
    });
  }
};

// UPDATE
EmpleadosController.updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, apellido, correoElectronico, contrasena, dui, telefono, rol } = req.body;
    
    console.log('Actualizando empleado:', id, req.body);
    console.log('Archivo recibido para actualización:', req.file ? 'Sí' : 'No');

    // Procesar imagen si existe - igual que en el registro
    let fotoURL = undefined; // undefined para no actualizar si no se envía
    if (req.file) {
      try {
        console.log('Subiendo nueva imagen desde:', req.file.path);
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "empleados",
          allowed_formats: ["jpg", "png", "jpeg", "gif"]
        });
        fotoURL = result.secure_url;
        console.log('Nueva imagen subida exitosamente:', fotoURL);
      } catch (uploadError) {
        console.error('Error subiendo nueva imagen:', uploadError);
        return res.status(400).json({ 
          message: 'Error al subir la nueva imagen: ' + uploadError.message 
        });
      }
    }
    
    // Normalizar teléfono a 0000-0000 y validar
    if (telefono) {
      let clean = (telefono + '').replace(/[^0-9]/g, '');
      if (clean.length === 8) {
        telefono = clean.slice(0, 4) + '-' + clean.slice(4);
      }
      // Validación de formato y primer dígito
      const regex = /^[267]\d{3}-\d{4}$/;
      if (!regex.test(telefono)) {
        return res.status(400).json({ 
          message: 'El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7' 
        });
      }
    }

    // Preparar datos para actualizar
    const updateData = {
      nombre, 
      apellido, 
      correoElectronico, 
      dui, 
      telefono, 
      rol
    };

    // Solo incluir contraseña si se proporciona y encriptarla
    if (contrasena && contrasena.trim() !== '') {
      const passwordHash = await bcryptjs.hash(contrasena, 10);
      updateData.contrasena = passwordHash;
    }

    // Solo incluir foto si se subió una nueva
    if (fotoURL) {
      updateData.foto = fotoURL;
    }

    const updated = await EmpleadosModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
    
    res.json({ 
      message: "Empleado actualizado", 
      empleado: updated 
    });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `Ya existe un empleado con ese ${field}` 
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar empleado", 
      error: error.message 
    });
  }
};

// DELETE
EmpleadosController.deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await EmpleadosModel.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
    
    res.json({ message: "Empleado eliminado" });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ 
      message: "Error al eliminar empleado", 
      error: error.message 
    });
  }
};

// GET ALL
EmpleadosController.getEmpleados = async (req, res) => {
  try {
    const Empleados = await EmpleadosModel.find();
    res.json(Empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ 
      message: "Error al obtener empleados", 
      error: error.message 
    });
  }
};

export default EmpleadosController;