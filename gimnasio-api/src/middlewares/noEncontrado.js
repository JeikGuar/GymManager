// Se registra después de todas las rutas: si ninguna respondió, es un 404.
export function noEncontrado(req, res) {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
}
