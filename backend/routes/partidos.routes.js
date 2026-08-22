const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requireRol } = require('../middleware/auth');
const { idValido } = require('../middleware/validaciones');

// GET /api/partidos -> pública, todos los resultados
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT p.*, e.nombre_equipo
      FROM partido p
      JOIN equipo e ON p.id_equipo = e.id_equipo
      ORDER BY p.fecha DESC`);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los partidos.' });
  }
});

// GET /api/partidos/equipo/:id_equipo -> resultados de un equipo puntual
router.get('/equipo/:id_equipo', async (req, res) => {
  try {
    if (!idValido(req.params.id_equipo)) {
      return res.status(400).json({ error: 'ID de equipo inválido.' });
    }
    const resultado = await pool.query(
      'SELECT * FROM partido WHERE id_equipo = $1 ORDER BY fecha DESC',
      [req.params.id_equipo]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los partidos del equipo.' });
  }
});

// POST /api/partidos (director técnico o administrador)
router.post('/', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    const { id_equipo, rival, fecha, resultado } = req.body;
    if (!id_equipo || !rival || !fecha) {
      return res.status(400).json({ error: 'Equipo, rival y fecha son obligatorios.' });
    }
    const query = await pool.query(
      `INSERT INTO partido (id_equipo, rival, fecha, resultado) VALUES ($1,$2,$3,$4) RETURNING *`,
      [id_equipo, rival, fecha, resultado || null]
    );
    res.status(201).json(query.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el partido.' });
  }
});

// PUT /api/partidos/:id -> cargar/actualizar el resultado de un partido
router.put('/:id', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    const { resultado, fecha, rival } = req.body;
    const query = await pool.query(
      `UPDATE partido SET resultado = COALESCE($1,resultado), fecha = COALESCE($2,fecha), rival = COALESCE($3,rival)
       WHERE id_partido = $4 RETURNING *`,
      [resultado, fecha, rival, req.params.id]
    );
    if (query.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado.' });
    }
    res.json(query.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el partido.' });
  }
});

module.exports = router;
