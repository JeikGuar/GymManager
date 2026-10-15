// src/services/planes.service.js
// Capa de negocio: reglas del dominio. NO conoce req, res ni códigos HTTP.
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

// El nombre del plan no se puede repetir, sin importar mayúsculas
async function validarNombre(nombre, idActual) {
  if (!nombre) return;
  const existe = await prisma.plan.findFirst({
    where: { nombre: { equals: nombre, mode: 'insensitive' } },
  });
  if (existe && existe.id !== idActual) throw conflicto(`Ya existe un plan llamado "${nombre}"`);
}

// GET /api/planes?precioMax=250000&duracionMin=30
export function listar({ precioMax, duracionMin } = {}) {
  return prisma.plan.findMany({
    where: {
      precio: precioMax !== undefined ? { lte: precioMax } : undefined,
      duracionDias: duracionMin !== undefined ? { gte: duracionMin } : undefined,
    },
    orderBy: { precio: 'asc' },
  });
}

export async function buscarPorId(id) {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) throw noEncontrado(`No existe un plan con id ${id}`);
  return plan;
}

export async function crear({ nombre, descripcion, duracionDias, precio, beneficios }) {
  await validarNombre(nombre);
  return prisma.plan.create({ data: { nombre, descripcion, duracionDias, precio, beneficios } });
}

export async function actualizar(id, { nombre, descripcion, duracionDias, precio, beneficios }) {
  await buscarPorId(id);
  await validarNombre(nombre, id);
  return prisma.plan.update({
    where: { id },
    data: { nombre, descripcion, duracionDias, precio, beneficios },
  });
}

export async function eliminar(id) {
  await buscarPorId(id);
  await prisma.plan.delete({ where: { id } });
}
