// Importar dependencias necesarias
import nodemailer from "nodemailer"; // Para enviar correos electrónicos
import { config } from "../config.js"; // Configuración personalizada (usuario y contraseña de email)

// Configurar el transporte de correo usando SMTP de Gmail y credenciales del config.js
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Servidor SMTP de Gmail
  port: 465, // Puerto seguro para SMTP
  secure: true, // Usar conexión segura SSL/TLS
  auth: {
    user: config.email.email_user, // Usuario de correo (desde config.js)
    pass: config.email.email_pass, // Contraseña de correo (desde config.js)
  },
  tls: {
    rejectUnauthorized: false // Permitir certificados autofirmados (útil en desarrollo)
  }
});

/**
 * Envía un correo electrónico usando el transporter configurado.
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    // Enviar el correo con los datos y adjuntar el logo como imagen embebida
    const info = await transporter.sendMail({
      from: 'Diunsolo RentaCar <no-reply@diunsolo.com>', // Remitente
      to, // Destinatario
      subject, // Asunto
      text, // Texto plano
      html, // Contenido HTML
      // No se adjunta logo, se usará la URL de Cloudinary en el HTML
    });
    return info; // Retornar información del envío
  } catch (error) {
    // Mostrar error en consola si falla el envío
    console.log("Error sending email", error);
  }
};

/**
 * Genera el HTML para el correo de recuperación de contraseña.
 */
const HTMLRecoveryEmail = (code) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 28px 18px 24px 18px; background: #fafbfc;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://res.cloudinary.com/dziypvsar/image/upload/v1753638778/diunsolo-logo_k1p5pm.png" alt="Diunsolo RentaCar" style="max-width: 120px; margin-bottom: 12px;" />
      </div>
      <h2 style="color: #1C318C; text-align: center; font-size: 2rem; margin-bottom: 0.5rem;">Recuperación de contraseña</h2>
      <p style="font-size: 1.1rem; color: #222; text-align: center; margin-bottom: 1.2rem;">Hola,<br>recibimos una solicitud para restablecer tu contraseña.<br>Usa el siguiente código de verificación para continuar:</p>
      <div style="background: #e6f6fb; border-radius: 8px; padding: 18px 12px; margin: 18px 0; text-align: center;">
        <span style="font-size: 1.5rem; color: #1C318C; font-weight: 700; letter-spacing: 2px;">${code}</span>
      </div>
      <div style="color: #888; font-size: 1rem; text-align: center; margin-bottom: 1.2rem;">Este código es válido por los próximos <strong>15 minutos</strong>.<br>Si no solicitaste este correo, puedes ignorarlo.</div>
      <hr style="margin: 32px 0 18px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 0.97em; color: #888; text-align: center;">¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@diunsolo.com" style="color:#009BDB;">soporte@diunsolo.com</a></p>
      <div style="text-align: center; margin-top: 18px;">
        <a href="https://diunsolo-rent-car.vercel.app" style="color: #009BDB; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a>
      </div>
    </div>
  `;
};

// Exportar las funciones para usarlas en otros módulos
export { sendEmail, HTMLRecoveryEmail };
