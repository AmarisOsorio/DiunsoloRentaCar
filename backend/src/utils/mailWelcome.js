// Importar dependencias necesarias
import nodemailer from 'nodemailer'; // Para enviar correos electrónicos
import dotenv from 'dotenv'; // Para cargar variables de entorno

// Cargar variables de entorno desde .env
dotenv.config();

async function sendWelcomeMail({ correo, nombre }) {
  // Configurar el transporte de correo usando Gmail y credenciales del .env
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Servicio de correo (puedes cambiarlo por otro proveedor)
    auth: {
      user: process.env.EMAIL_USER, // Usuario de correo (desde .env)
      pass: process.env.EMAIL_PASS  // Contraseña de correo (desde .env)
    },
  });

  // Opciones del correo a enviar
  const mailOptions = {
    from: 'DIUNSOLO Renta Car <no-reply@diunsolo.com>', // Remitente
    to: correo, // Destinatario
    subject: '¡Bienvenido a DIUNSOLO renta car! Tu Cuenta ha sido verificada.', // Asunto
    html: `
      <!-- Contenido HTML del correo -->
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 28px 18px 24px 18px; background: #fafbfc;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://res.cloudinary.com/dqgpmzr1n/image/upload/v1717284202/diunsolologo.png" alt="Diunsolo RentaCar" style="max-width: 120px; margin-bottom: 12px;" />
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
        <p style="font-size: 0.97em; color: #888; text-align: center;">
          ¿Necesitas ayuda? Contáctanos por WhatsApp al
          <a href="https://wa.me/50374234724" style="color:#009BDB; text-decoration:none; font-weight:bold;" target="_blank">7423-4724</a>
        </p>
        <div style="text-align: center; margin-top: 18px;">
          <a href="http://localhost:5173" style="color: #009BDB; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a>
        </div>
      </div>
    `

  };

  // Enviar el correo usando el transporter configurado
  await transporter.sendMail(mailOptions);
}

// Exportar la función para usarla en otros módulos
export default sendWelcomeMail;
