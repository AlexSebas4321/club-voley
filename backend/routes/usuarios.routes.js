const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const { verificarToken, requireRol } = require('../middleware/auth');
const { idValido } = require('../middleware/validaciones');

// GET /api/usuarios -> lista completa (solo administrador)
router.get('/', verificarToken, requireRol('administrador'), async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id_usuario, nombre, email, rol, fecha_alta FROM usuario ORDER BY id_usuario`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
});

// POST /api/usuarios -> crear un usuario con cualquier rol (solo administrador)
router.post('/', verificarToken, requireRol('administrador'), async (req, res) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;
    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }
    if (!['jugador', 'director_tecnico', 'administrador'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido.' });
    }
    const hash = await bcrypt.hash(contrasena, 10);
    const resultado = await pool.query(
      `INSERT INTO usuario (nombre, email, contrasena, rol)
       VALUES ($1,$2,$3,$4) RETURNING id_usuario, nombre, email, rol`,
      [nombre, email, hash, rol]
    );
    if (rol === 'jugador') {
      await pool.query(`INSERT INTO jugador (id_usuario) VALUES ($1)`, [resultado.rows[0].id_usuario]);
    }
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
    }
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
});

// PUT /api/usuarios/:id -> editar nombre / rol (solo administrador)
router.put('/:id', verificarToken, requireRol('administrador'), async (req, res) => {
  try {
    const { nombre, rol } = req.body;
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    if (rol !== undefined && !['jugador', 'director_tecnico', 'administrador'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido.' });
    }
    const resultado = await pool.query(
      `UPDATE usuario SET nombre = COALESCE($1, nombre), rol = COALESCE($2, rol)
       WHERE id_usuario = $3 RETURNING id_usuario, nombre, email, rol`,
      [nombre, rol, req.params.id]
    );
    if (resultado.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
});

// DELETE /api/usuarios/:id (solo administrador)
router.delete('/:id', verificarToken, requireRol('administrador'), async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    const resultado = await pool.query('DELETE FROM usuario WHERE id_usuario = $1 RETURNING *', [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ mensaje: 'Usuario eliminado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
});

module.exports = router;
