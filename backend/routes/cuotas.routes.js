const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requireRol } = require('../middleware/auth');
const { idValido } = require('../middleware/validaciones');
const { enviarCorreo } = require('../utils/mailer');

// GET /api/cuotas/mias -> cuotas del jugador logueado
router.get('/mias', verificarToken, requireRol('jugador'), async (req, res) => {
  try {
    const jugador = await pool.query('SELECT id_jugador FROM jugador WHERE id_usuario = $1', [req.usuario.id_usuario]);
    if (jugador.rows.length === 0) return res.json([]);

    const resultado = await pool.query(
      'SELECT * FROM cuota WHERE id_jugador = $1 ORDER BY anio DESC, mes DESC',
      [jugador.rows[0].id_jugador]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las cuotas.' });
  }
});

// POST /api/cuotas/generar -> crea (o devuelve) la cuota del mes actual para el jugador logueado
router.post('/generar', verificarToken, requireRol('jugador'), async (req, res) => {
  try {
    const { monto } = req.body;
    const jugador = await pool.query('SELECT id_jugador FROM jugador WHERE id_usuario = $1', [req.usuario.id_usuario]);
    if (jugador.rows.length === 0) return res.status(400).json({ error: 'No es un jugador registrado.' });

    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();

    const existente = await pool.query(
      'SELECT * FROM cuota WHERE id_jugador=$1 AND mes=$2 AND anio=$3',
      [jugador.rows[0].id_jugador, mes, anio]
    );
    if (existente.rows.length > 0) return res.json(existente.rows[0]);

    const nueva = await pool.query(
      `INSERT INTO cuota (id_jugador, mes, anio, monto) VALUES ($1,$2,$3,$4) RETURNING *`,
      [jugador.rows[0].id_jugador, mes, anio, monto || 15000]
    );
    res.status(201).json(nueva.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la cuota.' });
  }
});

// POST /api/cuotas/:id/pagar -> simula el pago (Caso de Uso 2, paso 5-6)
router.post('/:id/pagar', verificarToken, requireRol('jugador'), async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'ID de cuota inválido.' });
    }
    const { metodo_pago } = req.body;

    // Verificar que la cuota existe y pertenece al jugador logueado
    const jugador = await pool.query('SELECT id_jugador FROM jugador WHERE id_usuario = $1', [req.usuario.id_usuario]);
    if (jugador.rows.length === 0) {
      return res.status(400).json({ error: 'No es un jugador registrado.' });
    }

    const cuota = await pool.query('SELECT * FROM cuota WHERE id_cuota = $1', [req.params.id]);
    if (cuota.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada.' });
    }

    // IDOR fix: verificar que la cuota pertenece al jugador logueado
    if (cuota.rows[0].id_jugador !== jugador.rows[0].id_jugador) {
      return res.status(403).json({ error: 'No tiene permiso para pagar esta cuota.' });
    }

    if (cuota.rows[0].estado === 'pagada') {
      return res.status(400).json({ error: 'Esta cuota ya fue pagada.' });
    }

    // Simulación de procesamiento del pago
    const pagoExitoso = true;

    if (!pagoExitoso) {
      return res.status(402).json({ error: 'El medio de pago fue rechazado. Intente con otro método.' });
    }

    const actualizada = await pool.query(
      `UPDATE cuota SET estado = 'pagada', fecha_pago = NOW() WHERE id_cuota = $1 RETURNING *`,
      [req.params.id]
    );

    // Envío del comprobante por correo (requiere EMAIL_USER/EMAIL_PASS configurados)
    try {
      await enviarCorreo(
        req.usuario.email,
        'Comprobante de pago - Cuota Club de Voley',
        `Hola ${req.usuario.nombre},\n\nRegistramos tu pago de la cuota ${actualizada.rows[0].mes}/${actualizada.rows[0].anio} por $${actualizada.rows[0].monto} usando ${metodo_pago || 'medio de pago registrado'}.\n\n¡Gracias por formar parte del club!`
      );
    } catch (err) {
      console.warn('No se pudo enviar el comprobante por correo:', err.message);
    }

    res.json({ mensaje: 'Pago procesado correctamente.', cuota: actualizada.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el pago.' });
  }
});

module.exports = router;
