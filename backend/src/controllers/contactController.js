import nodemailer from 'nodemailer';

export const sendContactEmail = async (req, res) => {
  const { nombre, telefono, email, mensaje } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"${nombre}" <${email}>`,
    to: 'expo.diunsolo@gmail.com',
    subject: 'Nuevo mensaje de contacto',
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong><br/>${mensaje}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ ok: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al enviar el correo', error });
  }
};