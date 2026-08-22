const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requireRol } = require('../middleware/auth');
const { idValido } = require('../middleware/validaciones');

// GET /api/horarios -> pública (todos los horarios, sección "Horarios")
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT h.*, e.nombre_equipo
      FROM horario h
      JOIN equipo e ON h.id_equipo = e.id_equipo
      ORDER BY e.nombre_equipo, h.dia`);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los horarios.' });
  }
});

// GET /api/horarios/mi-equipo -> horarios del equipo del jugador logueado (Caso de Uso 1)
router.get('/mi-equipo', verificarToken, requireRol('jugador'), async (req, res) => {
  try {
    const jugador = await pool.query('SELECT id_equipo FROM jugador WHERE id_usuario = $1', [req.usuario.id_usuario]);
    if (jugador.rows.length === 0 || !jugador.rows[0].id_equipo) {
      return res.json({ mensaje: 'Aún no está asignado a ningún equipo.', horarios: [] });
    }
    const resultado = await pool.query('SELECT * FROM horario WHERE id_equipo = $1 ORDER BY dia', [jugador.rows[0].id_equipo]);
    res.json({ horarios: resultado.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los horarios del equipo.' });
  }
});

// POST /api/horarios (director técnico o administrador)
router.post('/', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    const { id_equipo, dia, hora_inicio, hora_fin, lugar } = req.body;
    if (!id_equipo || !dia || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: 'Equipo, día, hora de inicio y hora de fin son obligatorios.' });
    }
    const resultado = await pool.query(
      `INSERT INTO horario (id_equipo, dia, hora_inicio, hora_fin, lugar)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_equipo, dia, hora_inicio, hora_fin, lugar || null]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el horario.' });
  }
});

// DELETE /api/horarios/:id (director técnico o administrador)
router.delete('/:id', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    const resultado = await pool.query('DELETE FROM horario WHERE id_horario = $1 RETURNING *', [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado.' });
    }
    res.json({ mensaje: 'Horario eliminado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el horario.' });
  }
});

module.exports = router;
