import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendWelcomeMail({ correo, nombre }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // O tu proveedor
    auth: {
      user: process.env.EMAIL_USER, // Cambiado a EMAIL_USER
      pass: process.env.EMAIL_PASS  // Cambiado a EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Permitir certificados autofirmados
    }
  });

  const mailOptions = {
    from: 'DIUNSOLO Renta Car <no-reply@diunsolo.com>',
    to: correo,
    subject: '¡Bienvenido a DIUNSOLO renta car! Tu Cuenta ha sido verificada.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 28px 18px 24px 18px; background: #fafbfc;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="cid:diunsolologo" alt="Diunsolo RentaCar" style="max-width: 120px; margin-bottom: 12px;" />
        </div>
        <h2 style="color: #1C318C; text-align: center; font-size: 2rem; margin-bottom: 0.5rem;">¡Bienvenido a <span style='color:#009BDB;'>Diunsolo RentaCar</span>!</h2>
        <p style="font-size: 1.1rem; color: #222; text-align: center; margin-bottom: 1.2rem;">Hola${nombre ? `, <b>${nombre}</b>` : ''},<br>tu cuenta ha sido verificada exitosamente.</p>
        <div style="background: #e6f6fb; border-radius: 8px; padding: 18px 12px; margin: 18px 0; text-align: center;">
          <span style="font-size: 1.15rem; color: #1C318C; font-weight: 600;">¡Ya puedes reservar tu vehículo favorito!</span>
        </div>
        <div style="width:100%;margin: 18px auto 0 auto;">
          <a href="http://localhost:5173/catalogo" style="display:block;margin:0 auto;padding:12px 28px;background:#009BDB;color:#fff;text-decoration:none;border-radius:7px;font-weight:bold;font-size:1.1rem;text-align:center;max-width:fit-content;">Ir al Catálogo</a>
        </div>
        <ul style="margin-top:1.5rem; color:#1C318C; font-size:1rem;">
          <li>Amplia selección de vehículos</li>
          <li>Precios competitivos</li>
          <li>Atención personalizada</li>
        </ul>
        <hr style="margin: 32px 0 18px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 0.97em; color: #888; text-align: center;">¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@diunsolo.com" style="color:#009BDB;">soporte@diunsolo.com</a></p>
        <div style="text-align: center; margin-top: 18px;">
          <a href="http://localhost:5173" style="color: #009BDB; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'diunsolologo.png',
        path: path.join(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'diunsolologo.png'),
        cid: 'diunsolologo'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}

export default sendWelcomeMail;
