import React, { useEffect } from 'react';
import { FaTimes, FaUpload, FaTrash, FaCar, FaPlus } from 'react-icons/fa';
import { useVehicleForm } from '../../hooks/admin/useVehicleForm';
import { useMarcas } from '../../hooks/admin/useMarcas';
import './styles/VehicleFormModal.css';

const VehicleFormModal = ({ 
  isOpen, 
  onClose, 
  vehicle = null, 
  onSuccess = () => {} 
}) => {
  // Log para debug
  useEffect(() => {
    console.log('VehicleFormModal - vehicle prop changed:', vehicle);
    console.log('VehicleFormModal - isOpen:', isOpen);
  }, [vehicle, isOpen]);

  const {
    formData,
    loading,
    error,
    fieldErrors,
    uploadingImages,
    handleInputChange,
    handleImageUpload,
    removeImage,
    handleImageVista3_4,
    handleImageLateral,
    removeImageVista3_4,
    removeImageLateral,
    submitForm,
    resetForm,
    setError,
    scrollToField
  } = useVehicleForm(vehicle, (savedVehicle) => {
    onSuccess(savedVehicle);
    // No cerrar automáticamente aquí, dejar que el padre maneje el cierre
  });

  const { marcas, loading: marcasLoading, error: marcasError } = useMarcas();

  useEffect(() => {
    console.log('🔄 Modal isOpen changed:', isOpen, 'vehicle:', vehicle);
    if (!isOpen) {
      // Al cerrar el modal, limpiar todo
      resetForm();
      setError(null);
    } else {
      // Al abrir el modal, asegurar estado limpio si es para crear
      if (!vehicle) {
        console.log('🆕 Opening modal for new vehicle, resetting form');
        resetForm();
        setError(null);
      }
    }
  }, [isOpen, vehicle, resetForm, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submission started');
    console.log('📝 Modal type:', vehicle ? 'EDIT' : 'CREATE');
    console.log('📝 Vehicle data:', vehicle);
    console.log('📝 Current formData:', formData);
    console.log('📝 Current fieldErrors before submit:', fieldErrors);
    
    const result = await submitForm();
    console.log('📋 Submit result:', result);
    
    // Si hay errores de validación, hacer scroll al primer campo con error
    if (!result.success && result.firstErrorField) {
      console.log('❌ Form submission failed, scrolling to field:', result.firstErrorField);
      console.log('📝 Current fieldErrors after submit:', fieldErrors);
      console.log('📝 Is field error from server:', result.fieldError);
      
      // Hacer scroll al campo con error después de un pequeño delay para que se actualice el DOM
      setTimeout(() => {
        console.log('🎯 Executing scroll to field:', result.firstErrorField);
        scrollToField(result.firstErrorField);
      }, result.fieldError ? 300 : 200); // Más delay para errores del servidor
    } else if (result.success) {
      console.log('✅ Form submitted successfully!');
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
      // Limpiar el input para permitir seleccionar los mismos archivos nuevamente
      e.target.value = '';
    }
  };

  const handleVista3_4Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageVista3_4(file);
      e.target.value = '';
    }
  };

  const handleLateralChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageLateral(file);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  // Componente helper para mostrar errores de campo
  const FieldError = ({ fieldName }) => {
    if (!fieldErrors[fieldName]) return null;
    return (
      <span className="field-error">
        {fieldErrors[fieldName]}
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="vehicle-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vehicle-form-header">
          <h2>
            <FaCar />
            {vehicle ? 'Editar Vehículo' : 'Crear Nuevo Vehículo'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {uploadingImages && (
            <div className="form-error" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', borderLeftColor: '#1d4ed8' }}>
              🔄 Subiendo imágenes a Cloudinary... Por favor espere.
            </div>
          )}

          <div className="form-grid">
            {/* Información básica */}
            <div className="form-section">
              <h3>Información Básica</h3>
              
              <div className="form-group">
                <label htmlFor="nombreVehiculo">Nombre del Vehículo *</label>
                <input
                  type="text"
                  id="nombreVehiculo"
                  value={formData.nombreVehiculo}
                  onChange={(e) => handleInputChange('nombreVehiculo', e.target.value)}
                  placeholder="Ej: Toyota Corolla Plateado"
                  className={fieldErrors.nombreVehiculo ? 'error' : ''}
                  required
                />
                <FieldError fieldName="nombreVehiculo" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="idMarca">Marca *</label>
                  <select
                    id="idMarca"
                    value={formData.idMarca}
                    onChange={(e) => handleInputChange('idMarca', e.target.value)}
                    className={fieldErrors.idMarca ? 'error' : ''}
                    required
                    disabled={marcasLoading}
                  >
                    <option value="">Seleccione una marca</option>
                    {marcas.map((marca) => (
                      <option key={marca._id} value={marca._id}>
                        {marca.nombreMarca}
                      </option>
                    ))}
                  </select>
                  {marcasError && (
                    <span className="field-error">Error al cargar marcas</span>
                  )}
                  <FieldError fieldName="idMarca" />
                </div>
                <div className="form-group">
                  <label htmlFor="modelo">Modelo *</label>
                  <input
                    type="text"
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => handleInputChange('modelo', e.target.value)}
                    placeholder="Ej: Corolla"
                    className={fieldErrors.modelo ? 'error' : ''}
                    required
                  />
                  <FieldError fieldName="modelo" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="clase">Clase/Tipo de Vehículo *</label>
                <input
                  type="text"
                  id="clase"
                  value={formData.clase}
                  onChange={(e) => handleInputChange('clase', e.target.value)}
                  placeholder="Ej: Sedán, SUV, Pickup, etc."
                  className={fieldErrors.clase ? 'error' : ''}
                  required
                />
                <FieldError fieldName="clase" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="anio">Año *</label>
                  <input
                    type="text"
                    id="anio"
                    value={formData.anio}
                    onChange={(e) => handleInputChange('anio', e.target.value)}
                    onKeyDown={(e) => {
                      // Prevenir entrada de caracteres no numéricos
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      // Limpiar cualquier carácter no numérico
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    maxLength="4"
                    placeholder="Ej: 2020"
                    pattern="[0-9]{4}"
                    title="Ingrese un año válido de 4 dígitos"
                    className={fieldErrors.anio ? 'error' : ''}
                    required
                  />
                  <FieldError fieldName="anio" />
                </div>
                <div className="form-group">
                  <label htmlFor="color">Color *</label>
                  <input
                    type="text"
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="Ej: Plateado"
                    className={fieldErrors.color ? 'error' : ''}
                    required
                  />
                  <FieldError fieldName="color" />
                </div>
              </div>
            </div>

            {/* Información técnica */}
            <div className="form-section">
              <h3>Información Técnica</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="placa">Placa *</label>
                  <input
                    type="text"
                    id="placa"
                    value={formData.placa}
                    onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                    placeholder="Ej: ABC123"
                    pattern="[A-Za-z0-9]{6,8}"
                    title="La placa debe tener entre 6 y 8 caracteres alfanuméricos"
                    maxLength="8"
                    className={fieldErrors.placa ? 'error' : ''}
                    required
                  />
                  <FieldError fieldName="placa" />
                </div>
                <div className="form-group">
                  <label htmlFor="capacidad">Capacidad *</label>
                  <input
                    type="number"
                    id="capacidad"
                    value={formData.capacidad}
                    onChange={(e) => handleInputChange('capacidad', e.target.value)}
                    onKeyDown={(e) => {
                      // Prevenir entrada de 'e', 'E', '+', '-', '.'
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      // Limpiar cualquier carácter no numérico
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    min="1"
                    max="50"
                    placeholder="Número de pasajeros"
                    title="La capacidad debe ser entre 1 y 50 pasajeros"
                    className={fieldErrors.capacidad ? 'error' : ''}
                    required
                  />
                  <FieldError fieldName="capacidad" />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="numeroMotor">Número de Motor</label>
                <input
                  type="text"
                  id="numeroMotor"
                  value={formData.numeroMotor}
                  onChange={(e) => handleInputChange('numeroMotor', e.target.value)}
                  placeholder="Número de motor del vehículo"
                  className={fieldErrors.numeroMotor ? 'error' : ''}
                />
                <FieldError fieldName="numeroMotor" />
              </div>

              <div className="form-group">
                <label htmlFor="numeroChasisGrabado">Número de Chasis Grabado</label>
                <input
                  type="text"
                  id="numeroChasisGrabado"
                  value={formData.numeroChasisGrabado}
                  onChange={(e) => handleInputChange('numeroChasisGrabado', e.target.value)}
                  placeholder="Número de chasis grabado"
                  className={fieldErrors.numeroChasisGrabado ? 'error' : ''}
                />
                <FieldError fieldName="numeroChasisGrabado" />
              </div>

              <div className="form-group">
                <label htmlFor="numeroVinChasis">Número VIN/Chasis</label>
                <input
                  type="text"
                  id="numeroVinChasis"
                  value={formData.numeroVinChasis}
                  onChange={(e) => handleInputChange('numeroVinChasis', e.target.value)}
                  placeholder="Número VIN del vehículo"
                  className={fieldErrors.numeroVinChasis ? 'error' : ''}
                />
                <FieldError fieldName="numeroVinChasis" />
              </div>
            </div>

            {/* Precio y disponibilidad */}
            <div className="form-section">
              <h3>Precio y Disponibilidad</h3>
              
              <div className="form-group">
                <label htmlFor="precioPorDia">Precio Diario (USD) *</label>
                <input
                  type="number"
                  id="precioPorDia"
                  value={formData.precioPorDia}
                  onChange={(e) => handleInputChange('precioPorDia', e.target.value)}
                  onKeyDown={(e) => {
                    // Prevenir entrada de 'e', 'E', '+', '-' 
                    if (['e', 'E', '+', '-'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  title="Ingrese el precio diario en USD (ej: 25.50)"
                  className={fieldErrors.precioPorDia ? 'error' : ''}
                  required
                />
                <FieldError fieldName="precioPorDia" />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado del Vehículo *</label>
                <select
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className={fieldErrors.estado ? 'error' : ''}
                  required
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Reservado">Reservado</option>
                  <option value="Mantenimiento">En Mantenimiento</option>
                </select>
                <FieldError fieldName="estado" />
              </div>
            </div>

            {/* Imágenes */}
            <div className="form-section full-width">
              <h3>Imágenes del Vehículo</h3>
              
              {/* Imagen Vista 3/4 */}
              <div className="form-group vista-3-4-section" data-field="imagenVista3_4">
                <h4>Vista 3/4 (Imagen Principal) *</h4>
                <label htmlFor="imagenVista3_4" className={`upload-label ${formData.imagenVista3_4 ? 'has-image' : ''} ${fieldErrors.imagenVista3_4 ? 'error' : ''}`}>
                  {formData.imagenVista3_4 ? (
                    <div className="upload-preview">
                      <img 
                        src={formData.imagenVista3_4.url || formData.imagenVista3_4} 
                        alt="Vista 3/4"
                        className="preview-image"
                      />
                      <div className="upload-overlay">
                        <FaUpload className="upload-icon" />
                        <span className="upload-text">Cambiar Imagen</span>
                      </div>
                      <button
                        type="button"
                        className="remove-upload-image-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImageVista3_4();
                        }}
                        title="Eliminar imagen"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaUpload className="upload-icon" />
                      <span className="upload-text">
                        {uploadingImages ? 'Subiendo...' : 'Imagen Vista 3/4 (Ícono Principal)'}
                      </span>
                      <span className="upload-hint">Recomendado: 800x600px (4:3) - JPG, PNG</span>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="imagenVista3_4"
                  accept="image/*"
                  onChange={handleVista3_4Change}
                  style={{ display: 'none' }}
                  disabled={uploadingImages}
                />
                <p className="field-description">
                  Esta imagen se mostrará como ícono principal en las tarjetas de vehículos. 
                  Use una imagen clara del vehículo desde un ángulo 3/4 frontal.
                </p>
                <FieldError fieldName="imagenVista3_4" />
              </div>

              {/* Imagen Lateral */}
              <div className="form-group lateral-section" data-field="imagenLateral">
                <h4>Imagen Lateral *</h4>
                <label htmlFor="imagenLateral" className={`upload-label ${formData.imagenLateral ? 'has-image' : ''} ${fieldErrors.imagenLateral ? 'error' : ''}`}>
                  {formData.imagenLateral ? (
                    <div className="upload-preview">
                      <img 
                        src={formData.imagenLateral.url || formData.imagenLateral} 
                        alt="Lateral"
                        className="preview-image"
                      />
                      <div className="upload-overlay">
                        <FaUpload className="upload-icon" />
                        <span className="upload-text">Cambiar Imagen</span>
                      </div>
                      <button
                        type="button"
                        className="remove-upload-image-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImageLateral();
                        }}
                        title="Eliminar imagen"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaUpload className="upload-icon" />
                      <span className="upload-text">
                        {uploadingImages ? 'Subiendo...' : 'Imagen Lateral'}
                      </span>
                      <span className="upload-hint">Recomendado: 1200x800px (3:2) - JPG, PNG</span>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="imagenLateral"
                  accept="image/*"
                  onChange={handleLateralChange}
                  style={{ display: 'none' }}
                  disabled={uploadingImages}
                />
                <p className="field-description">
                  Imagen del perfil lateral completo del vehículo para mostrar detalles del diseño.
                </p>
                <FieldError fieldName="imagenLateral" />
              </div>

              {/* Galería de Imágenes */}
              <div className="form-group gallery-section" data-field="imagenes">
                <h4>Galería de Imágenes Adicionales</h4>
                <div className="gallery-upload-area">
                  <label htmlFor="images" className={`gallery-upload-label ${fieldErrors.imagenes ? 'error' : ''}`}>
                    <FaUpload className="upload-icon" />
                    <span className="upload-text">
                      {uploadingImages ? 'Subiendo Imágenes...' : 'Agregar Imágenes a la Galería'}
                    </span>
                    <span className="upload-hint">Múltiples archivos - Máximo 10 imágenes</span>
                  </label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={uploadingImages}
                  />
                </div>
                <p className="field-description">
                  Múltiples imágenes adicionales: interior, motor, detalles especiales, etc. 
                  Recomendado: 1024x768px cada una - JPG, PNG.
                </p>
                <FieldError fieldName="imagenes" />

                {formData.imagenes && formData.imagenes.length > 0 && (
                  <div className="gallery-carousel">
                    <div className="gallery-preview">
                      {formData.imagenes.map((img, index) => (
                        <div key={index} className="gallery-image-item">
                          <img 
                            src={img.url || img} 
                            alt={`Galería ${index + 1}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            className="remove-gallery-image-btn"
                            onClick={() => removeImage(index)}
                            title="Eliminar imagen"
                          >
                            <FaTrash />
                          </button>
                          <div className="image-index">{index + 1}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="gallery-controls">
                      <div className="gallery-info">
                        <span>{formData.imagenes.length} de 10 imágenes</span>
                      </div>
                      
                      {/* Botón para agregar más imágenes */}
                      {formData.imagenes.length < 10 && (
                        <label htmlFor="add-more-images" className="add-more-gallery-btn">
                          <FaPlus className="add-icon" />
                          <span>Agregar más imágenes</span>
                          <input
                            type="file"
                            id="add-more-images"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onClose}
              disabled={loading || uploadingImages}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading || uploadingImages}
            >
              {loading ? 'Guardando...' : 
               uploadingImages ? 'Subiendo imágenes...' : 
               (vehicle ? 'Actualizar Vehículo' : 'Crear Vehículo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;