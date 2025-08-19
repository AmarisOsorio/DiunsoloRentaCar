import React, { useState } from 'react';
import DeleteAcountConfirm from '../accountInformation/modals/deleteAccount/DeleteAcountConfirm.jsx';
import { FaUser } from 'react-icons/fa';
import ProfileSection from '../utils/ProfileSection.jsx';
import EditableField from '../utils/EditableField.jsx';
import PasswordField from '../utils/PasswordField.jsx';
import DocumentUpload from '../utils/DocumentUpload.jsx';
import ReadOnlyField from '../utils/ReadOnlyField.jsx';
import VerifyAccountModal from './modals/verifyAccount/VerifyAccountModal.jsx';

// --- PATCH: Hook para interceptar el guardado de correo y abrir modal de verificación ---
// Recibe handleSaveField, editingField, tempValues, etc. como props

function useInterceptEmailSave({ editingField, tempValues, handleSaveField, verifyEmail, setShowVerifyModal }) {
  // Intercepta el guardado del correo para abrir el modal y enviar código
  const onSave = React.useCallback(
    async (field) => {
      if (field === 'correo') {
        if (typeof verifyEmail === 'function') {
          const correo = tempValues.correo || tempValues.email;
          const ok = await verifyEmail(correo);
          // Si verifyEmail devuelve false, no abrir modal (el error se muestra en el input)
          if (ok === true) {
            setShowVerifyModal(true);
          }
        } else {
          setShowVerifyModal(true);
        }
      } else {
        handleSaveField(field);
      }
    },
    [handleSaveField, verifyEmail, setShowVerifyModal, tempValues]
  );
  return onSave;
}

/**
 * Componente para mostrar y editar la información de cuenta del usuario
 */
const InformacionCuenta = ({
  editingField,
  isSaving,
  localUserInfo,
  tempValues,
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  validationErrors,
  hasErrors,
  showVerifyModal,
  setShowVerifyModal,
  verifyEmail,
  handleVerifyEmailCode,
  handleResendEmailCode,
  emailCodeReady,
  emailVerificationError,
  emailVerifying,
  emailResending,
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
  handleDeleteAccount,
  formatPhoneNumber,
  updateTempValue,
  validateField,
  getInputClassName,
  setNewPassword,
  setConfirmPassword,
  setShowNewPassword,
  setShowConfirmPassword
}) => {
  // Estado para mostrar el modal de confirmación de eliminación de cuenta y error de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  // Intercepta el guardado del correo para abrir el modal y enviar código
  const onSaveField = useInterceptEmailSave({ editingField, tempValues, handleSaveField, verifyEmail, setShowVerifyModal });
  // --- AJUSTE: Visualizar nombre completo, editar nombre/s y apellido/s ---
  // Si no está editando, muestra el nombre completo (nombre + apellido del backend)
  // Si está editando, muestra dos inputs: nombre/s y apellido/s
  // Permitir edición si se está editando nombre o apellido
  const isEditingName = editingField === 'name' || editingField === 'lastName';

  // Use English field names from localUserInfo
  const name = localUserInfo.name || '';
  const lastName = localUserInfo.lastName || '';
  const fullName = `${name} ${lastName}`.trim();

  // For editing, use tempValues.name and tempValues.lastName

  // Recibe los props de error y loading del padre
  // emailVerificationError, emailVerifying, emailResending
  // Los pasamos directo al modal

  return (
    <div className="perfil-content">
      {/* Modal de verificación de correo */}
      {showVerifyModal && (
        <VerifyAccountModal
          open={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          email={tempValues.correo || tempValues.email || verifyEmail}
          onVerify={(code) => handleVerifyEmailCode(tempValues.correo || tempValues.email || verifyEmail, code)}
          onResend={handleResendEmailCode}
          verifying={emailVerifying}
          resending={emailResending}
          emailCodeReady={emailCodeReady}
          error={emailVerificationError}
        />
      )}
      {/* Información Personal */}
      <ProfileSection
        title="Información Personal"
        subtitle="La información proporcionada a continuación se reflejará en tus facturas"
        icon={FaUser}
      >
        {/* Campo Nombre (siempre usando EditableField) */}
        {!isEditingName ? (
          <EditableField
            label="Nombre completo"
            fieldName="name"
            value={fullName}
            displayValue={fullName}
            isEditing={false}
            isSaving={isSaving}
            placeholder="Ingresa tu nombre completo"
            onEdit={() => handleEditField('name')}
            onSave={() => handleSaveField('name')}
            onCancel={handleCancelEdit}
            onChange={updateTempValue}
            validationError={validationErrors.name || validationErrors.lastName}
            getInputClassName={getInputClassName}
          />
        ) : (
          <>
            <EditableField
              label="Nombre(s)"
              fieldName="name"
              value={name}
              tempValue={tempValues.name}
              isEditing={true}
              isSaving={isSaving}
              placeholder="Nombre(s)"
              onEdit={handleEditField}
              onSave={() => handleSaveField('name')}
              onCancel={handleCancelEdit}
              onChange={updateTempValue}
              validationError={validationErrors.name}
              getInputClassName={getInputClassName}
              autoFocus
              showSaveCancel={false}
            />
            <EditableField
              label="Apellido(s)"
              fieldName="lastName"
              value={lastName}
              tempValue={tempValues.lastName}
              isEditing={true}
              isSaving={isSaving}
              placeholder="Apellido(s)"
              onEdit={handleEditField}
              onSave={() => handleSaveField('lastName')}
              onCancel={handleCancelEdit}
              onChange={updateTempValue}
              validationError={validationErrors.lastName}
              getInputClassName={getInputClassName}
              showSaveCancel={false}
            />
          </>
        )}
        {/* Campo Teléfono */}
        <EditableField
          label="Número de teléfono"
          fieldName="phone"
          value={localUserInfo.phone}
          tempValue={tempValues.phone}
          isEditing={editingField === 'phone'}
          isSaving={isSaving}
          type="tel"
          placeholder="2345-6789"
          maxLength="9"
          displayValue={`+503 ${localUserInfo.phone}`}
          formatValue={formatPhoneNumber}
          onEdit={handleEditField}
          onSave={() => handleSaveField('phone')}
          onCancel={handleCancelEdit}
          onChange={updateTempValue}
          validationError={validationErrors.phone}
          getInputClassName={getInputClassName}
        />

        {/* Campo Fecha de Nacimiento */}
        <EditableField
          label="Fecha de nacimiento"
          fieldName="birthDate"
          value={localUserInfo.birthDate}
          tempValue={tempValues.birthDate}
          isEditing={editingField === 'birthDate'}
          isSaving={isSaving}
          type="date"
          displayValue={localUserInfo.birthDate ? new Date(localUserInfo.birthDate).toLocaleDateString('es-ES') : ''}
          onEdit={handleEditField}
          onSave={() => handleSaveField('birthDate')}
          onCancel={handleCancelEdit}
          onChange={updateTempValue}
          validationError={validationErrors.birthDate}
          getInputClassName={getInputClassName}
        />

        {/* Licencia */}
        <DocumentUpload
          label="Licencia de conducir (frente y reverso)"
          documents={{
            frente: localUserInfo.licenseFront,
            reverso: localUserInfo.licenseBack
          }}
          fileRefs={{
            frente: licenciaFrenteRef,
            reverso: licenciaReversoRef
          }}
          onFileUpload={(e, side) => handleFileUpload(e, 'license', side)}
          onRemoveImage={(side) => handleRemoveImage('license', side)}
          validationErrors={{
            frente: validationErrors.licenseFront,
            reverso: validationErrors.licenseBack
          }}
        />

        {/* Pasaporte/DUI */}
        <DocumentUpload
          label="Pasaporte/DUI (frente y reverso)"
          documents={{
            frente: localUserInfo.passportFront,
            reverso: localUserInfo.passportBack
          }}
          fileRefs={{
            frente: pasaporteFrenteRef,
            reverso: pasaporteReversoRef
          }}
          onFileUpload={(e, side) => handleFileUpload(e, 'passport', side)}
          onRemoveImage={(side) => handleRemoveImage('passport', side)}
          validationErrors={{
            frente: validationErrors.passportFront,
            reverso: validationErrors.passportBack
          }}
        />
      </ProfileSection>

      {/* Configuraciones de Cuenta */}
      <ProfileSection title="Configuraciones de cuenta">
        {/* Campo Email */}
        <EditableField
          label="Correo electrónico"
          fieldName="correo"
          value={localUserInfo.correo || localUserInfo.email || ''}
          tempValue={tempValues.correo || tempValues.email || ''}
          isEditing={editingField === 'correo'}
          isSaving={isSaving}
          type="email"
          placeholder="ejemplo@correo.com"
          onEdit={handleEditField}
          onSave={() => onSaveField('correo')}
          onCancel={handleCancelEdit}
          onChange={updateTempValue}
          validationError={validationErrors.correo || emailVerificationError || validationErrors.email}
          getInputClassName={getInputClassName}
        />

        {/* Campo Contraseña */}
        <PasswordField
          isEditing={editingField === 'password'}
          isSaving={isSaving}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          onEdit={handleEditField}
          onSave={() => handleSaveField('password')}
          onCancel={handleCancelEdit}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          setShowNewPassword={setShowNewPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          validationErrors={validationErrors}
          getInputClassName={getInputClassName}
        />

        {/* Miembro desde */}
        <ReadOnlyField
          label="Miembro desde"
          value={localUserInfo.miembroDesde}
        />
      </ProfileSection>

      {/* Sección Cuenta */}
      <ProfileSection title="Cuenta">
        <div className="perfil-delete-section">
          <h3>Eliminar cuenta</h3>
          <p>Ten en cuenta que al eliminar tu cuenta toda la información de tu cuenta será eliminada sin posibilidad de restauración. No puedes eliminar tu cuenta si tienes reservas realizadas. Si deseas proceder con la eliminación, por favor contáctanos para asistencia.</p>
          {deleteError && (
            <div className="perfil-delete-error" style={{ color: 'red', marginBottom: 10 }}>
              {deleteError}
            </div>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="perfil-btn perfil-btn-danger"
          >
            Eliminar cuenta
          </button>
          {/* Modal de confirmación para eliminar cuenta */}
          <DeleteAcountConfirm
            isOpen={showDeleteModal}
            message="¿Seguro que quieres eliminar tu cuenta?"
            onConfirm={async () => {
              setShowDeleteModal(false);
              setDeleteError("");
              try {
                await handleDeleteAccount();
              } catch (err) {
                setDeleteError(err?.message || "No se pudo eliminar la cuenta. Intenta de nuevo.");
              }
            }}
            onCancel={() => setShowDeleteModal(false)}
            showSuccess={false}
          />
        </div>
      </ProfileSection>
    </div>
  );
};

export default InformacionCuenta;
