import React from 'react';
import ProtectedRoute from '../../components/navegation/protectedRoutes/ProtectedRoute.jsx';
import SuccessCheckAnimation from '../../components/interactions/SuccessCheck/SuccessCheckAnimation.jsx';
import ImageConfirmModal from '../../components/profile/imageConfirmModal/ImageConfirmModal.jsx';
import { useInfoPerfil } from '../../components/profile/accountInformation/hooks/useAccountInformation.jsx';
import { InformacionCuenta, Reservas, Contratos } from '../../components/profile/index.js';
import './Profile.css';
import './validation-styles.css';
import { FaHome, FaUser, FaCalendarAlt, FaFileContract } from 'react-icons/fa';

/**
 * Componente de perfil de usuario que permite gestionar la información personal,
 * configuraciones de cuenta y acceso a reservas y contratos.
 */
const Perfil = () => {
  const {
    // Estados
    activeSubmenu,
    editingField,
    showSuccess,
    successMessage,
    showNewPassword,
    showConfirmPassword,
    isSaving,
    localUserInfo,
    tempValues,
    newPassword,
    confirmPassword,
    validationErrors,
    hasErrors,

    // Modal de verificación de email
    showVerifyModal,
    setShowVerifyModal,
    verifyEmail,
    handleVerifyEmailCode,
    handleResendEmailCode,
    emailVerificationError,
    emailVerifying,
    emailResending,

    // Estados del modal de confirmación
    imageConfirmModal,

    // Referencias
    licenciaFrenteRef,
    licenciaReversoRef,
    pasaporteFrenteRef,
    pasaporteReversoRef,

    // Funciones
    handleEditField,
    handleCancelEdit,
    handleSaveField,
    handleFileUpload,
    handleRemoveImage,
    handleNavigation,
    handleDeleteAccount,
    syncWithGlobalContext,
    formatPhoneNumber,
    updateTempValue,
    validateField,
    getInputClassName,
    setNewPassword,
    setConfirmPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    setShowSuccess,

    // Funciones del modal de confirmación
    handleImageConfirm,
    handleImageCancel,
    emailCodeReady,
    handleVerifyEmailRequest
  } = useInfoPerfil();

  /**
   * Renderiza el contenido del submenú activo
   */
  const renderContent = () => {
    switch (activeSubmenu) {
      case 'informacion-cuenta':
        return (
          <InformacionCuenta
            // Estados
            editingField={editingField}
            isSaving={isSaving}
            localUserInfo={localUserInfo}
            tempValues={tempValues}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            showNewPassword={showNewPassword}
            showConfirmPassword={showConfirmPassword}
            validationErrors={validationErrors}
            hasErrors={hasErrors}

            // Modal de verificación de email
            showVerifyModal={showVerifyModal}
            setShowVerifyModal={setShowVerifyModal}
            verifyEmail={handleVerifyEmailRequest}
            handleVerifyEmailCode={handleVerifyEmailCode}
            handleResendEmailCode={handleResendEmailCode}
            emailCodeReady={emailCodeReady}
            emailVerificationError={emailVerificationError}
            emailVerifying={emailVerifying}
            emailResending={emailResending}

            // Referencias
            licenciaFrenteRef={licenciaFrenteRef}
            licenciaReversoRef={licenciaReversoRef}
            pasaporteFrenteRef={pasaporteFrenteRef}
            pasaporteReversoRef={pasaporteReversoRef}

            // Funciones
            handleEditField={handleEditField}
            handleCancelEdit={handleCancelEdit}
            handleSaveField={handleSaveField}
            handleFileUpload={handleFileUpload}
            handleRemoveImage={handleRemoveImage}
            handleDeleteAccount={handleDeleteAccount}
            formatPhoneNumber={formatPhoneNumber}
            updateTempValue={updateTempValue}
            validateField={validateField}
            getInputClassName={getInputClassName}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            setShowNewPassword={setShowNewPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />
        );
        
      case 'reservas':
        return <Reservas shouldFetch={activeSubmenu === 'reservas'} />;
        
      case 'contratos':
        return <Contratos />;
      
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="perfil-container">
        {/* Submenú lateral */}
        <div className="perfil-sidebar">
          <h1 className="perfil-title">Mi perfil</h1>
          <nav className="perfil-nav">
            <button
              onClick={() => handleNavigation('informacion-cuenta')}
              className={`perfil-nav-item ${activeSubmenu === 'informacion-cuenta' ? 'active' : ''}`}
            >
              <FaUser className="perfil-nav-icon" />
              Información
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
        </div>        {/* Contenido principal */}
        <div className="perfil-main">
          <div className="perfil-breadcrumb">
            <FaHome />
            <span>Perfil - {activeSubmenu === 'informacion-cuenta' ? 'Información de cuenta' : 
                              activeSubmenu === 'reservas' ? 'Reservas' : 'Contratos'}</span>
          </div>
          
          {renderContent()}
        </div>
        
        {/* Success Check Animation como overlay */}
        {showSuccess && (
          <SuccessCheckAnimation
            message={successMessage}
            subtitle=""
            onClose={() => {
              setShowSuccess(false);
              setTimeout(() => {
                if (typeof setSuccessMessage === 'function') setSuccessMessage('');
              }, 100);
            }}
            duration={2000}
          />
        )}

        {/* Modal de confirmación de imagen */}
        {imageConfirmModal && (
          <ImageConfirmModal
            isOpen={!!imageConfirmModal.isOpen}
            onClose={handleImageCancel}
            onConfirm={handleImageConfirm}
            action={imageConfirmModal.action}
            documentType={imageConfirmModal.documentType}
            side={imageConfirmModal.side}
            imagePreview={imageConfirmModal.imagePreview}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Perfil;
