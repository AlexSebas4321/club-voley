const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requireRol } = require('../middleware/auth');
const { idValido } = require('../middleware/validaciones');

// GET /api/equipos/categorias -> pública
router.get('/categorias', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM categoria ORDER BY id_categoria');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las categorías.' });
  }
});

// POST /api/equipos/categorias (solo administrador)
router.post('/categorias', verificarToken, requireRol('administrador'), async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
    }
    const resultado = await pool.query(
      'INSERT INTO categoria (nombre, descripcion) VALUES ($1,$2) RETURNING *',
      [nombre, descripcion || null]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la categoría.' });
  }
});

// GET /api/equipos -> pública, incluye nombre de categoría y DT
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT e.*, c.nombre AS nombre_categoria, u.nombre AS nombre_director
      FROM equipo e
      LEFT JOIN categoria c ON e.id_categoria = c.id_categoria
      LEFT JOIN usuario u ON e.id_director_tecnico = u.id_usuario
      ORDER BY e.id_equipo`);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los equipos.' });
  }
});

// POST /api/equipos (solo administrador)
router.post('/', verificarToken, requireRol('administrador'), async (req, res) => {
  try {
    const { id_categoria, id_director_tecnico, nombre_equipo, descripcion } = req.body;
    if (!nombre_equipo) {
      return res.status(400).json({ error: 'El nombre del equipo es obligatorio.' });
    }
    const resultado = await pool.query(
      `INSERT INTO equipo (id_categoria, id_director_tecnico, nombre_equipo, descripcion)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [id_categoria || null, id_director_tecnico || null, nombre_equipo, descripcion || null]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el equipo.' });
  }
});

// PUT /api/equipos/:id (administrador o el propio director técnico asignado)
router.put('/:id', verificarToken, requireRol('administrador', 'director_tecnico'), async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    const { nombre_equipo, descripcion } = req.body;
    const resultado = await pool.query(
      `UPDATE equipo SET nombre_equipo = COALESCE($1, nombre_equipo), descripcion = COALESCE($2, descripcion)
       WHERE id_equipo = $3 RETURNING *`,
      [nombre_equipo, descripcion, req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado.' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el equipo.' });
  }
});

module.exports = router;
