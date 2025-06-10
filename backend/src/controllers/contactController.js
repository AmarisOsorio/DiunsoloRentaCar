import sendContactoMail from '../utils/mailContact.js';

export const sendContactEmail = async (req, res) => {
  const { nombre, telefono, email, mensaje } = req.body;

  try {
    await sendContactoMail({
      nombre,
      correo: email,
      telefono,
      mensaje
    });
    res.status(200).json({ ok: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al enviar el correo: ', error });
  }
};