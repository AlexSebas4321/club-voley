const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// Verifica que exista un token JWT válido en el header Authorization
// y revalida el usuario contra la base de datos (si fue eliminado o
// le cambiaron el rol, pierde el acceso al instante, no recién a las 8h)
async function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado. Inicie sesión.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    try {
      const resultado = await pool.query(
        'SELECT id_usuario, nombre, email, rol FROM usuario WHERE id_usuario = $1',
        [payload.id_usuario]
      );
      if (resultado.rows.length === 0) {
        return res.status(403).json({ error: 'El usuario ya no existe.' });
      }
      req.usuario = resultado.rows[0]; // { id_usuario, nombre, email, rol } siempre vigente
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al validar la sesión.' });
    }
  });
}

// Middleware factory: permite el acceso solo a ciertos roles
// Uso: requireRol('administrador'), requireRol('administrador', 'director_tecnico')
function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tiene permisos para realizar esta acción.' });
    }
    next();
  };
}

module.exports = { verificarToken, requireRol };
