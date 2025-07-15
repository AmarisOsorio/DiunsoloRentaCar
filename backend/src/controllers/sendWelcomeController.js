import sendWelcomeMail from '../utils/mailWelcome.js';

/*
// POST /api/send-welcome
async function sendWelcome(req, res) {
  const { correo, nombre } = req.body;
  if (!correo) return res.status(400).json({ error: 'Correo requerido' });
  try {
    await sendWelcomeMail({ correo, nombre });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo enviar el correo de bienvenida' });
  }
}
*/

//Send email
export const sendWelcome = async (req, res) => {
  const {correo, nombre} = req.body;

  //Request data
  try {
    await sendWelcomeMail({
      correo, 
      nombre
    });

    //OK
    res.status(200).json({ok: true, message: "Correo de bienvenida enviado exitosamente"})
  } 
  catch (error) {
    //Failure
    res.status(500).json({ok: false, message: "Error al enviar correo de bienvenida:" + error})
    
  }
};

export default sendWelcome;