const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requireRol } = require('../middleware/auth');
const { idValido } = require('../middleware/validaciones');

// GET /api/noticias -> pública, solo publicadas, la más nueva primero
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT n.*, u.nombre AS autor
      FROM noticia n
      LEFT JOIN usuario u ON n.id_usuario = u.id_usuario
      WHERE n.estado = 'publicada'
      ORDER BY n.fecha_publicacion DESC, n.id_noticia DESC`);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las noticias.' });
  }
});

// GET /api/noticias/todas -> incluye borradores (director técnico / administrador)
router.get('/todas', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT n.*, u.nombre AS autor FROM noticia n
      LEFT JOIN usuario u ON n.id_usuario = u.id_usuario
      ORDER BY n.id_noticia DESC`);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las noticias.' });
  }
});

// POST /api/noticias (director técnico o administrador) - Caso de Uso 3
router.post('/', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    const { titulo, contenido, imagen_url, estado } = req.body;
    if (!titulo || !contenido) {
      return res.status(400).json({ error: 'Título y contenido son obligatorios.' });
    }
    const resultado = await pool.query(
      `INSERT INTO noticia (id_usuario, titulo, contenido, imagen_url, estado)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.usuario.id_usuario, titulo, contenido, imagen_url || null, estado || 'publicada']
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la noticia.' });
  }
});

// PUT /api/noticias/:id (director técnico o administrador)
router.put('/:id', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    const { titulo, contenido, imagen_url, estado } = req.body;
    const resultado = await pool.query(
      `UPDATE noticia SET titulo = COALESCE($1,titulo), contenido = COALESCE($2,contenido),
         imagen_url = COALESCE($3,imagen_url), estado = COALESCE($4,estado)
       WHERE id_noticia = $5 RETURNING *`,
      [titulo, contenido, imagen_url, estado, req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada.' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la noticia.' });
  }
});

// DELETE /api/noticias/:id (director técnico o administrador)
router.delete('/:id', verificarToken, requireRol('director_tecnico', 'administrador'), async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    const resultado = await pool.query('DELETE FROM noticia WHERE id_noticia = $1 RETURNING *', [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada.' });
    }
    res.json({ mensaje: 'Noticia eliminada.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la noticia.' });
  }
});

module.exports = router;
