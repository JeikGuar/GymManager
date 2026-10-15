// src/middlewares/errores.js — EL middleware de errores (4 parámetros)
import { ErrorHttp } from '../errores.js';

// eslint-disable-next-line no-unused-vars
export function manejadorErrores(err, req, res, next) {
  // Errores esperados del dominio → su código y su mensaje
  if (err instanceof ErrorHttp) {
    return res.status(err.codigo).json({ error: err.message });
  }
  // Body con JSON mal escrito (lo detecta express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  // Última línea de defensa: la base rechazó un valor repetido (índice @unique)
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor único' });
  }
  // Errores inesperados → log completo para nosotros, 500 genérico para el cliente
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
