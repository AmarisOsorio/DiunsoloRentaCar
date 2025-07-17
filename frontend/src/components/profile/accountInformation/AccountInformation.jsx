import React, { useState } from 'react';
import DeleteAcountConfirm from '../../modals/deleteAccount/DeleteAcountConfirm.jsx';
import { FaUser } from 'react-icons/fa';
import ProfileSection from '../utils/ProfileSection.jsx';
import EditableField from '../utils/EditableField.jsx';
import PasswordField from '../utils/PasswordField.jsx';
import DocumentUpload from '../utils/DocumentUpload.jsx';
import ReadOnlyField from '../utils/ReadOnlyField.jsx';
import VerifyAccountModal from '../../modals/verifyAccount/VerifyAccountModal.jsx';

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
  const isEditingNombre = editingField === 'nombre' || editingField === 'apellido';

  // Usar los datos de la base de datos (nombre y apellido separados)
  const nombre = localUserInfo.nombre || '';
  const apellido = localUserInfo.apellido || '';
  const nombreCompleto = `${nombre} ${apellido}`.trim();

  // Para edición, usar tempValues.nombre y tempValues.apellido

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
        {!isEditingNombre ? (
          <EditableField
            label="Nombre"
            fieldName="nombre"
            value={nombreCompleto}
            displayValue={nombreCompleto}
            isEditing={false}
            isSaving={isSaving}
            placeholder="Ingresa tu nombre completo"
            onEdit={() => handleEditField('nombre')}
            onSave={() => handleSaveField('nombre')}
            onCancel={handleCancelEdit}
            onChange={updateTempValue}
            validationError={validationErrors.nombre || validationErrors.apellido}
            getInputClassName={getInputClassName}
          />
        ) : (
          <>
            <EditableField
              label="Nombre/s"
              fieldName="nombre"
              value={nombre}
              tempValue={tempValues.nombre}
              isEditing={true}
              isSaving={isSaving}
              placeholder="Nombre(s)"
              onEdit={handleEditField}
              onSave={() => handleSaveField('nombre')}
              onCancel={handleCancelEdit}
              onChange={updateTempValue}
              validationError={validationErrors.nombre}
              getInputClassName={getInputClassName}
              autoFocus
              showSaveCancel={false}
            />
            <EditableField
              label="Apellido/s"
              fieldName="apellido"
              value={apellido}
              tempValue={tempValues.apellido}
              isEditing={true}
              isSaving={isSaving}
              placeholder="Apellido(s)"
              onEdit={handleEditField}
              onSave={() => handleSaveField('apellido')}
              onCancel={handleCancelEdit}
              onChange={updateTempValue}
              validationError={validationErrors.apellido}
              getInputClassName={getInputClassName}
              showSaveCancel={false}
            />
          </>
        )}
        {/* Campo Teléfono */}
        <EditableField
          label="Número de teléfono"
          fieldName="telefono"
          value={localUserInfo.telefono}
          tempValue={tempValues.telefono}
          isEditing={editingField === 'telefono'}
          isSaving={isSaving}
          type="tel"
          placeholder="2345-6789"
          maxLength="9"
          displayValue={`+503 ${localUserInfo.telefono}`}
          formatValue={formatPhoneNumber}
          onEdit={handleEditField}
          onSave={() => handleSaveField('telefono')}
          onCancel={handleCancelEdit}
          onChange={updateTempValue}
          validationError={validationErrors.telefono}
          getInputClassName={getInputClassName}
        />

        {/* Campo Fecha de Nacimiento */}
        <EditableField
          label="Fecha de nacimiento"
          fieldName="fechaNacimiento"
          value={localUserInfo.fechaNacimiento}
          tempValue={tempValues.fechaNacimiento}
          isEditing={editingField === 'fechaNacimiento'}
          isSaving={isSaving}
          type="date"
          displayValue={new Date(localUserInfo.fechaNacimiento).toLocaleDateString('es-ES')}
          onEdit={handleEditField}
          onSave={() => handleSaveField('fechaNacimiento')}
          onCancel={handleCancelEdit}
          onChange={updateTempValue}
          validationError={validationErrors.fechaNacimiento}
          getInputClassName={getInputClassName}
        />

        {/* Licencia */}
        <DocumentUpload
          label="Licencia (frente y reverso)"
          documents={{
            frente: localUserInfo.licenciaFrente,
            reverso: localUserInfo.licenciaReverso
          }}
          fileRefs={{
            frente: licenciaFrenteRef,
            reverso: licenciaReversoRef
          }}
          onFileUpload={(e, side) => handleFileUpload(e, 'licencia', side)}
          onRemoveImage={(side) => handleRemoveImage('licencia', side)}
          validationErrors={{
            frente: validationErrors.licenciaFrente,
            reverso: validationErrors.licenciaReverso
          }}
        />

        {/* Pasaporte/DUI */}
        <DocumentUpload
          label="Pasaporte/DUI (frente y reverso)"
          documents={{
            frente: localUserInfo.pasaporteFrente,
            reverso: localUserInfo.pasaporteReverso
          }}
          fileRefs={{
            frente: pasaporteFrenteRef,
            reverso: pasaporteReversoRef
          }}
          onFileUpload={(e, side) => handleFileUpload(e, 'pasaporte', side)}
          onRemoveImage={(side) => handleRemoveImage('pasaporte', side)}
          validationErrors={{
            frente: validationErrors.pasaporteFrente,
            reverso: validationErrors.pasaporteReverso
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
