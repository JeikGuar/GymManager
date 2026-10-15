// src/routes/entrenadores.routes.js — validación de formato en la frontera
// Cadena de cada ruta: reglas → validar → controller
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/entrenadores.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const ESTADOS = ['ACTIVO', 'INACTIVO'];
const reglaId = param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo');

const reglasEntrenador = (esNuevo) => {
  const campo = (nombre) => (esNuevo ? body(nombre) : body(nombre).optional());
  return [
    campo('nombre').isString().trim().notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ max: 80 }).withMessage('El nombre admite máximo 80 caracteres'),
    campo('documentoIdentidad').matches(/^\d{5,15}$/).withMessage('El documento debe tener entre 5 y 15 dígitos'),
    campo('correo').isEmail().withMessage('Correo inválido').normalizeEmail({ gmail_remove_dots: false }),
    campo('especialidad').isString().trim().notEmpty().withMessage('La especialidad es obligatoria')
      .isLength({ max: 60 }).withMessage('La especialidad admite máximo 60 caracteres'),
    body('telefono').optional({ values: 'falsy' }).matches(/^\+?\d{7,15}$/).withMessage('El teléfono debe tener entre 7 y 15 dígitos'),
    body('estado').optional().isIn(ESTADOS).withMessage(`El estado debe ser uno de: ${ESTADOS.join(', ')}`),
    body('fechaContratacion').optional().isISO8601({ strict: true }).withMessage('La fecha debe tener formato YYYY-MM-DD'),
    body('estadoContrato').optional().isIn(ESTADOS).withMessage(`El estadoContrato debe ser uno de: ${ESTADOS.join(', ')}`),
  ];
};

router.get(
  '/',
  query('estadoContrato').optional().isIn(ESTADOS).withMessage(`El estadoContrato debe ser uno de: ${ESTADOS.join(', ')}`),
  validar,
  controlador.listar
);

router.get('/:id', reglaId, validar, controlador.obtener);

router.post('/', reglasEntrenador(true), validar, controlador.crear);

router.patch(
  '/:id',
  reglaId,
  body().custom((b) => Object.keys(b ?? {}).length > 0).withMessage('Envíe al menos un campo para actualizar'),
  reglasEntrenador(false),
  validar,
  controlador.actualizar
);

router.delete('/:id', reglaId, validar, controlador.eliminar);

export default router;
