const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones a PostgreSQL (usado por todas las rutas)
// En Supabase hay que activar DB_SSL=true en las variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: Number(process.env.DB_POOL_MAX || 10),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

pool.on('connect', () => {
  console.log('🟢 Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('🔴 Error inesperado en el pool de PostgreSQL', err);
});

module.exports = pool;
