import nodemailer from "nodemailer";
import { config } from "../config.js";

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
    });
    return info;
  } catch (error) {
    console.log("Error sending email", error);
  }
};

const HTMLRecoveryEmail = (code) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f9; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px;">Recuperación de Contraseña</h1>
      <p style="font-size: 16px; color: #555; line-height: 1.5;">
        Hola, recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación para continuar:
      </p>
      <div style="display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 18px; font-weight: bold; color: #fff; background-color: #007bff; border-radius: 5px; border: 1px solid #0056b3;">
        ${code}
      </div>
      <p style="font-size: 14px; color: #777; line-height: 1.5;">
        Este código es válido por los próximos <strong>15 minutos</strong>. Si no solicitaste este correo, puedes ignorarlo.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <footer style="font-size: 12px; color: #aaa;">
        Si necesitas más ayuda, contacta a nuestro equipo de soporte en
        <a href="mailto:soporte@diunsolo.com" style="color: #3498db; text-decoration: none;">soporte@diunsolo.com</a>.
      </footer>
    </div>
  `;
};

export { sendEmail, HTMLRecoveryEmail };
