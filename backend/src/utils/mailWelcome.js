import nodemailer from 'nodemailer';

async function sendWelcomeMail({ correo, nombre }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // O tu proveedor
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const mailOptions = {
    from: 'DIUNSOLO Renta Car <no-reply@diunsolo.com>',
    to: correo,
    subject: '¡Bienvenido a DIUNSOLO renta car! Tu Cuenta ha sido verificada.',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;">
        <h2 style="color:#7c3aed;">¡Bienvenido a DIUNSOLO Renta Car!</h2>
        <p>Hola${nombre ? ' ' + nombre : ''}, tu cuenta ya está activa y lista para usar.</p>
        <p><b>¿Listo para tu primer viaje?</b></p>
        <a href="https://diunsolo.com/catalogo" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Ir al Catálogo</a>
        <ul style="margin-top:1.2rem;">
          <li>Amplia selección de vehículos</li>
          <li>Precios competitivos</li>
          <li>Atención personalizada</li>
        </ul>
        <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@diunsolo.com">soporte@diunsolo.com</a></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

export default sendWelcomeMail;
