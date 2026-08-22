// Valida que un valor (normalmente req.params.id o un id del body)
// sea un entero positivo; evita errores 500 de PostgreSQL con IDs malformados
function idValido(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0;
}

module.exports = { idValido };
