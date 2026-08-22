const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requireRol } = require('../middleware/auth');
const { idValido } = require('../middleware/validaciones');
const { enviarCorreo } = require('../utils/mailer');

/**
 * GET /api/mensajes/destinatarios
 * Devuelve la lista de posibles destinatarios agrupados,
 * para que el panel arme el selector (por rol, por equipo o individual).
 */
router.get('/destinatarios', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    const usuarios = await pool.query(
      `SELECT id_usuario, nombre, email, rol FROM usuario ORDER BY rol, nombre`
    );
    const equipos = await pool.query(`SELECT id_equipo, nombre_equipo FROM equipo ORDER BY nombre_equipo`);
    res.json({ usuarios: usuarios.rows, equipos: equipos.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los destinatarios.' });
  }
});

/**
 * POST /api/mensajes/enviar
 * body: {
 *   destino: 'todos' | 'jugadores' | 'directores' | 'equipo' | 'individual',
 *   id_equipo?: number,        // requerido si destino === 'equipo'
 *   id_usuario?: number,       // requerido si destino === 'individual'
 *   asunto: string,
 *   cuerpo: string
 * }
 * Envía el correo por Gmail a cada destinatario resuelto y deja registro en la tabla "mensaje".
 */
router.post('/enviar', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    const { destino, id_equipo, id_usuario, asunto, cuerpo } = req.body;
    if (!destino || !asunto || !cuerpo) {
      return res.status(400).json({ error: 'Destino, asunto y cuerpo son obligatorios.' });
    }
    if ((destino === 'individual' && !idValido(id_usuario)) || (destino === 'equipo' && !idValido(id_equipo))) {
      return res.status(400).json({ error: 'ID de destinatario o equipo inválido.' });
    }

    let destinatarios = [];

    if (destino === 'individual') {
      const r = await pool.query('SELECT id_usuario, nombre, email, rol FROM usuario WHERE id_usuario = $1', [id_usuario]);
      destinatarios = r.rows;
    } else if (destino === 'jugadores') {
      const r = await pool.query(`SELECT id_usuario, nombre, email, rol FROM usuario WHERE rol = 'jugador'`);
      destinatarios = r.rows;
    } else if (destino === 'directores') {
      const r = await pool.query(`SELECT id_usuario, nombre, email, rol FROM usuario WHERE rol = 'director_tecnico'`);
      destinatarios = r.rows;
    } else if (destino === 'equipo') {
      const r = await pool.query(
        `SELECT u.id_usuario, u.nombre, u.email, u.rol
         FROM jugador j JOIN usuario u ON j.id_usuario = u.id_usuario
         WHERE j.id_equipo = $1`,
        [id_equipo]
      );
      destinatarios = r.rows;
    } else if (destino === 'todos') {
      const r = await pool.query(`SELECT id_usuario, nombre, email, rol FROM usuario`);
      destinatarios = r.rows;
    } else {
      return res.status(400).json({ error: 'Valor de "destino" no reconocido.' });
    }

    if (destinatarios.length === 0) {
      return res.status(404).json({ error: 'No se encontraron destinatarios para ese criterio.' });
    }

    const resultados = [];
    for (const persona of destinatarios) {
      let estado = 'enviado';
      try {
        await enviarCorreo(persona.email, asunto, `Hola ${persona.nombre},\n\n${cuerpo}`);
      } catch (err) {
        console.error(`Error enviando correo a ${persona.email}:`, err.message);
        estado = 'error';
      }

      await pool.query(
        `INSERT INTO mensaje (id_remitente, destinatario_email, destinatario_rol, asunto, cuerpo, estado_envio)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.usuario.id_usuario, persona.email, persona.rol, asunto, cuerpo, estado]
      );

      resultados.push({ email: persona.email, estado });
    }

    res.json({
      mensaje: `Envío procesado para ${destinatarios.length} destinatario(s).`,
      resultados,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar los mensajes. Verifique la configuración de Gmail en el .env' });
  }
});

/**
 * GET /api/mensajes/historial -> últimos mensajes enviados (auditoría, director/admin)
 */
router.get('/historial', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT m.*, u.nombre AS remitente
      FROM mensaje m
      LEFT JOIN usuario u ON m.id_remitente = u.id_usuario
      ORDER BY m.fecha_envio DESC
      LIMIT 100`);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el historial de mensajes.' });
  }
});

module.exports = router;
