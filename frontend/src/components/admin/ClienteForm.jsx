import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import './styles/ClienteForm.css';

const ClienteForm = ({ cliente, onSave, onClose, loading = false }) => {
  const [formData, setFormData] = useState({
    nombre: cliente?.nombre || '',
    apellido: cliente?.apellido || '',
    correo: cliente?.correo || '',
    telefono: cliente?.telefono || '',
    fechaDeNacimiento: cliente?.fechaDeNacimiento || '',
    isVerified: cliente?.isVerified || false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.fechaDeNacimiento) {
      newErrors.fechaDeNacimiento = 'La fecha de nacimiento es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="cliente-form-modal">
        <div className="cliente-form-header">
          <h2>{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button 
            type="button" 
            onClick={onClose}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.nombre ? 'error' : ''}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && (
                <span className="error-message">
                  <AlertCircle size={16} />
                  {errors.nombre}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido *</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={errors.apellido ? 'error' : ''}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && (
                <span className="error-message">
                  <AlertCircle size={16} />
                  {errors.apellido}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico *</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={errors.correo ? 'error' : ''}
              placeholder="correo@ejemplo.com"
            />
            {errors.correo && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.correo}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={errors.telefono ? 'error' : ''}
                placeholder="Ej: +1 234 567 8900"
              />
              {errors.telefono && (
                <span className="error-message">
                  <AlertCircle size={16} />
                  {errors.telefono}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fechaDeNacimiento">Fecha de Nacimiento *</label>
              <input
                type="date"
                id="fechaDeNacimiento"
                name="fechaDeNacimiento"
                value={formData.fechaDeNacimiento}
                onChange={handleChange}
                className={errors.fechaDeNacimiento ? 'error' : ''}
              />
              {errors.fechaDeNacimiento && (
                <span className="error-message">
                  <AlertCircle size={16} />
                  {errors.fechaDeNacimiento}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleChange}
              />
              <span className="checkbox-text">Cliente verificado</span>
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Guardando...' : (cliente ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;
