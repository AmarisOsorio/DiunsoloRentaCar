// Procesar imagen si existe
    let fotoURL = null;// Controlador para el modelo Empleados
import EmpleadosModel from "../models/Empleados.js";
import bcryptjs from "bcryptjs";
import cloudinary from 'cloudinary';

// CLOUDINARY SETUP - Configuración correcta
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para subir buffer a Cloudinary
async function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { 
        folder: folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      },
      (error, result) => {
        if (error) {
          console.error('Error en Cloudinary upload_stream:', error);
          return reject(error);
        }
        console.log('Cloudinary upload exitoso:', result.public_id);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

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
    console.log('=== DATOS RECIBIDOS EN BACKEND ===');
    console.log('Body:', req.body);
    console.log('File:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer presente' : 'Sin buffer'
    } : 'Sin archivo');
    
    let { nombre, apellido, correoElectronico, contrasena, dui, telefono, rol } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !apellido || !correoElectronico || !contrasena || !dui || !telefono) {
      console.log('❌ Faltan campos requeridos');
      return res.status(400).json({ 
        message: "Todos los campos son requeridos" 
      });
    }
    
    // Verificar si ya existe el correo
    const existsEmail = await EmpleadosModel.findOne({ correoElectronico });
    if (existsEmail) {
      return res.status(400).json({ 
        message: "Ya existe un empleado con ese correo electrónico" 
      });
    }
    
    // Verificar si ya existe el DUI
    const existsDUI = await EmpleadosModel.findOne({ dui });
    if (existsDUI) {
      return res.status(400).json({ 
        message: "Ya existe un empleado con ese DUI" 
      });
    }
    
    // Procesar imagen si existe
    let fotoURL = "";
    if (req.file && req.file.buffer) {
      try {
        console.log('📤 Subiendo imagen a Cloudinary...');
        console.log('Tamaño del buffer:', req.file.buffer.length);
        console.log('Tipo MIME:', req.file.mimetype);
        
        fotoURL = await uploadBufferToCloudinary(
          req.file.buffer,
          'diunsolo/empleados'
        );
        
        console.log('✅ Imagen subida exitosamente:', fotoURL);
      } catch (uploadError) {
        console.error('❌ Error subiendo imagen a Cloudinary:', uploadError);
        // No fallar la creación del empleado si falla la imagen
        console.log('⚠️ Continuando sin imagen...');
      }
    } else {
      console.log('ℹ️ No se recibió imagen o no tiene buffer');
    }
    
    // Normalizar teléfono
    if (telefono) {
      let clean = (telefono + '').replace(/[^0-9]/g, '');
      if (clean.length === 8) {
        telefono = clean.slice(0, 4) + '-' + clean.slice(4);
      }
      const regex = /^[267]\d{3}-\d{4}$/;
      if (!regex.test(telefono)) {
        return res.status(400).json({ 
          message: 'El teléfono debe estar completo y en formato 0000-0000, iniciando con 2, 6 o 7' 
        });
      }
    }

    // Encriptar contraseña
    const passwordHash = await bcryptjs.hash(contrasena, 10);

    // Crear empleado
    const empleadoData = {
      nombre, 
      apellido, 
      correoElectronico, 
      contrasena: passwordHash,
      dui, 
      telefono, 
      rol: rol || 'Empleado'
    };

    if (fotoURL) {
      empleadoData.foto = fotoURL;
    }

    console.log('💾 Datos del empleado a guardar:', {
      ...empleadoData,
      contrasena: '[OCULTA]',
      foto: empleadoData.foto ? 'URL presente' : 'Sin foto'
    });

    const newEmpleado = new EmpleadosModel(empleadoData);
    await newEmpleado.save();

    console.log('✅ Empleado guardado exitosamente');

    res.status(201).json({ 
      message: "Nuevo empleado registrado", 
      empleado: newEmpleado 
    });
  } catch (error) {
    console.error('❌ Error al registrar empleado:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let friendlyField = field;
      if (field === 'correoElectronico') friendlyField = 'correo electrónico';
      if (field === 'dui') friendlyField = 'DUI';
      
      return res.status(400).json({ 
        message: `Ya existe un empleado con ese ${friendlyField}` 
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
    
    console.log('=== ACTUALIZANDO EMPLEADO ===');
    console.log('ID:', id);
    console.log('Body:', req.body);
    console.log('File:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer presente' : 'Sin buffer'
    } : 'Sin archivo');

    // Verificar que el empleado existe
    const currentEmpleado = await EmpleadosModel.findById(id);
    if (!currentEmpleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // Procesar imagen si existe
    let fotoURL = undefined; // undefined para no actualizar si no se envía
    if (req.file && req.file.buffer) {
      try {
        console.log('📤 Subiendo nueva imagen a Cloudinary...');
        console.log('Tamaño del buffer:', req.file.buffer.length);
        
        fotoURL = await uploadBufferToCloudinary(
          req.file.buffer,
          'diunsolo/empleados'
        );
        
        console.log('✅ Nueva imagen subida exitosamente:', fotoURL);
      } catch (uploadError) {
        console.error('❌ Error subiendo nueva imagen:', uploadError);
        // No fallar la actualización si falla la imagen
        console.log('⚠️ Continuando sin actualizar imagen...');
      }
    }
    
    // Verificar duplicados si se está cambiando el correo
    if (correoElectronico && correoElectronico !== currentEmpleado.correoElectronico) {
      const existsEmail = await EmpleadosModel.findOne({ 
        correoElectronico, 
        _id: { $ne: id } 
      });
      if (existsEmail) {
        return res.status(400).json({ 
          message: "Ya existe un empleado con ese correo electrónico" 
        });
      }
    }
    
    // Verificar duplicados si se está cambiando el DUI
    if (dui && dui !== currentEmpleado.dui) {
      const existsDUI = await EmpleadosModel.findOne({ 
        dui, 
        _id: { $ne: id } 
      });
      if (existsDUI) {
        return res.status(400).json({ 
          message: "Ya existe un empleado con ese DUI" 
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

    console.log('💾 Datos a actualizar:', {
      ...updateData,
      contrasena: updateData.contrasena ? '[ACTUALIZADA]' : '[SIN CAMBIOS]',
      foto: updateData.foto ? 'URL nueva' : 'Sin cambios'
    });

    const updated = await EmpleadosModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
    
    console.log('✅ Empleado actualizado exitosamente');
    
    res.json({ 
      message: "Empleado actualizado", 
      empleado: updated 
    });
  } catch (error) {
    console.error('❌ Error al actualizar empleado:', error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let friendlyField = field;
      if (field === 'correoElectronico') friendlyField = 'correo electrónico';
      if (field === 'dui') friendlyField = 'DUI';
      
      return res.status(400).json({ 
        message: `Ya existe un empleado con ese ${friendlyField}` 
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
    
    console.log('🗑️ Eliminando empleado:', id);
    
    const deleted = await EmpleadosModel.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
    
    console.log('✅ Empleado eliminado exitosamente');
    
    res.json({ message: "Empleado eliminado" });
  } catch (error) {
    console.error('❌ Error al eliminar empleado:', error);
    res.status(500).json({ 
      message: "Error al eliminar empleado", 
      error: error.message 
    });
  }
};

// GET ALL
EmpleadosController.getEmpleados = async (req, res) => {
  try {
    console.log('📋 Obteniendo todos los empleados');
    const Empleados = await EmpleadosModel.find().sort({ createdAt: -1 });
    console.log(`✅ Se encontraron ${Empleados.length} empleados`);
    res.json(Empleados);
  } catch (error) {
    console.error('❌ Error al obtener empleados:', error);
    res.status(500).json({ 
      message: "Error al obtener empleados", 
      error: error.message 
    });
  }
};

export default EmpleadosController;