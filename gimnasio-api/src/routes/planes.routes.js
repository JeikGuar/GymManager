// src/routes/planes.routes.js — validación de formato en la frontera
// Cadena de cada ruta: reglas → validar → controller
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/planes.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglaId = param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo');

const reglasPlan = (esNuevo) => {
  const campo = (nombre) => (esNuevo ? body(nombre) : body(nombre).optional());
  return [
    campo('nombre').isString().trim().notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ max: 60 }).withMessage('El nombre admite máximo 60 caracteres'),
    campo('duracionDias').isInt({ min: 1 }).withMessage('La duración debe ser un entero mayor a 0'),
    // Dinero en pesos enteros (Int en la base)
    campo('precio').isInt({ min: 1 }).withMessage('El precio debe ser un entero mayor a 0 (pesos)'),
    body('descripcion').optional().isString().trim().isLength({ max: 255 }).withMessage('La descripción admite máximo 255 caracteres'),
    body('beneficios').optional().isString().trim().isLength({ max: 255 }).withMessage('Los beneficios admiten máximo 255 caracteres'),
  ];
};

router.get(
  '/',
  query('precioMax').optional().isInt({ min: 0 }).withMessage('precioMax debe ser un entero positivo'),
  query('duracionMin').optional().isInt({ min: 0 }).withMessage('duracionMin debe ser un entero positivo'),
  validar,
  controlador.listar
);

router.get('/:id', reglaId, validar, controlador.obtener);

router.post('/', reglasPlan(true), validar, controlador.crear);

router.patch(
  '/:id',
  reglaId,
  body().custom((b) => Object.keys(b ?? {}).length > 0).withMessage('Envíe al menos un campo para actualizar'),
  reglasPlan(false),
  validar,
  controlador.actualizar
);

router.delete('/:id', reglaId, validar, controlador.eliminar);

export default router;
