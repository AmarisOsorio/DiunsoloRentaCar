import employeesModel from "../models/Employees.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Función para eliminar archivo temporal
function deleteTemporaryFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error al eliminar archivo temporal:', error);
  }
}

// Función de validación de teléfono
function validatePhone(phone) {
  if (!phone) return { isValid: false, message: "El teléfono es requerido" };
  
  let cleanPhone = phone.toString().replace(/[^0-9]/g, '');
  
  if (cleanPhone.length === 8) {
    cleanPhone = cleanPhone.slice(0, 4) + '-' + cleanPhone.slice(4);
  }
  
  const phoneRegex = /^[267]\d{3}-\d{4}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { 
      isValid: false, 
      message: 'El teléfono debe tener formato 0000-0000 e iniciar con 2, 6 o 7' 
    };
  }
  
  return { isValid: true, phone: cleanPhone };
}

// Función de validación de DUI
function validateDUI(dui) {
  if (!dui) return { isValid: false, message: "El DUI es requerido" };
  
  const duiRegex = /^\d{8}-\d{1}$/;
  if (!duiRegex.test(dui)) {
    return { 
      isValid: false, 
      message: 'El DUI debe tener formato 00000000-0' 
    };
  }
  
  return { isValid: true };
}

// Función de validación de email
function validateEmail(email) {
  if (!email) return { isValid: false, message: "El email es requerido" };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      message: 'El email debe tener un formato válido' 
    };
  }
  
  return { isValid: true };
}

const EmployeesController = {};

// GET ALL EMPLOYEES
EmployeesController.getEmployees = async (req, res) => {
  try {
    const employees = await employeesModel.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      message: "Empleados obtenidos exitosamente",
      data: employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ 
      message: "Error interno del servidor al obtener empleados", 
      error: error.message 
    });
  }
};

// GET EMPLOYEE BY ID
EmployeesController.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: "ID de empleado inválido" 
      });
    }
    
    const employee = await employeesModel.findById(id);
    
    if (!employee) {
      return res.status(404).json({ 
        message: "Empleado no encontrado" 
      });
    }
    
    res.status(200).json({
      message: "Empleado obtenido exitosamente",
      data: employee
    });
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
};

// INSERT EMPLOYEE
EmployeesController.insertEmployees = async (req, res) => {
  try {
    const { name, email, password, dui, phone, rol } = req.body;
    
    // Validaciones básicas
    if (!name || !email || !password || !dui || !phone) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(400).json({ 
        message: "Todos los campos obligatorios son requeridos: name, email, password, dui, phone" 
      });
    }
    
    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(400).json({ message: emailValidation.message });
    }
    
    // Validar teléfono
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(400).json({ message: phoneValidation.message });
    }
    
    // Validar DUI
    const duiValidation = validateDUI(dui);
    if (!duiValidation.isValid) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(400).json({ message: duiValidation.message });
    }
    
    // Validar contraseña
    if (password.length < 6) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }
    
    // Verificar si ya existe el email
    const existsEmail = await employeesModel.findOne({ email });
    if (existsEmail) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(409).json({ 
        message: "Ya existe un empleado con ese email" 
      });
    }
    
    // Verificar si ya existe el DUI
    const existsDUI = await employeesModel.findOne({ dui });
    if (existsDUI) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(409).json({ 
        message: "Ya existe un empleado con ese DUI" 
      });
    }
    
    // Procesar imagen si existe
    let photoURL = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "diunsolo/empleados",
          allowed_formats: ["jpg", "png", "jpeg", "webp"]
        });
        
        photoURL = result.secure_url;
        deleteTemporaryFile(req.file.path);
      } catch (uploadError) {
        console.error('Error subiendo imagen a Cloudinary:', uploadError);
        deleteTemporaryFile(req.file.path);
        return res.status(500).json({
          message: "Error al subir la imagen"
        });
      }
    }
    
    // Encriptar contraseña
    const passwordHash = await bcryptjs.hash(password, 10);
    
    // Crear datos del empleado
    const employeeData = {
      name,
      email,
      password: passwordHash,
      dui,
      phone: phoneValidation.phone,
      rol: rol || 'Empleado'
    };
    
    if (photoURL) {
      employeeData.photo = photoURL;
    }
    
    const newEmployee = new employeesModel(employeeData);
    await newEmployee.save();
    
    // Respuesta sin la contraseña
    const responseEmployee = { ...newEmployee.toObject() };
    delete responseEmployee.password;
    delete responseEmployee.loginAttempts;
    delete responseEmployee.lockTime;
    
    res.status(201).json({ 
      message: "Empleado creado exitosamente", 
      data: responseEmployee 
    });
    
  } catch (error) {
    console.error('Error al crear empleado:', error);
    
    // Eliminar archivo temporal en caso de error
    if (req.file) deleteTemporaryFile(req.file.path);
    
    // Manejar errores de duplicados de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let friendlyField = field;
      if (field === 'email') friendlyField = 'email';
      if (field === 'dui') friendlyField = 'DUI';
      
      return res.status(409).json({ 
        message: `Ya existe un empleado con ese ${friendlyField}` 
      });
    }
    
    res.status(500).json({ 
      message: "Error interno del servidor al crear empleado", 
      error: error.message 
    });
  }
};

// UPDATE EMPLOYEE
EmployeesController.updateEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, dui, phone, rol } = req.body;
    
    // Validar ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(400).json({ 
        message: "ID de empleado inválido" 
      });
    }
    
    // Verificar que el empleado existe
    const currentEmployee = await employeesModel.findById(id);
    if (!currentEmployee) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(404).json({ 
        message: "Empleado no encontrado" 
      });
    }
    
    // Validaciones solo si se proporcionan los campos
    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        if (req.file) deleteTemporaryFile(req.file.path);
        return res.status(400).json({ message: emailValidation.message });
      }
    }
    
    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        if (req.file) deleteTemporaryFile(req.file.path);
        return res.status(400).json({ message: phoneValidation.message });
      }
    }
    
    if (dui) {
      const duiValidation = validateDUI(dui);
      if (!duiValidation.isValid) {
        if (req.file) deleteTemporaryFile(req.file.path);
        return res.status(400).json({ message: duiValidation.message });
      }
    }
    
    if (password && password.length < 6) {
      if (req.file) deleteTemporaryFile(req.file.path);
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }
    
    // Verificar duplicados si se está cambiando el email
    if (email && email !== currentEmployee.email) {
      const existsEmail = await employeesModel.findOne({ 
        email, 
        _id: { $ne: id } 
      });
      if (existsEmail) {
        if (req.file) deleteTemporaryFile(req.file.path);
        return res.status(409).json({ 
          message: "Ya existe un empleado con ese email" 
        });
      }
    }
    
    // Verificar duplicados si se está cambiando el DUI
    if (dui && dui !== currentEmployee.dui) {
      const existsDUI = await employeesModel.findOne({ 
        dui, 
        _id: { $ne: id } 
      });
      if (existsDUI) {
        if (req.file) deleteTemporaryFile(req.file.path);
        return res.status(409).json({ 
          message: "Ya existe un empleado con ese DUI" 
        });
      }
    }
    
    // Procesar imagen si existe
    let photoURL = undefined;
    if (req.file) {
      try {
        // Eliminar imagen anterior si existe
        if (currentEmployee.photo) {
          try {
            const urlParts = currentEmployee.photo.split('/');
            const fileWithExtension = urlParts.pop();
            const publicId = urlParts.slice(-2).join('/') + '/' + fileWithExtension.split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.error('Error al eliminar imagen anterior:', deleteError);
          }
        }
        
        // Subir nueva imagen
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "diunsolo/empleados",
          allowed_formats: ["jpg", "png", "jpeg", "webp"]
        });
        
        photoURL = result.secure_url;
        deleteTemporaryFile(req.file.path);
      } catch (uploadError) {
        console.error('Error subiendo nueva imagen:', uploadError);
        deleteTemporaryFile(req.file.path);
        return res.status(500).json({
          message: "Error al subir la imagen"
        });
      }
    }
    
    // Preparar datos para actualizar
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (dui) updateData.dui = dui;
    if (phone) updateData.phone = validatePhone(phone).phone;
    if (rol) updateData.rol = rol;
    
    // Solo actualizar contraseña si se proporciona
    if (password && password.trim() !== '') {
      // Verificar que la nueva contraseña sea diferente a la actual
      const isSamePassword = await bcryptjs.compare(password, currentEmployee.password);
      if (isSamePassword) {
        return res.status(400).json({
          message: "La nueva contraseña debe ser diferente a la actual"
        });
      }
      
      const passwordHash = await bcryptjs.hash(password, 10);
      updateData.password = passwordHash;
    }
    
    // Solo actualizar foto si se subió una nueva
    if (photoURL) {
      updateData.photo = photoURL;
    }
    
    const updatedEmployee = await employeesModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedEmployee) {
      return res.status(404).json({ 
        message: "Empleado no encontrado" 
      });
    }
    
    // Respuesta sin datos sensibles
    const responseEmployee = { ...updatedEmployee.toObject() };
    delete responseEmployee.password;
    delete responseEmployee.loginAttempts;
    delete responseEmployee.lockTime;
    
    res.status(200).json({ 
      message: "Empleado actualizado exitosamente", 
      data: responseEmployee 
    });
    
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    
    // Eliminar archivo temporal en caso de error
    if (req.file) deleteTemporaryFile(req.file.path);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let friendlyField = field;
      if (field === 'email') friendlyField = 'email';
      if (field === 'dui') friendlyField = 'DUI';
      
      return res.status(409).json({ 
        message: `Ya existe un empleado con ese ${friendlyField}` 
      });
    }
    
    res.status(500).json({ 
      message: "Error interno del servidor al actualizar empleado", 
      error: error.message 
    });
  }
};

// DELETE EMPLOYEE
EmployeesController.deleteEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: "ID de empleado inválido" 
      });
    }
    
    // Buscar empleado antes de eliminar para obtener la imagen
    const employeeToDelete = await employeesModel.findById(id);
    
    if (!employeeToDelete) {
      return res.status(404).json({ 
        message: "Empleado no encontrado" 
      });
    }
    
    // Eliminar imagen de Cloudinary si existe
    if (employeeToDelete.photo) {
      try {
        const urlParts = employeeToDelete.photo.split('/');
        const fileWithExtension = urlParts.pop();
        const publicId = urlParts.slice(-2).join('/') + '/' + fileWithExtension.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error('Error al eliminar imagen de Cloudinary:', deleteError);
      }
    }
    
    // Eliminar empleado de la base de datos
    const deletedEmployee = await employeesModel.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Empleado eliminado exitosamente",
      data: {
        id: deletedEmployee._id,
        name: deletedEmployee.name,
        email: deletedEmployee.email
      }
    });
    
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ 
      message: "Error interno del servidor al eliminar empleado", 
      error: error.message 
    });
  }
};

export default EmployeesController;