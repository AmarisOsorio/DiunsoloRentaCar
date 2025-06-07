import sendWelcomeMail from '../utils/mailWelcome.js';

// POST /api/send-welcome
async function sendWelcomeController(req, res) {
  const { correo, nombre } = req.body;
  if (!correo) return res.status(400).json({ error: 'Correo requerido' });
  try {
    await sendWelcomeMail({ correo, nombre });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo enviar el correo de bienvenida' });
  }
}

export default sendWelcomeController;
