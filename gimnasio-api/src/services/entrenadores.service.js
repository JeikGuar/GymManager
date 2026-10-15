// src/services/entrenadores.service.js
// Capa de negocio: reglas del dominio. NO conoce req, res ni códigos HTTP.
import { prisma } from '../db.js';
import { conflicto, datosInvalidos, noEncontrado } from '../errores.js';

async function validarUnicos({ documentoIdentidad, correo }, idActual) {
  if (documentoIdentidad) {
    const existe = await prisma.entrenador.findUnique({ where: { documentoIdentidad } });
    if (existe && existe.id !== idActual) throw conflicto(`Ya existe un entrenador con el documento ${documentoIdentidad}`);
  }
  if (correo) {
    const existe = await prisma.entrenador.findUnique({ where: { correo } });
    if (existe && existe.id !== idActual) throw conflicto(`Ya existe un entrenador con el correo ${correo}`);
  }
}

// Regla de negocio: no se puede contratar a alguien en el futuro
function convertirFecha(fechaContratacion) {
  if (fechaContratacion === undefined) return undefined;
  const fecha = new Date(fechaContratacion);
  if (fecha > new Date()) throw datosInvalidos('La fechaContratacion no puede ser una fecha futura');
  return fecha;
}

// GET /api/entrenadores?especialidad=yoga&estadoContrato=ACTIVO
export function listar({ especialidad, estadoContrato } = {}) {
  return prisma.entrenador.findMany({
    where: {
      estadoContrato,
      especialidad: especialidad ? { contains: especialidad, mode: 'insensitive' } : undefined,
    },
    orderBy: { id: 'asc' },
  });
}

export async function buscarPorId(id) {
  const entrenador = await prisma.entrenador.findUnique({ where: { id } });
  if (!entrenador) throw noEncontrado(`No existe un entrenador con id ${id}`);
  return entrenador;
}

export async function crear(datos) {
  const { nombre, documentoIdentidad, correo, telefono, estado, especialidad, estadoContrato } = datos;
  const fechaContratacion = convertirFecha(datos.fechaContratacion);
  await validarUnicos({ documentoIdentidad, correo });
  return prisma.entrenador.create({
    data: { nombre, documentoIdentidad, correo, telefono, estado, especialidad, fechaContratacion, estadoContrato },
  });
}

export async function actualizar(id, datos) {
  const { nombre, documentoIdentidad, correo, telefono, estado, especialidad, estadoContrato } = datos;
  await buscarPorId(id);
  const fechaContratacion = convertirFecha(datos.fechaContratacion);
  await validarUnicos({ documentoIdentidad, correo }, id);
  return prisma.entrenador.update({
    where: { id },
    data: { nombre, documentoIdentidad, correo, telefono, estado, especialidad, fechaContratacion, estadoContrato },
  });
}

export async function eliminar(id) {
  await buscarPorId(id);
  await prisma.entrenador.delete({ where: { id } });
}
