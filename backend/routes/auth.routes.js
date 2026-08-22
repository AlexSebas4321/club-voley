const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verificarToken } = require('../middleware/auth');
require('dotenv').config();

// POST /api/auth/register  -> alta pública de un Jugador (rol fijo "jugador")
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, contrasena, fecha_nacimiento, posicion } = req.body;
    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }

    const existe = await pool.query('SELECT id_usuario FROM usuario WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuario (nombre, email, contrasena, rol)
       VALUES ($1, $2, $3, 'jugador') RETURNING id_usuario, nombre, email, rol`,
      [nombre, email, hash]
    );

    const usuario = nuevoUsuario.rows[0];

    // Se crea también el registro en la tabla jugador (HU04 - inscribirse)
    await pool.query(
      `INSERT INTO jugador (id_usuario, fecha_nacimiento, posicion) VALUES ($1, $2, $3)`,
      [usuario.id_usuario, fecha_nacimiento || null, posicion || null]
    );

    res.status(201).json({ mensaje: 'Registro exitoso. Ya puede iniciar sesión.', usuario });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
    }
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    const resultado = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const usuario = resultado.rows[0];
    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const payload = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, usuario: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// GET /api/auth/me -> datos del usuario logueado (para redirigir según rol)
router.get('/me', verificarToken, (req, res) => {
  res.json(req.usuario);
});

module.exports = router;
