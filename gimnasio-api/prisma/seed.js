// prisma/seed.js — datos de arranque del gimnasio (se corre con: npx prisma db seed)
// Usa la misma instancia de la app: en Prisma 7, new PrismaClient() sin adaptador no funciona.
import { prisma } from '../src/db.js';

async function main() {
  // upsert = crea si no existe, actualiza si existe → el seed se puede correr muchas veces
  const clientes = [
    { nombre: 'Laura Gómez', documentoIdentidad: '1053800111', correo: 'laura@correo.com', telefono: '3001112233' },
    { nombre: 'Andrés Ríos', documentoIdentidad: '1053800222', correo: 'andres@correo.com', telefono: '3004445566' },
    { nombre: 'Camila Duque', documentoIdentidad: '1053800333', correo: 'camila@correo.com', estado: 'INACTIVO' },
  ];
  for (const c of clientes) {
    await prisma.cliente.upsert({ where: { documentoIdentidad: c.documentoIdentidad }, update: {}, create: c });
  }

  const entrenadores = [
    { nombre: 'Mateo Herrera', documentoIdentidad: '75080444', correo: 'mateo@gym.com', telefono: '3107778899', especialidad: 'Funcional', fechaContratacion: new Date('2024-02-01') },
    { nombre: 'Sara Montoya', documentoIdentidad: '30300555', correo: 'sara@gym.com', telefono: '3151234567', especialidad: 'Yoga', fechaContratacion: new Date('2023-08-15'), estadoContrato: 'INACTIVO' },
  ];
  for (const e of entrenadores) {
    await prisma.entrenador.upsert({ where: { documentoIdentidad: e.documentoIdentidad }, update: {}, create: e });
  }

  const planes = [
    { nombre: 'Mensual', descripcion: 'Acceso ilimitado por 30 días', duracionDias: 30, precio: 90000, beneficios: 'Zona de pesas y cardio' },
    { nombre: 'Trimestral', descripcion: 'Acceso ilimitado por 90 días', duracionDias: 90, precio: 240000, beneficios: 'Pesas, cardio y clases grupales' },
    { nombre: 'Anual', descripcion: 'Acceso ilimitado por 365 días', duracionDias: 365, precio: 850000, beneficios: 'Todo incluido + valoración física' },
  ];
  for (const p of planes) {
    await prisma.plan.upsert({
      where: { nombre: p.nombre },
      update: { precio: p.precio, duracionDias: p.duracionDias }, // al re-sembrar, vuelven los valores conocidos
      create: p,
    });
  }

  console.log('Seed completado: 3 clientes, 2 entrenadores y 3 planes');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
