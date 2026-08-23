// TEMPORAL para diagnosticar el despliegue. Se elimina cuando todo funcione.
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const claves = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_SSL', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
  const variables = {};
  for (const k of claves) {
    variables[k] = process.env[k] ? '✅ presente' : '❌ FALTA';
  }
  variables.DB_HOST_valor = process.env.DB_HOST || '(vacío)';
  variables.DB_PORT_valor = process.env.DB_PORT || '(vacío)';
  variables.DB_USER_valor = process.env.DB_USER || '(vacío)';
  variables.DB_NAME_valor = process.env.DB_NAME || '(vacío)';
  variables.DB_SSL_valor = process.env.DB_SSL || '(vacío)';

  const resultado = { variables };

  try {
    await pool.query('SELECT 1');
    resultado.conexion = '✅ PostgreSQL conecta';
    try {
      const r = await pool.query('SELECT COUNT(*)::int AS n FROM usuario');
      resultado.tabla_usuario = `✅ existe (${r.rows[0].n} usuarios)`;
      try {
        const n = await pool.query('SELECT COUNT(*)::int AS n FROM noticia');
        resultado.tabla_noticia = `✅ existe (${n.rows[0].n} noticias)`;
      } catch (e2) {
        resultado.tabla_noticia = '❌ ' + e2.message;
      }
    } catch (e1) {
      resultado.tabla_usuario = '❌ ' + e1.message;
    }
  } catch (e) {
    resultado.conexion = '❌ ' + e.message;
  }

  res.json(resultado);
});

module.exports = router;
