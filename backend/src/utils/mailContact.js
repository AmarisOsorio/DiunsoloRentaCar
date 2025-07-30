// Importar dependencias necesarias
import nodemailer from 'nodemailer'; // Para enviar correos electrónicos
import dotenv from 'dotenv'; // Para cargar variables de entorno
// Cargar variables de entorno desde .env
dotenv.config();

/*
 * Envía un correo con los datos del formulario de contacto.
 */
async function sendContactoMail({ nombre, correo, telefono, mensaje }) {
  // Configurar el transporte de correo usando Gmail y credenciales del .env
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Servicio de correo (puedes cambiarlo por otro proveedor)
    auth: {
      user: process.env.EMAIL_USER, // Usuario de correo (desde .env)
      pass: process.env.EMAIL_PASS // Contraseña de correo (desde .env)
    },
    tls: {
      rejectUnauthorized: false // Permitir certificados autofirmados (útil en desarrollo)
    }
  });

  // Opciones del correo a enviar
  const mailOptions = {
    from: 'DIUNSOLO Renta Car <no-reply@diunsolo.com>', // Remitente
    to: process.env.EMAIL_USER, // Destinatario (el propio correo de la empresa)
    subject: 'Nuevo mensaje de contacto desde DIUNSOLO Renta Car', // Asunto
    html: `
      <!-- Contenido HTML del correo -->
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 28px 18px 24px 18px; background: #fafbfc;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://res.cloudinary.com/dziypvsar/image/upload/v1753638778/diunsolo-logo_k1p5pm.png" alt="Diunsolo RentaCar" style="max-width: 120px; margin-bottom: 12px;" />
        </div>
        <h2 style="color: #1C318C; text-align: center; font-size: 2rem; margin-bottom: 0.5rem;">Nuevo mensaje de contacto</h2>
        <p style="font-size: 1.1rem; color: #222; text-align: center; margin-bottom: 1.2rem;">
          Has recibido un nuevo mensaje desde el formulario de contacto de <b>DIUNSOLO Renta Car</b>.
        </p>
        <div style="background: #e6f6fb; border-radius: 8px; padding: 18px 12px; margin: 18px 0; text-align: left;">
          <p style="margin: 0 0 8px 0;"><strong style="color:#1C318C;">Nombre:</strong> <span style="color:#222;">${nombre}</span></p>
          <p style="margin: 0 0 8px 0;"><strong style="color:#1C318C;">Correo:</strong> <a href="mailto:${correo}" style="color: #009BDB; text-decoration: none;">${correo}</a></p>
          <p style="margin: 0 0 8px 0;"><strong style="color:#1C318C;">Teléfono:</strong> <span style="color:#222;">${telefono}</span></p>
          <p style="margin: 0 0 6px 0;"><strong style="color:#1C318C;">Mensaje:</strong></p>
          <div style="background:#fff;padding:14px 18px;border-radius:8px;margin-bottom:1rem; color: #222; font-size: 15px;">
            ${mensaje}
          </div>
        </div>
        <hr style="margin: 32px 0 18px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 0.97em; color: #888; text-align: center;">
          ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@diunsolo.com" style="color:#009BDB;">soporte@diunsolo.com</a>
        </p>
        <div style="text-align: center; margin-top: 18px;">
          <a href="https://diunsolo.rent" style="color: #009BDB; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a>
        </div>
      </div>
    `
  };

  // Enviar el correo usando el transporter configurado
  await transporter.sendMail(mailOptions);
}

// Exportar la función para usarla en otros módulos
export default sendContactoMail;