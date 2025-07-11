// Email HTML para verificación de cuenta/cambio de correo
const HTMLVerifyAccountEmail = (code) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 28px 18px 24px 18px; background: #fafbfc;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="cid:diunsolologo" alt="Diunsolo RentaCar" style="max-width: 120px; margin-bottom: 12px;" />
      </div>
      <h2 style="color: #1C318C; text-align: center; font-size: 2rem; margin-bottom: 0.5rem;">¡Verifica tu cuenta en <span style='color:#009BDB;'>Diunsolo RentaCar</span>!</h2>
      <p style="font-size: 1.1rem; color: #222; text-align: center; margin-bottom: 1.2rem;">Hola,<br>estás a punto de cambiar tu correo electrónico.<br>Usa el siguiente código de verificación para confirmar el cambio:</p>
      <div style="background: #e6f6fb; border-radius: 8px; padding: 18px 12px; margin: 18px 0; text-align: center;">
        <span style="font-size: 1.5rem; color: #1C318C; font-weight: 700; letter-spacing: 2px;">${code}</span>
      </div>
      <div style="color: #888; font-size: 1rem; text-align: center; margin-bottom: 1.2rem;">Este código es válido por los próximos <strong>15 minutos</strong>.<br>Si no solicitaste este cambio, puedes ignorar este correo.</div>
      <hr style="margin: 32px 0 18px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 0.97em; color: #888; text-align: center;">¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@diunsolo.com" style="color:#009BDB;">soporte@diunsolo.com</a></p>
      <div style="text-align: center; margin-top: 18px;">
        <a href="http://localhost:5173" style="color: #009BDB; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a>
      </div>
    </div>
  `;
};

export { HTMLVerifyAccountEmail };
