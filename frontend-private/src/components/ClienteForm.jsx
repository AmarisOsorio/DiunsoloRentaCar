import React, { useState, useEffect, useRef } from 'react';
import { User, RotateCcw, Trash2, Plus, Upload, X } from 'lucide-react';
import './ClienteForm.css';

const ClienteForm = ({ cliente, onSubmit, onClose, onDelete, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contraseña: '',
    telefono: '',
    fechaDeNacimiento: ''
  });
  const [errors, setErrors] = useState({});
  
  const [documentImages, setDocumentImages] = useState({
    licenciaFrente: null,
    licenciaReverso: null,
    pasaporteFrente: null,
    pasaporteReverso: null
  });
  
  const [documentPreviews, setDocumentPreviews] = useState({
    licenciaFrente: null,
    licenciaReverso: null,
    pasaporteFrente: null,
    pasaporteReverso: null
  });
  
  const fileInputRefs = {
    licenciaFrente: useRef(null),
    licenciaReverso: useRef(null),
    pasaporteFrente: useRef(null),
    pasaporteReverso: useRef(null)
  };

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        correo: cliente.correo || '',
        contraseña: '',
        telefono: cliente.telefono || '',
        fechaDeNacimiento: cliente.fechaDeNacimiento ? 
          new Date(cliente.fechaDeNacimiento).toISOString().split('T')[0] : ''
      });
      
      const previews = {};
      if (cliente.licenciaFrente) previews.licenciaFrente = cliente.licenciaFrente;
      if (cliente.licenciaReverso) previews.licenciaReverso = cliente.licenciaReverso;
      if (cliente.pasaporteFrente) previews.pasaporteFrente = cliente.pasaporteFrente;
      if (cliente.pasaporteReverso) previews.pasaporteReverso = cliente.pasaporteReverso;
      setDocumentPreviews(previews);
    }
  }, [cliente]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo electrónico no es válido';
    }

    if (!cliente && !formData.contraseña) {
      newErrors.contraseña = 'La contraseña es requerida';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else {
      const telefonoClean = formData.telefono.replace(/[^0-9]/g, '');
      if (telefonoClean.length !== 8) {
        newErrors.telefono = 'El teléfono debe tener 8 dígitos';
      } else if (!/^[267]/.test(telefonoClean)) {
        newErrors.telefono = 'El teléfono debe empezar con 2, 6 o 7';
      }
    }

    if (!formData.fechaDeNacimiento) {
      newErrors.fechaDeNacimiento = 'La fecha de nacimiento es requerida';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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

  const handleDocumentChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`📁 Archivo seleccionado para ${documentType}:`, {
        name: file.name,
        type: file.type,
        size: file.size
      });

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          [documentType]: 'Por favor selecciona un archivo de imagen válido'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [documentType]: 'La imagen debe ser menor a 5MB'
        }));
        return;
      }

      setDocumentImages(prev => ({
        ...prev,
        [documentType]: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreviews(prev => ({
          ...prev,
          [documentType]: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      if (errors[documentType]) {
        setErrors(prev => ({
          ...prev,
          [documentType]: ''
        }));
      }
    }
  };

  const handleRemoveDocument = (documentType) => {
    setDocumentImages(prev => ({
      ...prev,
      [documentType]: null
    }));
    
    setDocumentPreviews(prev => ({
      ...prev,
      [documentType]: cliente?.[documentType] || null
    }));
    
    if (fileInputRefs[documentType]?.current) {
      fileInputRefs[documentType].current.value = '';
    }
  };

  const handleDocumentClick = (documentType) => {
    fileInputRefs[documentType]?.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('=== PREPARANDO ENVÍO DE FORMULARIO CLIENTE ===');
      const submitData = new FormData();
      
      // Agregar campos de texto al FormData
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== undefined && value !== null && value !== '') {
          // Para contraseña en modo edición, solo agregar si no está vacía
          if (key === 'contraseña' && cliente && !value.trim()) {
            console.log('⏭️ Omitiendo contraseña vacía en edición');
            return;
          }
          console.log(`✅ Agregando campo: ${key} = ${value}`);
          submitData.append(key, value);
        }
      });

      // Agregar las imágenes de documentos si existen
      Object.keys(documentImages).forEach(key => {
        if (documentImages[key]) {
          console.log(`📷 Agregando imagen ${key}:`, {
            name: documentImages[key].name,
            size: documentImages[key].size,
            type: documentImages[key].type
          });
          submitData.append(key, documentImages[key]);
        }
      });

      // Debug: mostrar todo el contenido del FormData
      console.log('=== CONTENIDO FINAL DEL FORMDATA ===');
      for (let [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const result = await onSubmit(submitData);
      
      if (!result.success && result.error) {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      setErrors({ submit: 'Error inesperado: ' + error.message });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      const result = await onDelete(cliente._id);
      if (result.success) {
        onClose();
      }
    }
  };

  const renderDocumentUpload = (documentType, label) => {
    const hasPreview = documentPreviews[documentType];
    const hasNewImage = documentImages[documentType];
    
    return (
      <div className="cliente-document-upload">
        <div className="cliente-document-placeholder" onClick={() => handleDocumentClick(documentType)}>
          {hasPreview ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img 
                src={documentPreviews[documentType]} 
                alt={label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '6px'
                }}
              />
              {hasNewImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDocument(documentType);
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ) : (
            <Upload className="cliente-document-icon" />
          )}
        </div>
        <span className="cliente-document-label">{label}</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleDocumentChange(e, documentType)}
          ref={fileInputRefs[documentType]}
          style={{ display: 'none' }}
        />
        {errors[documentType] && (
          <span className="cliente-form-error" style={{ fontSize: '10px', textAlign: 'center' }}>
            {errors[documentType]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="cliente-form-modal-content">
      <div className="cliente-form-header">
        <p className="cliente-form-subtitle">
          Información del Cliente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="cliente-form">
        <div className="cliente-form-field">
          <label className="cliente-form-label">Nombres:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`cliente-form-input ${errors.nombre ? 'error' : ''}`}
            placeholder=""
          />
          {errors.nombre && <span className="cliente-form-error">{errors.nombre}</span>}
        </div>

        <div className="cliente-form-field">
          <label className="cliente-form-label">Apellidos:</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className={`cliente-form-input ${errors.apellido ? 'error' : ''}`}
            placeholder=""
          />
          {errors.apellido && <span className="cliente-form-error">{errors.apellido}</span>}
        </div>

        <div className="cliente-form-field">
          <label className="cliente-form-label">Correo electrónico:</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className={`cliente-form-input ${errors.correo ? 'error' : ''}`}
            placeholder=""
            disabled={!!cliente}
          />
          {errors.correo && <span className="cliente-form-error">{errors.correo}</span>}
        </div>

        <div className="cliente-form-field">
          <label className="cliente-form-label">Contraseña:</label>
          <input
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            className={`cliente-form-input ${errors.contraseña ? 'error' : ''}`}
            placeholder={cliente ? "Dejar vacío para no cambiar" : ""}
          />
          {errors.contraseña && <span className="cliente-form-error">{errors.contraseña}</span>}
        </div>

        <div className="cliente-form-field">
          <label className="cliente-form-label">Número de teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`cliente-form-input ${errors.telefono ? 'error' : ''}`}
            placeholder="2345-6789"
            maxLength="9"
          />
          {errors.telefono && <span className="cliente-form-error">{errors.telefono}</span>}
          <small style={{color: '#6c757d', fontSize: '12px'}}>
            Debe empezar con 2, 6 o 7 (ej: 2345-6789)
          </small>
        </div>

        <div className="cliente-form-field">
          <label className="cliente-form-label">Fecha de nacimiento:</label>
          <input
            type="date"
            name="fechaDeNacimiento"
            value={formData.fechaDeNacimiento}
            onChange={handleChange}
            className={`cliente-form-input ${errors.fechaDeNacimiento ? 'error' : ''}`}
          />
          {errors.fechaDeNacimiento && <span className="cliente-form-error">{errors.fechaDeNacimiento}</span>}
        </div>

        <div className="cliente-documents-section">
          <h3 className="cliente-documents-title">Pasaporte/DUI (Opcional):</h3>
          <div className="cliente-document-uploads">
            {renderDocumentUpload('pasaporteFrente', 'Frente')}
            {renderDocumentUpload('pasaporteReverso', 'Reverso')}
          </div>
        </div>

        <div className="cliente-documents-section">
          <h3 className="cliente-documents-title">Licencia (Opcional):</h3>
          <div className="cliente-document-uploads">
            {renderDocumentUpload('licenciaFrente', 'Frente')}
            {renderDocumentUpload('licenciaReverso', 'Reverso')}
          </div>
        </div>

        {errors.submit && (
          <div className="cliente-form-submit-error">
            <p>{errors.submit}</p>
          </div>
        )}

        <div className="cliente-form-actions">
          {cliente ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className="cliente-form-submit-btn cliente-form-update-btn"
              >
                <RotateCcw className="cliente-form-btn-icon" />
                {loading ? 'Actualizando...' : 'Actualizar Cliente'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="cliente-form-submit-btn cliente-form-delete-btn"
                disabled={loading}
              >
                <Trash2 className="cliente-form-btn-icon" />
                Eliminar Cliente
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="cliente-form-submit-btn cliente-form-add-btn"
            >
              <Plus className="cliente-form-btn-icon" />
              {loading ? 'Agregando...' : 'Agregar Cliente'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ClienteForm;