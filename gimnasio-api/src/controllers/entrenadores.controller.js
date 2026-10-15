// src/controllers/entrenadores.controller.js
// Capa de presentación: traduce HTTP ↔ negocio.
// El service devuelve promesas → async/await + next(error).
// Los 404 y 409 los lanza el service; el middleware de errores los responde.
import * as servicio from '../services/entrenadores.service.js';

export async function listar(req, res, next) {
  try {
    const entrenadores = await servicio.listar({
      especialidad: req.query.especialidad,
      estadoContrato: req.query.estadoContrato,
    });
    res.json(entrenadores);
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    const entrenador = await servicio.buscarPorId(Number(req.params.id));
    res.json(entrenador);
  } catch (error) {
    next(error); // el 404 lo lanza el service
  }
}

export async function crear(req, res, next) {
  try {
    const nuevo = await servicio.crear(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req, res, next) {
  try {
    const entrenador = await servicio.actualizar(Number(req.params.id), req.body);
    res.json(entrenador);
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req, res, next) {
  try {
    await servicio.eliminar(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
