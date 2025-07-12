import React, { useState, useEffect, useRef } from 'react';
import { User, RotateCcw, Trash2, Plus, Upload, X } from 'lucide-react';
import './EmpleadoForm.css';

const EmpleadoForm = ({ empleado, onSubmit, onClose, onDelete, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correoElectronico: '',
    contrasena: '',
    dui: '',
    telefono: '',
    rol: 'Empleado'
  });
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre || '',
        apellido: empleado.apellido || '',
        correoElectronico: empleado.correoElectronico || '',
        contrasena: '',
        dui: empleado.dui || '',
        telefono: empleado.telefono || '',
        rol: empleado.rol || 'Empleado'
      });
      
      // Si el empleado ya tiene foto, mostrarla
      if (empleado.foto) {
        setImagePreview(empleado.foto);
      }
    }
  }, [empleado]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = 'El correo electrónico no es válido';
    }

    if (!empleado && !formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    }

    if (!formData.dui.trim()) {
      newErrors.dui = 'El DUI es requerido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else {
      // Validación de teléfono en frontend también
      const telefonoClean = formData.telefono.replace(/[^0-9]/g, '');
      if (telefonoClean.length !== 8) {
        newErrors.telefono = 'El teléfono debe tener 8 dígitos';
      } else if (!/^[267]/.test(telefonoClean)) {
        newErrors.telefono = 'El teléfono debe empezar con 2, 6 o 7';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatear teléfono automáticamente
    if (name === 'telefono') {
      let cleanValue = value.replace(/[^0-9]/g, '');
      if (cleanValue.length <= 8) {
        if (cleanValue.length > 4) {
          cleanValue = cleanValue.slice(0, 4) + '-' + cleanValue.slice(4);
        }
        setFormData(prev => ({
          ...prev,
          [name]: cleanValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Archivo seleccionado:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Por favor selecciona un archivo de imagen válido'
        }));
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'La imagen debe ser menor a 5MB'
        }));
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error si existía
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(empleado?.foto || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== INICIO ENVÍO FORMULARIO ===');
    console.log('Datos del formulario:', formData);
    console.log('Imagen seleccionada:', selectedImage);
    
    if (!validateForm()) {
      console.log('Errores de validación:', errors);
      return;
    }

    // Crear FormData para enviar archivos
    const submitData = new FormData();
    
    // Agregar campos de texto - IMPORTANTE: verificar que los valores no sean undefined
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== undefined && value !== null) {
        // Para contraseña en modo edición, solo agregar si no está vacía
        if (key === 'contrasena' && empleado && !value.trim()) {
          console.log('Omitiendo contraseña vacía en edición');
          return;
        }
        console.log(`Agregando al FormData: ${key} = ${value}`);
        submitData.append(key, value);
      }
    });

    // Agregar imagen si se seleccionó
    if (selectedImage) {
      console.log('Agregando imagen al FormData:', selectedImage.name);
      submitData.append('foto', selectedImage);
    }

    // Debug: mostrar contenido del FormData
    console.log('=== CONTENIDO FORMDATA ===');
    for (let [key, value] of submitData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    console.log('Enviando datos al servidor...');
    const result = await onSubmit(submitData);
    console.log('Resultado del servidor:', result);
    
    if (!result.success && result.error) {
      setErrors({ submit: result.error });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      const result = await onDelete(empleado._id);
      if (result.success) {
        onClose();
      }
    }
  };

  return (
    <div className="empleado-form-modal-content">
      <div className="empleado-form-header">
        <p className="empleado-form-subtitle">
          Foto del Empleado:
        </p>
      </div>

      <div className="empleado-photo-section">
        <div className="empleado-photo-placeholder" onClick={handlePhotoClick}>
          {imagePreview ? (
            <div className="empleado-photo-preview">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="empleado-photo-image"
              />
              {selectedImage && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="empleado-photo-remove"
                >
                  <X className="empleado-photo-remove-icon" />
                </button>
              )}
            </div>
          ) : (
            <>
              <User className="empleado-photo-icon" />
              <div className="empleado-photo-add">
                <Plus className="empleado-photo-add-icon" />
              </div>
            </>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        
        {errors.image && (
          <span className="empleado-form-error" style={{ textAlign: 'center', marginTop: '8px' }}>
            {errors.image}
          </span>
        )}
        
        <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '12px', marginTop: '8px' }}>
          Haz clic para {imagePreview ? 'cambiar' : 'seleccionar'} imagen
        </p>
      </div>

      <form onSubmit={handleSubmit} className="empleado-form">
        <div className="empleado-form-field">
          <label className="empleado-form-label">Nombres:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`empleado-form-input ${errors.nombre ? 'error' : ''}`}
            placeholder=""
          />
          {errors.nombre && <span className="empleado-form-error">{errors.nombre}</span>}
        </div>

        <div className="empleado-form-field">
          <label className="empleado-form-label">Apellidos:</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className={`empleado-form-input ${errors.apellido ? 'error' : ''}`}
            placeholder=""
          />
          {errors.apellido && <span className="empleado-form-error">{errors.apellido}</span>}
        </div>

        <div className="empleado-form-field">
          <label className="empleado-form-label">Correo electrónico:</label>
          <input
            type="email"
            name="correoElectronico"
            value={formData.correoElectronico}
            onChange={handleChange}
            className={`empleado-form-input ${errors.correoElectronico ? 'error' : ''}`}
            placeholder=""
          />
          {errors.correoElectronico && <span className="empleado-form-error">{errors.correoElectronico}</span>}
        </div>

        <div className="empleado-form-field">
          <label className="empleado-form-label">Contraseña:</label>
          <input
            type="password"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            className={`empleado-form-input ${errors.contrasena ? 'error' : ''}`}
            placeholder={empleado ? "Dejar vacío para no cambiar" : ""}
          />
          {errors.contrasena && <span className="empleado-form-error">{errors.contrasena}</span>}
        </div>

        <div className="empleado-form-field">
          <label className="empleado-form-label">Número de teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`empleado-form-input ${errors.telefono ? 'error' : ''}`}
            placeholder="2345-6789"
            maxLength="9"
          />
          {errors.telefono && <span className="empleado-form-error">{errors.telefono}</span>}
          <small style={{color: '#6c757d', fontSize: '12px'}}>
            Debe empezar con 2, 6 o 7 (ej: 2345-6789)
          </small>
        </div>

        <div className="empleado-form-field">
          <label className="empleado-form-label">DUI:</label>
          <input
            type="text"
            name="dui"
            value={formData.dui}
            onChange={handleChange}
            className={`empleado-form-input ${errors.dui ? 'error' : ''}`}
            placeholder=""
          />
          {errors.dui && <span className="empleado-form-error">{errors.dui}</span>}
        </div>

        <div className="empleado-form-field">
          <label className="empleado-form-label">Rol:</label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="empleado-form-select"
          >
            <option value="Empleado">Empleado</option>
            <option value="Gestor">Gestor</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        {errors.submit && (
          <div className="empleado-form-submit-error">
            <p>{errors.submit}</p>
          </div>
        )}

        <div className="empleado-form-actions">
          {empleado ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className="empleado-form-submit-btn empleado-form-update-btn"
              >
                <RotateCcw className="empleado-form-btn-icon" />
                Actualizar Empleado
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="empleado-form-submit-btn empleado-form-delete-btn"
              >
                <Trash2 className="empleado-form-btn-icon" />
                Eliminar Empleado
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="empleado-form-submit-btn empleado-form-add-btn"
            >
              Agregar Empleado
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmpleadoForm;