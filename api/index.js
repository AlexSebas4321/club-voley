// Función serverless de Vercel: monta la misma app Express del backend.
// Las rutas estáticas las resuelve el CDN según vercel.json; todo lo que
// empieza con /api llega acá.
const app = require('../backend/app');

module.exports = app;
