import nodemailer from 'nodemailer';

async function sendContactoMail({ nombre, correo, telefono, mensaje }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: 'DIUNSOLO Renta Car <no-reply@diunsolo.com>',
    to: process.env.EMAIL_USER,
    subject: 'Nuevo mensaje de contacto desde DIUNSOLO Renta Car',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;">
        <h2 style="color:#7c3aed;">Mensaje de Contacto</h2>
        <p><b>Enviado por:</b> ${nombre}</p>
        <p><b>Correo:</b> ${correo}</p>
        <p><b>Teléfono:</b> ${telefono}</p>
        <p><b>Mensaje:</b></p>
        <div style="background:#f4f4f4;padding:12px 16px;border-radius:6px;margin-bottom:1rem;">
          ${mensaje}
        </div>
        <p>Responder a: <a href="mailto:${correo}">${correo}</a></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

export default sendContactoMail;