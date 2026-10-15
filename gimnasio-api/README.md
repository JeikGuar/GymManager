# API Gimnasio – Membresías y Control de Ingreso

Proyecto ABP de **Programación Web 2** (Universidad de Caldas).
API REST con **Express**, arquitectura por capas (`routes → controllers → services`),
validación con **express-validator** y persistencia en **PostgreSQL** con **Prisma 7**.

## Requisitos
- Node.js 22.18 o superior (LTS recomendada)
- Docker Desktop corriendo

## Puesta en marcha (primera vez)
```bash
# 1. Base de datos en Docker (puerto 5440 de tu máquina → 5432 del contenedor)
docker run --name gimnasio-db -e POSTGRES_USER=gimnasio -e POSTGRES_PASSWORD=gimnasio123 -e POSTGRES_DB=gimnasio -p 5440:5432 -d postgres:16

# 2. Variables de entorno
cp .env.example .env          # en Windows: copy .env.example .env

# 3. Dependencias (el postinstall corre "prisma generate")
npm install

# 4. Crear las tablas y cargar datos de ejemplo
npx prisma migrate dev     # aplica las migraciones que ya están en prisma/migrations
npx prisma generate
npx prisma db seed

# 5. Arrancar
npm run dev
```
La API queda en `http://localhost:3000`.

Para el día a día: `docker start gimnasio-db` antes de `npm run dev`, y `docker stop gimnasio-db` al terminar.
**Nunca** `docker rm gimnasio-db`: borra el contenedor y sus datos.

## Estructura
```
prisma/
├── schema.prisma          # modelos (fuente de verdad)
├── migrations/            # se crea con "prisma migrate dev" (sí va a git)
└── seed.js                # datos de ejemplo
prisma7.config.ts          # dónde está el schema y la URL de la base
src/
├── server.js              # solo listen()
├── app.js                 # middlewares, routers, 404 y errores
├── db.js                  # única instancia de PrismaClient
├── errores.js             # ErrorHttp + noEncontrado / conflicto / datosInvalidos
├── routes/                # URL + reglas de express-validator
├── controllers/           # HTTP: async/await + next(error)
├── services/              # reglas de negocio con Prisma (sin req/res)
├── middlewares/           # validar, errores, noEncontrado, registrarPeticion
└── generated/prisma/      # cliente generado (no va a git)
```

## Endpoints
| Recurso | Ruta | Filtros |
|---|---|---|
| Clientes | `GET/POST /api/clientes` · `GET/PATCH/DELETE /api/clientes/:id` | `?estado=ACTIVO&buscar=texto` |
| Entrenadores | `GET/POST /api/entrenadores` · `GET/PATCH/DELETE /api/entrenadores/:id` | `?estadoContrato=ACTIVO&especialidad=yoga` |
| Planes | `GET/POST /api/planes` · `GET/PATCH/DELETE /api/planes/:id` | `?precioMax=250000&duracionMin=30` |

Respuestas: `200`, `201` al crear, `204` al eliminar, `400` datos inválidos (con `detalles`),
`404` no existe, `409` documento/correo/nombre repetido.

En `peticiones.http` hay ejemplos para la extensión REST Client de VS Code.
