// src/app.js — configura Express (sin arrancarlo)
import express from 'express';
import morgan from 'morgan';

import clientesRouter from './routes/clientes.routes.js';
import entrenadoresRouter from './routes/entrenadores.routes.js';
import planesRouter from './routes/planes.routes.js';

import { registrarPeticion } from './middlewares/registrarPeticion.js';
import { noEncontrado } from './middlewares/noEncontrado.js';
import { manejadorErrores } from './middlewares/errores.js';

const app = express();

// ---------- Middlewares globales (el orden importa) ----------
app.use(express.json());      // 1. Parser: convierte el body JSON en req.body
app.use(morgan('dev'));       // 2. Logger de peticiones
app.use(registrarPeticion);   // 3. Middleware propio: hora y tiempo de respuesta

// ---------- Rutas ----------
app.get('/', (req, res) => {
  res.json({
    nombre: 'API Sistema de Gimnasio',
    version: '1.0',
    recursos: ['/api/clientes', '/api/entrenadores', '/api/planes'],
  });
});

app.use('/api/clientes', clientesRouter);
app.use('/api/entrenadores', entrenadoresRouter);
app.use('/api/planes', planesRouter);

// ---------- Al final ----------
app.use(noEncontrado);        // 4. Ninguna ruta respondió -> 404
app.use(manejadorErrores);    // 5. Errores (4 parámetros) -> siempre de último

export default app;
