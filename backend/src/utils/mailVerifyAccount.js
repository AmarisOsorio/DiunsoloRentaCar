//Import
import nodemailer from "nodemailer";
import { config } from "../config.js";

//Email HTML para verificación de cuenta/cambio de correo
const HTMLVerifyAccountEmail = (code, name = "", lastName = "") => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 28px 18px 24px 18px; background: #fafbfc;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="cid:diunsolologo" alt="Diunsolo RentaCar" style="max-width: 120px; margin-bottom: 12px;" />
      </div>
      <h2 style="color: #1C318C; text-align: center; font-size: 2rem; margin-bottom: 0.5rem;">¡Verifica tu cuenta en <span style='color:#009BDB;'>Diunsolo RentaCar</span>!</h2>
      <p style="font-size: 1.1rem; color: #222; text-align: center; margin-bottom: 1.2rem;">
        Hola <strong>${name} ${lastName}</strong>,<br>
        Usa el siguiente código de verificación para confirmar tu cuenta:
      </p>
      <div style="background: #e6f6fb; border-radius: 8px; padding: 18px 12px; margin: 18px 0; text-align: center;">
        <span style="font-size: 1.5rem; color: #1C318C; font-weight: 700; letter-spacing: 2px;">${code}</span>
      </div>
      <div style="color: #888; font-size: 1rem; text-align: center; margin-bottom: 1.2rem;">
        Este código es válido por los próximos <strong>15 minutos</strong>.<br>
        Si no solicitaste este registro, puedes ignorar este correo.
      </div>
      <hr style="margin: 32px 0 18px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 0.97em; color: #888; text-align: center;">
        ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@diunsolo.com" style="color:#009BDB;">soporte@diunsolo.com</a>
      </p>
      <div style="text-align: center; margin-top: 18px;">
        <a href="http://localhost:5173" style="color: #009BDB; text-decoration: none; font-weight: bold;">Diunsolo RentaCar</a>
      </div>
    </div>
  `;
};

//Email verification sender
const sendVerificationEmail = async (email, name, lastName, verificationCode, res) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.email_user,
        pass: config.email.email_pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    //Mail options/Template
    const mailOptions = {
      from: config.email.email_user,
      to: email,
      subject: "Verificación de correo - Código de activación | Diunsolo RentaCar",
      html: HTMLVerifyAccountEmail(verificationCode, name, lastName),
    };

    //Sending
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).json({ message: "Error al enviar el correo de verificación" });
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

//Export
export { HTMLVerifyAccountEmail , sendVerificationEmail};
