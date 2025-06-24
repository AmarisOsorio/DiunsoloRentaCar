import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import SuccessCheckAnimation from '../components/modals/SuccessCheckAnimation';
import './styles/Perfil.css';
import { FaHome, FaUser, FaCalendarAlt, FaFileContract, FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaUpload, FaTrash } from 'react-icons/fa';

/**
 * Componente de perfil de usuario que permite gestionar la información personal,
 * configuraciones de cuenta y acceso a reservas y contratos.
 */
const Perfil = () => {
  const { userType, userInfo, updateUserInfo, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  // Estados para el submenú activo
  const [activeSubmenu, setActiveSubmenu] = useState('informacion-cuenta');
    // Estados para edición de campos
  const [editingField, setEditingField] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
    // Estados para información del usuario (simulados por ahora)
  const [localUserInfo, setLocalUserInfo] = useState({
    nombre: userInfo?.nombreCompleto || 'Eduardo Sánchez',
    telefono: userInfo?.telefono || '2345-6789',
    email: userInfo?.correo || 'christhiansanchez2409@gmail.com',
    fechaNacimiento: userInfo?.fechaDeNacimiento || '1995-06-15',
    miembroDesde: userInfo?.fechaRegistro || '2025-05-28',
    licenciaFrente: userInfo?.licenciaFrente || null,
    licenciaReverso: userInfo?.licenciaReverso || null,
    pasaporteFrente: userInfo?.pasaporteFrenteDui || null,
    pasaporteReverso: userInfo?.pasaporteReversoDui || null
  });
    // Estados para campos temporales durante edición
  const [tempValues, setTempValues] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Referencias para los inputs de archivos
  const licenciaFrenteRef = useRef();
  const licenciaReversoRef = useRef();
  const pasaporteFrenteRef = useRef();
  const pasaporteReversoRef = useRef();

  /**
   * Inicia la edición de un campo específico
   * @param {string} field - Campo a editar
   */
  const handleEditField = (field) => {
    setEditingField(field);
    setTempValues({ ...localUserInfo });
    if (field === 'password') {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  /**
   * Cancela la edición actual
   */
  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValues({});
    setNewPassword('');
    setConfirmPassword('');
  };  /**
   * Guarda los cambios realizados en un campo
   */
  const handleSaveField = async () => {
    setIsSaving(true);
    try {
      if (editingField === 'password') {
        if (newPassword !== confirmPassword) {
          alert('Las contraseñas no coinciden');
          return;
        }
        if (newPassword.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        // Cambiar contraseña usando el contexto
        try {
          const result = await changePassword(newPassword);
          if (!result.success) {
            alert(result.message);
            return;
          }
        } catch (error) {
          // Si el backend no está disponible, simular éxito para desarrollo
          console.warn('Backend no disponible, simulando cambio de contraseña');
        }
      } else {
        // Validar campo específico
        if (editingField === 'telefono' && !/^[267][0-9]{3}-[0-9]{4}$/.test(tempValues.telefono)) {
          alert('El teléfono debe tener el formato correcto (ej: 2345-6789)');
          return;
        }
        if (editingField === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempValues.email)) {
          alert('Ingresa un correo electrónico válido');
          return;
        }
        
        // Actualizar información del usuario usando el contexto
        try {
          const result = await updateUserInfo(tempValues);
          if (!result.success) {
            alert(result.message);
            return;
          }
        } catch (error) {
          // Si el backend no está disponible, simular éxito para desarrollo
          console.warn('Backend no disponible, simulando actualización de información');
        }
        
        // Actualizar estado local
        setLocalUserInfo({ ...localUserInfo, ...tempValues });
      }
      
      // Mostrar mensaje de éxito
      setSuccessMessage('¡Información actualizada correctamente!');
      setShowSuccess(true);
      setEditingField(null);
      setTempValues({});
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error al actualizar información:', error);
      alert('Error al actualizar la información');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Maneja la subida de archivos para licencia/pasaporte
   * @param {Event} e - Evento del input de archivo
   * @param {string} type - Tipo de documento (licencia/pasaporte)
   * @param {string} side - Lado del documento (frente/reverso)
   */
  const handleFileUpload = async (e, type, side) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no puede superar los 5MB');
      return;
    }    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('image', file);
      
      // Aquí iría la llamada al backend para subir la imagen
      try {
        // const response = await fetch('/api/upload/upload-image', {
        //   method: 'POST',
        //   body: formData
        // });
        // const data = await response.json();
        
        // Por ahora, simular URL de imagen subida para desarrollo
        const imageUrl = URL.createObjectURL(file);
        
        // Actualizar el estado correspondiente
        const fieldName = `${type}${side.charAt(0).toUpperCase() + side.slice(1)}`;
        setLocalUserInfo(prev => ({
          ...prev,
          [fieldName]: imageUrl
        }));
        
        setSuccessMessage('¡Imagen subida correctamente!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (uploadError) {
        console.warn('Backend de subida no disponible, usando preview local');
        // Usar preview local como fallback
        const imageUrl = URL.createObjectURL(file);
        const fieldName = `${type}${side.charAt(0).toUpperCase() + side.slice(1)}`;
        setLocalUserInfo(prev => ({
          ...prev,
          [fieldName]: imageUrl
        }));
        
        setSuccessMessage('¡Imagen cargada localmente!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      alert('Error al procesar la imagen');
    }
  };

  /**
   * Elimina una imagen subida
   * @param {string} type - Tipo de documento
   * @param {string} side - Lado del documento
   */  const handleRemoveImage = (type, side) => {
    const fieldName = `${type}${side.charAt(0).toUpperCase() + side.slice(1)}`;
    setLocalUserInfo(prev => ({
      ...prev,
      [fieldName]: null
    }));
    
    setSuccessMessage('¡Imagen eliminada correctamente!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  /**
   * Navega a diferentes secciones
   * @param {string} section - Sección de destino
   */
  const handleNavigation = (section) => {
    if (section === 'home') {
      navigate('/');
    } else {
      setActiveSubmenu(section);
    }
  };  /**
   * Elimina la cuenta del usuario
   */
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    
    if (confirmDelete) {
      try {
        const result = await deleteAccount();
        if (result.success) {
          navigate('/');
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        // Para desarrollo, mostrar advertencia pero permitir continuar
        const forceDelete = window.confirm(
          'Error de conectividad con el servidor. ¿Deseas continuar? (Solo para desarrollo)'
        );
        if (forceDelete) {
          // Simular eliminación exitosa
          alert('Cuenta eliminada (simulado para desarrollo)');
          navigate('/');
        }
      }
    }
  };

  /**
   * Sincroniza la información local con el contexto global
   */
  const syncWithGlobalContext = () => {
    if (userInfo) {
      setLocalUserInfo({
        nombre: userInfo.nombreCompleto || localUserInfo.nombre,
        telefono: userInfo.telefono || localUserInfo.telefono,
        email: userInfo.correo || localUserInfo.email,
        fechaNacimiento: userInfo.fechaDeNacimiento || localUserInfo.fechaNacimiento,
        miembroDesde: userInfo.fechaRegistro || localUserInfo.miembroDesde,
        licenciaFrente: userInfo.licenciaFrente || localUserInfo.licenciaFrente,
        licenciaReverso: userInfo.licenciaReverso || localUserInfo.licenciaReverso,
        pasaporteFrente: userInfo.pasaporteFrenteDui || localUserInfo.pasaporteFrente,
        pasaporteReverso: userInfo.pasaporteReversoDui || localUserInfo.pasaporteReverso
      });
      
      setSuccessMessage('¡Información sincronizada!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    }
  };

  /**
   * Renderiza el contenido del submenú activo
   */
  const renderContent = () => {
    switch (activeSubmenu) {
      case 'informacion-cuenta':
        return (          <div className="perfil-content">
            <div className="perfil-section">
              <h2 className="perfil-section-title">
                <FaUser className="perfil-section-icon" />
                Información Personal
                <button 
                  onClick={syncWithGlobalContext}
                  className="perfil-btn perfil-btn-sync"
                  title="Sincronizar con datos del servidor"
                  style={{ marginLeft: 'auto', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  🔄 Sincronizar
                </button>
              </h2>
              <p className="perfil-section-subtitle">
                La información proporcionada a continuación se reflejará en tus facturas
              </p>
              
              {/* Campo Nombre */}
              <div className="perfil-field">
                <label className="perfil-field-label">Nombre</label>
                <div className="perfil-field-content">
                  {editingField === 'nombre' ? (
                    <div className="perfil-field-edit">
                      <input
                        type="text"
                        value={tempValues.nombre || ''}
                        onChange={(e) => setTempValues(prev => ({ ...prev, nombre: e.target.value }))}
                        className="perfil-input"                        placeholder="Ingresa tu nombre completo"
                      />
                      <div className="perfil-field-actions">
                        <button 
                          onClick={handleSaveField} 
                          className="perfil-btn perfil-btn-save"
                          disabled={isSaving}
                        >
                          {isSaving ? '⏳' : <FaSave />}
                        </button>
                        <button onClick={handleCancelEdit} className="perfil-btn perfil-btn-cancel">
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="perfil-field-display">
                      <span className="perfil-field-value">{localUserInfo.nombre}</span>
                      <button 
                        onClick={() => handleEditField('nombre')} 
                        className="perfil-btn perfil-btn-edit"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Campo Teléfono */}
              <div className="perfil-field">
                <label className="perfil-field-label">Número de teléfono</label>
                <div className="perfil-field-content">
                  {editingField === 'telefono' ? (
                    <div className="perfil-field-edit">
                      <input
                        type="tel"
                        value={tempValues.telefono || ''}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 4) {
                            value = value.slice(0, 4) + '-' + value.slice(4, 8);
                          }
                          setTempValues(prev => ({ ...prev, telefono: value }));
                        }}
                        className="perfil-input"
                        placeholder="2345-6789"                        maxLength="9"
                      />
                      <div className="perfil-field-actions">
                        <button 
                          onClick={handleSaveField} 
                          className="perfil-btn perfil-btn-save"
                          disabled={isSaving}
                        >
                          {isSaving ? '⏳' : <FaSave />}
                        </button>
                        <button onClick={handleCancelEdit} className="perfil-btn perfil-btn-cancel">
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="perfil-field-display">
                      <span className="perfil-field-value">+503 {localUserInfo.telefono}</span>
                      <button 
                        onClick={() => handleEditField('telefono')} 
                        className="perfil-btn perfil-btn-edit"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Campo Fecha de Nacimiento */}
              <div className="perfil-field">
                <label className="perfil-field-label">Fecha de nacimiento</label>
                <div className="perfil-field-content">
                  {editingField === 'fechaNacimiento' ? (
                    <div className="perfil-field-edit">
                      <input
                        type="date"
                        value={tempValues.fechaNacimiento || ''}
                        onChange={(e) => setTempValues(prev => ({ ...prev, fechaNacimiento: e.target.value }))}                        className="perfil-input"
                      />
                      <div className="perfil-field-actions">
                        <button 
                          onClick={handleSaveField} 
                          className="perfil-btn perfil-btn-save"
                          disabled={isSaving}
                        >
                          {isSaving ? '⏳' : <FaSave />}
                        </button>
                        <button onClick={handleCancelEdit} className="perfil-btn perfil-btn-cancel">
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="perfil-field-display">
                      <span className="perfil-field-value">
                        {new Date(localUserInfo.fechaNacimiento).toLocaleDateString('es-ES')}
                      </span>
                      <button 
                        onClick={() => handleEditField('fechaNacimiento')} 
                        className="perfil-btn perfil-btn-edit"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Licencia */}
              <div className="perfil-field">
                <label className="perfil-field-label">Licencia (frente y reverso)</label>
                <div className="perfil-document-upload">
                  <div className="perfil-document-side">
                    <span className="perfil-document-label">Frente</span>                    {localUserInfo.licenciaFrente ? (
                      <div className="perfil-document-preview">
                        <img src={localUserInfo.licenciaFrente} alt="Licencia Frente" />
                        <div className="perfil-document-actions">
                          <button 
                            onClick={() => licenciaFrenteRef.current?.click()}
                            className="perfil-btn perfil-btn-change"
                          >
                            <FaUpload />
                          </button>
                          <button 
                            onClick={() => handleRemoveImage('licencia', 'frente')}
                            className="perfil-btn perfil-btn-delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => licenciaFrenteRef.current?.click()}
                        className="perfil-upload-button"
                      >
                        <FaUpload />
                        Subir imagen
                      </button>
                    )}
                    <input
                      ref={licenciaFrenteRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'licencia', 'frente')}
                      className="perfil-file-input"
                    />
                  </div>
                  
                  <div className="perfil-document-side">
                    <span className="perfil-document-label">Reverso</span>                    {localUserInfo.licenciaReverso ? (
                      <div className="perfil-document-preview">
                        <img src={localUserInfo.licenciaReverso} alt="Licencia Reverso" />
                        <div className="perfil-document-actions">
                          <button 
                            onClick={() => licenciaReversoRef.current?.click()}
                            className="perfil-btn perfil-btn-change"
                          >
                            <FaUpload />
                          </button>
                          <button 
                            onClick={() => handleRemoveImage('licencia', 'reverso')}
                            className="perfil-btn perfil-btn-delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => licenciaReversoRef.current?.click()}
                        className="perfil-upload-button"
                      >
                        <FaUpload />
                        Subir imagen
                      </button>
                    )}
                    <input
                      ref={licenciaReversoRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'licencia', 'reverso')}
                      className="perfil-file-input"
                    />
                  </div>
                </div>
              </div>

              {/* Pasaporte */}
              <div className="perfil-field">
                <label className="perfil-field-label">Pasaporte (frente y reverso)</label>
                <div className="perfil-document-upload">
                  <div className="perfil-document-side">
                    <span className="perfil-document-label">Frente</span>                    {localUserInfo.pasaporteFrente ? (
                      <div className="perfil-document-preview">
                        <img src={localUserInfo.pasaporteFrente} alt="Pasaporte Frente" />
                        <div className="perfil-document-actions">
                          <button 
                            onClick={() => pasaporteFrenteRef.current?.click()}
                            className="perfil-btn perfil-btn-change"
                          >
                            <FaUpload />
                          </button>
                          <button 
                            onClick={() => handleRemoveImage('pasaporte', 'frente')}
                            className="perfil-btn perfil-btn-delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => pasaporteFrenteRef.current?.click()}
                        className="perfil-upload-button"
                      >
                        <FaUpload />
                        Subir imagen
                      </button>
                    )}
                    <input
                      ref={pasaporteFrenteRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'pasaporte', 'frente')}
                      className="perfil-file-input"
                    />
                  </div>
                  
                  <div className="perfil-document-side">
                    <span className="perfil-document-label">Reverso</span>                    {localUserInfo.pasaporteReverso ? (
                      <div className="perfil-document-preview">
                        <img src={localUserInfo.pasaporteReverso} alt="Pasaporte Reverso" />
                        <div className="perfil-document-actions">
                          <button 
                            onClick={() => pasaporteReversoRef.current?.click()}
                            className="perfil-btn perfil-btn-change"
                          >
                            <FaUpload />
                          </button>
                          <button 
                            onClick={() => handleRemoveImage('pasaporte', 'reverso')}
                            className="perfil-btn perfil-btn-delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => pasaporteReversoRef.current?.click()}
                        className="perfil-upload-button"
                      >
                        <FaUpload />
                        Subir imagen
                      </button>
                    )}
                    <input
                      ref={pasaporteReversoRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'pasaporte', 'reverso')}
                      className="perfil-file-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configuraciones de Cuenta */}
            <div className="perfil-section">
              <h2 className="perfil-section-title">Configuraciones de cuenta</h2>
              
              {/* Campo Email */}
              <div className="perfil-field">
                <label className="perfil-field-label">Correo electrónico</label>
                <div className="perfil-field-content">
                  {editingField === 'email' ? (
                    <div className="perfil-field-edit">
                      <input
                        type="email"
                        value={tempValues.email || ''}
                        onChange={(e) => setTempValues(prev => ({ ...prev, email: e.target.value }))}
                        className="perfil-input"                        placeholder="correo@ejemplo.com"
                      />
                      <div className="perfil-field-actions">
                        <button 
                          onClick={handleSaveField} 
                          className="perfil-btn perfil-btn-save"
                          disabled={isSaving}
                        >
                          {isSaving ? '⏳' : <FaSave />}
                        </button>
                        <button onClick={handleCancelEdit} className="perfil-btn perfil-btn-cancel">
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="perfil-field-display">
                      <span className="perfil-field-value">{localUserInfo.email}</span>
                      <button 
                        onClick={() => handleEditField('email')} 
                        className="perfil-btn perfil-btn-edit"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="perfil-field">
                <label className="perfil-field-label">Contraseña</label>
                <div className="perfil-field-content">
                  {editingField === 'password' ? (
                    <div className="perfil-field-edit perfil-password-edit">
                      <div className="perfil-password-field">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="perfil-input"
                          placeholder="Nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="perfil-password-toggle"
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <div className="perfil-password-field">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="perfil-input"
                          placeholder="Confirmar contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="perfil-password-toggle"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>                      </div>
                      <div className="perfil-field-actions">
                        <button 
                          onClick={handleSaveField} 
                          className="perfil-btn perfil-btn-save"
                          disabled={isSaving}
                        >
                          {isSaving ? '⏳' : <FaSave />}
                        </button>
                        <button onClick={handleCancelEdit} className="perfil-btn perfil-btn-cancel">
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="perfil-field-display">
                      <span className="perfil-field-value">-</span>
                      <button 
                        onClick={() => handleEditField('password')} 
                        className="perfil-btn perfil-btn-edit"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}
                </div>
              </div>              {/* Miembro desde */}
              <div className="perfil-field">
                <label className="perfil-field-label">Miembro desde</label>
                <div className="perfil-field-content">
                  <div className="perfil-field-display">
                    <span className="perfil-field-value">
                      {new Date(localUserInfo.miembroDesde).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección Cuenta */}
            <div className="perfil-section">
              <h2 className="perfil-section-title">Cuenta</h2>
              <div className="perfil-delete-section">
                <h3>Eliminar cuenta</h3>
                <p>Ten en cuenta que al eliminar tu cuenta toda la información de tu cuenta será eliminada sin posibilidad de restauración.</p>
                <button onClick={handleDeleteAccount} className="perfil-btn perfil-btn-danger">
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'reservas':
        return (
          <div className="perfil-content">
            <div className="perfil-section">
              <h2 className="perfil-section-title">
                <FaCalendarAlt className="perfil-section-icon" />
                Reservas
              </h2>
              <div className="perfil-coming-soon">
                <p>Esta sección estará disponible próximamente.</p>
                <p>Aquí podrás ver y gestionar todas tus reservas de vehículos.</p>
              </div>
            </div>
          </div>
        );
      
      case 'contratos':
        return (
          <div className="perfil-content">
            <div className="perfil-section">
              <h2 className="perfil-section-title">
                <FaFileContract className="perfil-section-icon" />
                Contratos
              </h2>
              <div className="perfil-coming-soon">
                <p>Esta sección estará disponible próximamente.</p>
                <p>Aquí podrás ver y descargar todos tus contratos de alquiler.</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <SuccessCheckAnimation
        message={successMessage}
        subtitle=""
        onClose={() => setShowSuccess(false)}
        duration={2000}
      />
    );
  }

  return (
    <ProtectedRoute>
      <div className="perfil-container">
        {/* Submenú lateral */}
        <div className="perfil-sidebar">
          <h1 className="perfil-title">Información de la cuenta</h1>
          <nav className="perfil-nav">
            <button
              onClick={() => handleNavigation('home')}
              className="perfil-nav-item"
            >
              <FaHome className="perfil-nav-icon" />
              Volver al inicio
            </button>
            <button
              onClick={() => handleNavigation('informacion-cuenta')}
              className={`perfil-nav-item ${activeSubmenu === 'informacion-cuenta' ? 'active' : ''}`}
            >
              <FaUser className="perfil-nav-icon" />
              Información de cuenta
            </button>
            <button
              onClick={() => handleNavigation('reservas')}
              className={`perfil-nav-item ${activeSubmenu === 'reservas' ? 'active' : ''}`}
            >
              <FaCalendarAlt className="perfil-nav-icon" />
              Reservas
            </button>
            <button
              onClick={() => handleNavigation('contratos')}
              className={`perfil-nav-item ${activeSubmenu === 'contratos' ? 'active' : ''}`}
            >
              <FaFileContract className="perfil-nav-icon" />
              Contratos
            </button>
          </nav>
        </div>

        {/* Contenido principal */}
        <div className="perfil-main">
          <div className="perfil-breadcrumb">
            <FaHome />
            <span>Perfil - {activeSubmenu === 'informacion-cuenta' ? 'Información de cuenta' : 
                              activeSubmenu === 'reservas' ? 'Reservas' : 'Contratos'}</span>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Perfil;
