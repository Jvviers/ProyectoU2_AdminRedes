const { pool } = require('../config/database');
const nodemailer = require('nodemailer');

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

module.exports = (notificationsSentCounter) => {
  // Lógica para enviar una notificación
  const sendNotification = async (req, res) => {
      const { user_id, type, subject, message } = req.body;

      if (!user_id || !type || !message) {
          return res.status(400).json({ error: 'user_id, type y message son campos requeridos.' });
      }

      let notificationId;
      try {
          // 1. Guardar la notificación en la base de datos con estado 'pendiente'
          const result = await pool.query(
              'INSERT INTO notificaciones (usuario_id, tipo, asunto, mensaje, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id',
              [user_id, type, subject, message, 'pendiente']
          );
          notificationId = result.rows[0].id;

          // 2. Si es de tipo 'email', intentar enviarla
          if (type === 'email') {
              // Obtener el email del usuario
              const userResult = await pool.query('SELECT email FROM usuarios WHERE id = $1', [user_id]);
              if (userResult.rows.length === 0) {
                  await pool.query('UPDATE notificaciones SET estado = $1 WHERE id = $2', ['fallido', notificationId]);
                  return res.status(404).json({ error: 'Usuario no encontrado.' });
              }
              const userEmail = userResult.rows[0].email;

              const mailOptions = {
                  from: process.env.SMTP_USER,
                  to: userEmail,
                  subject: subject || 'Notificación Importante',
                  html: `<p>${message}</p>`,
              };

              await transporter.sendMail(mailOptions);
              await pool.query('UPDATE notificaciones SET estado = $1, fecha_envio = NOW() WHERE id = $2', ['enviado', notificationId]);
              console.log(`✅ Notificación por email enviada a ${userEmail}`);
          } else {
              // Para otros tipos (sms, push), simplemente marcar como enviado si no hay un sistema de envío real
              await pool.query('UPDATE notificaciones SET estado = $1, fecha_envio = NOW() WHERE id = $2', ['enviado', notificationId]);
          }

          notificationsSentCounter.inc(); // Increment the counter

          res.status(200).json({ message: 'Notificación procesada', notificationId });

      } catch (error) {
          console.error('Error al enviar notificación:', error);
          // Si la notificación ya se insertó, actualizar su estado a 'fallido'
          if (notificationId) {
              await pool.query('UPDATE notificaciones SET estado = $1 WHERE id = $2', ['fallido', notificationId]);
          }
          res.status(500).json({ error: 'Error interno del servidor al procesar la notificación' });
      }
  };

  // Lógica para obtener el estado de una notificación
  const getNotificationStatus = async (req, res) => {
      const { id } = req.params;
      try {
          const result = await pool.query('SELECT * FROM notificaciones WHERE id = $1', [id]);
          if (result.rows.length === 0) {
              return res.status(404).json({ error: 'Notificación no encontrada.' });
          }
          res.status(200).json(result.rows[0]);
      } catch (error) {
          console.error('Error al obtener estado de notificación:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
      }
  };

  return { sendNotification, getNotificationStatus };
};
