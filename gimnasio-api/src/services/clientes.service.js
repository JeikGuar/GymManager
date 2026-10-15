// src/services/clientes.service.js
// Capa de negocio: reglas del dominio. NO conoce req, res ni códigos HTTP.
// Los datos viven en PostgreSQL y se consultan con Prisma.
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

// Documento y correo no se pueden repetir (se excluye al propio cliente al actualizar)
async function validarUnicos({ documentoIdentidad, correo }, idActual) {
  if (documentoIdentidad) {
    const existe = await prisma.cliente.findUnique({ where: { documentoIdentidad } });
    if (existe && existe.id !== idActual) throw conflicto(`Ya existe un cliente con el documento ${documentoIdentidad}`);
  }
  if (correo) {
    const existe = await prisma.cliente.findUnique({ where: { correo } });
    if (existe && existe.id !== idActual) throw conflicto(`Ya existe un cliente con el correo ${correo}`);
  }
}

// GET /api/clientes?estado=ACTIVO&buscar=laura   (undefined = sin filtro)
export function listar({ estado, buscar } = {}) {
  return prisma.cliente.findMany({
    where: {
      estado,
      OR: buscar
        ? [
            { nombre: { contains: buscar, mode: 'insensitive' } },
            { documentoIdentidad: { contains: buscar } },
          ]
        : undefined,
    },
    orderBy: { id: 'asc' },
  });
}

export async function buscarPorId(id) {
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) throw noEncontrado(`No existe un cliente con id ${id}`);
  return cliente;
}

export async function crear({ nombre, documentoIdentidad, correo, telefono, estado }) {
  await validarUnicos({ documentoIdentidad, correo });
  return prisma.cliente.create({
    data: { nombre, documentoIdentidad, correo, telefono, estado },
  });
}

// PATCH: solo cambia los campos enviados (los undefined se ignoran)
export async function actualizar(id, { nombre, documentoIdentidad, correo, telefono, estado }) {
  await buscarPorId(id); // lanza 404 si no existe
  await validarUnicos({ documentoIdentidad, correo }, id);
  return prisma.cliente.update({
    where: { id },
    data: { nombre, documentoIdentidad, correo, telefono, estado },
  });
}

export async function eliminar(id) {
  await buscarPorId(id);
  await prisma.cliente.delete({ where: { id } });
}
