const nodemailer = require('nodemailer');
require('dotenv').config();

// Transportador configurado para usar una cuenta de Gmail.
// Requiere EMAIL_USER y EMAIL_PASS (contraseña de aplicación) en el .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía un correo electrónico.
 * @param {string} destinatario - email del destinatario
 * @param {string} asunto
 * @param {string} textoHtml - cuerpo del mensaje (se admite HTML simple)
 */
async function enviarCorreo(destinatario, asunto, textoHtml) {
  const info = await transporter.sendMail({
    from: `"Club de Voley" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: asunto,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1c1c1c">
             ${textoHtml.replace(/\n/g, '<br>')}
             <hr style="margin-top:20px;border:none;border-top:1px solid #ddd">
             <p style="color:#888;font-size:12px">Mensaje enviado automáticamente desde el sitio web del Club de Voley.</p>
           </div>`,
  });
  return info;
}

module.exports = { enviarCorreo };
