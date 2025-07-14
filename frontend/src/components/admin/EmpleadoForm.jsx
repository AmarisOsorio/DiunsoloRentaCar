import React, { useState } from 'react';
import { X, Save, AlertCircle, Upload } from 'lucide-react';
import './styles/EmpleadoForm.css';

const EmpleadoForm = ({ empleado, onSave, onClose, loading = false }) => {
  const [formData, setFormData] = useState({
    nombre: empleado?.nombre || '',
    apellido: empleado?.apellido || '',
    correoElectronico: empleado?.correoElectronico || '',
    telefono: empleado?.telefono || '',
    rol: empleado?.rol || 'Empleado',
    foto: empleado?.foto || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = 'El correo no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.rol.trim()) {
      newErrors.rol = 'El rol es requerido';
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
      <div className="empleado-form-modal">
        <div className="empleado-form-header">
          <h2>{empleado ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
          <button 
            type="button" 
            onClick={onClose}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="empleado-form">
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
            <label htmlFor="correoElectronico">Correo Electrónico *</label>
            <input
              type="email"
              id="correoElectronico"
              name="correoElectronico"
              value={formData.correoElectronico}
              onChange={handleChange}
              className={errors.correoElectronico ? 'error' : ''}
              placeholder="correo@ejemplo.com"
            />
            {errors.correoElectronico && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.correoElectronico}
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
              <label htmlFor="rol">Rol *</label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className={errors.rol ? 'error' : ''}
              >
                <option value="Empleado">Empleado</option>
                <option value="Administrador">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Supervisor">Supervisor</option>
              </select>
              {errors.rol && (
                <span className="error-message">
                  <AlertCircle size={16} />
                  {errors.rol}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="foto">URL de Foto de Perfil</label>
            <input
              type="url"
              id="foto"
              name="foto"
              value={formData.foto}
              onChange={handleChange}
              placeholder="https://ejemplo.com/foto.jpg"
            />
            <small className="form-help">
              Opcional: URL de imagen para la foto de perfil del empleado
            </small>
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
              {loading ? 'Guardando...' : (empleado ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmpleadoForm;
