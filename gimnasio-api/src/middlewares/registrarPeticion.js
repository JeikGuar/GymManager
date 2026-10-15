// Middleware propio: guarda la hora en que llegó la petición y, cuando termina,
// muestra en consola cuánto tardó en responder.
export function registrarPeticion(req, res, next) {
  const inicio = Date.now();
  req.fechaPeticion = new Date();
  res.setHeader('X-Hora-Peticion', req.fechaPeticion.toISOString());

  res.on('finish', () => {
    console.log(`[gimnasio] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio} ms)`);
  });

  next(); // sin next() la petición se quedaría "colgada"
}
