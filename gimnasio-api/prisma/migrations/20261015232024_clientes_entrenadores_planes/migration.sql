-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoContrato" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "documentoIdentidad" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrenador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "documentoIdentidad" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
    "especialidad" TEXT NOT NULL,
    "fechaContratacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadoContrato" "EstadoContrato" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Entrenador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "duracionDias" INTEGER NOT NULL,
    "precio" INTEGER NOT NULL,
    "beneficios" TEXT,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_documentoIdentidad_key" ON "Cliente"("documentoIdentidad");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_correo_key" ON "Cliente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Entrenador_documentoIdentidad_key" ON "Entrenador"("documentoIdentidad");

-- CreateIndex
CREATE UNIQUE INDEX "Entrenador_correo_key" ON "Entrenador"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_nombre_key" ON "Plan"("nombre");
