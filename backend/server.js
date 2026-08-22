// Punto de entrada para desarrollo local (npm start / npm run dev).
// En producción (Vercel) la misma app se exporta desde backend/app.js
// y Vercel la monta como función serverless vía api/index.js.
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor del Club de Voley corriendo en http://localhost:${PORT}`);
});

function cerrarServidor(senal) {
  console.log(`${senal} recibido. Cerrando servidor...`);
  server.close(() => {
    const pool = require('./db');
    pool.end(() => {
      console.log('Pool de conexiones cerrado.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => cerrarServidor('SIGTERM'));
process.on('SIGINT', () => cerrarServidor('SIGINT'));
