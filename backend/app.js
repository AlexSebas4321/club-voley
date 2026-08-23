const express = require('express');
const cors = require('cors');
const path = require('path');
const { rateLimit } = require('express-rate-limit');
require('dotenv').config();

const app = express();

// CORS restringido: mismo origen en producción + orígenes de desarrollo.
// CORS_ORIGINS permite agregar dominios extra separados por coma (ej: la URL de Vercel)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5501',
    'http://127.0.0.1:5501',
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : []),
  ],
};

app.use(cors(corsOptions));
app.use(express.json());

// Limita intentos de login/registro para dificultar la fuerza bruta
// (en serverless el contador es por instancia; suficiente como primera barrera)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Esperá 15 minutos y volvé a probar.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Archivos estáticos del frontend (solo se usa corriendo local con node server.js;
// en Vercel los archivos estáticos los sirve el CDN según vercel.json)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rutas API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/equipos', require('./routes/equipos.routes'));
app.use('/api/horarios', require('./routes/horarios.routes'));
app.use('/api/noticias', require('./routes/noticias.routes'));
app.use('/api/partidos', require('./routes/partidos.routes'));
app.use('/api/cuotas', require('./routes/cuotas.routes'));
app.use('/api/mensajes', require('./routes/mensajes.routes'));

// SPA fallback: rutas de API desconocidas devuelven 404 JSON; el resto, index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Ruta de API no encontrada.' });
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

module.exports = app;
