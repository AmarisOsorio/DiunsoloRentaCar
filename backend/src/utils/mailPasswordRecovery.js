import nodemailer from "nodemailer";
import { config } from "../config.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.email.email_user,
    pass: config.email.email_pass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: 'Diunsolo RentaCar <no-reply@diunsolo.com>',
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: 'diunsolologo.png',
          path: path.resolve(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'diunsolologo.png'),
          cid: 'diunsolologo'
        }
      ]
    });
    return info;
  } catch (error) {
    console.log("Error sending email", error);
  }
};

const HTMLRecoveryEmail = (code) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 28px 18px 24px 18px; background: #fafbfc;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="cid:diunsolologo" alt="Diunsolo RentaCar" style="max-width: 120px; margin-bottom: 12px;" />
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
        <a href="http://localhost:5173" style="color: #009BDB; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a>
      </div>
    </div>
  `;
};

export { sendEmail, HTMLRecoveryEmail };
