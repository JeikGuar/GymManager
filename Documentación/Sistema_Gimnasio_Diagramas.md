# Sistema de Administración de Membresías y Control de Ingreso a Gimnasio

## 1. Descripción del sistema

El sistema permite administrar un gimnasio: clientes, entrenadores, planes, membresías, pagos y control de ingreso. Antes de permitir el acceso, se valida que la membresía del cliente esté vigente.

**Actores:**
- **Administrador**: gestiona clientes, entrenadores, planes, membresías, pagos y reportes.
- **Entrenador**: consulta clientes.
- **Cliente**: compra o renueva su membresía, consulta su estado e ingresa al gimnasio.
- **Pasarela de Pago**: sistema externo que procesa y confirma los pagos.

**Reglas principales:**
- Cada compra o renovación genera una nueva membresía (se conserva el historial).
- La membresía solo se crea si el pago fue aprobado.
- Para ingresar: el cliente necesita membresía vigente, el entrenador necesita contrato activo y el administrador debe estar activo.

---

## 2. Diagrama de Casos de Uso

```plantuml
@startuml DiagramaCasosDeUso_Gimnasio

left to right direction
skinparam packageStyle rectangle

actor Usuario
actor Administrador
actor Entrenador
actor Cliente
actor "Pasarela de Pago" as Pasarela

Usuario <|-- Administrador
Usuario <|-- Entrenador
Usuario <|-- Cliente

rectangle "Sistema de Gestión de Gimnasio" {

  usecase "Solicitar Ingreso al Gimnasio" as UC_Ingreso

  usecase "Gestionar Clientes" as UC_GestClientes
  usecase "Gestionar Entrenadores" as UC_GestEntrenadores
  usecase "Gestionar Planes" as UC_GestPlanes
  usecase "Gestionar Membresías" as UC_GestMembresias
  usecase "Gestionar Pagos" as UC_GestPagos
  usecase "Generar Reportes" as UC_Reportes

  usecase "Consultar Clientes" as UC_ConsultarClientes

  usecase "Comprar Membresía" as UC_Comprar
  usecase "Renovar Membresía" as UC_Renovar
  usecase "Consultar Estado de Membresía" as UC_ConsultarMembresia

  usecase "Procesar Pago" as UC_ProcesarPago
  usecase "Confirmar Transacción" as UC_ConfirmarTransaccion
}

Usuario --> UC_Ingreso

Administrador --> UC_GestClientes
Administrador --> UC_GestEntrenadores
Administrador --> UC_GestPlanes
Administrador --> UC_GestMembresias
Administrador --> UC_GestPagos
Administrador --> UC_Reportes

Entrenador --> UC_ConsultarClientes

Cliente --> UC_Comprar
Cliente --> UC_Renovar
Cliente --> UC_ConsultarMembresia

Pasarela --> UC_ProcesarPago
Pasarela --> UC_ConfirmarTransaccion

UC_Comprar .> UC_ProcesarPago : <<include>>
UC_Renovar .> UC_ProcesarPago : <<include>>
UC_ProcesarPago .> UC_ConfirmarTransaccion : <<include>>

@enduml
```

---

## 3. Diagrama de Clases

```plantuml
@startuml DiagramaClases_Gimnasio

abstract class Usuario {
  -id: int
  -nombre: String
  -documentoIdentidad: String
  -correo: String
  -telefono: String
  -estado: EstadoUsuario
  +{abstract} puedeIngresar(): boolean
}

class Cliente {
  -fechaRegistro: Date
  +puedeIngresar(): boolean
  +obtenerMembresiaVigente(): Membresia
}

class Entrenador {
  -especialidad: String
  -fechaContratacion: Date
  -estadoContrato: EstadoContrato
  +puedeIngresar(): boolean
}

class Administrador {
  -usuarioAcceso: String
  +puedeIngresar(): boolean
}

class Plan {
  -id: int
  -nombre: String
  -descripcion: String
  -duracionDias: int
  -precio: decimal
  -beneficios: String
}

class Membresia {
  -id: int
  -fechaInicio: Date
  -fechaFin: Date
  -estado: EstadoMembresia
  +estaVigente(): boolean
}

class Pago {
  -id: int
  -monto: decimal
  -fecha: Date
  -metodo: String
  -estado: EstadoPago
  -referenciaTransaccion: String
}

class Ingreso {
  -id: int
  -fechaHora: DateTime
  -resultado: ResultadoIngreso
  -motivoRechazo: String
}

interface PasarelaPago {
  +procesarPago(monto: decimal): ResultadoPago
  +confirmarTransaccion(referencia: String): boolean
}

enum EstadoUsuario {
  Activo
  Inactivo
}

enum EstadoContrato {
  Activo
  Inactivo
}

enum EstadoMembresia {
  Activa
  Vencida
  Cancelada
}

enum EstadoPago {
  Aprobado
  Rechazado
}

enum ResultadoIngreso {
  Permitido
  Rechazado
}

Usuario <|-- Cliente
Usuario <|-- Entrenador
Usuario <|-- Administrador

Cliente "1" -- "0..*" Membresia : posee >
Plan "1" -- "0..*" Membresia : define >
Membresia "1" *-- "1" Pago : requiere >
Usuario "1" -- "0..*" Ingreso : genera >
Pago ..> PasarelaPago : usa >

@enduml
```

---

## 4. Diagrama de Secuencia: Compra de Membresía

```plantuml
@startuml Secuencia_CompraMembresia

actor Cliente
participant "Frontend" as FE
participant "Sistema Gimnasio" as Sistema
participant "Pasarela de Pago" as Pasarela
database "Base de Datos" as BD

Cliente -> FE : Seleccionar plan y solicitar compra
FE -> Sistema : Enviar solicitud (planId, clienteId)
Sistema -> BD : Validar cliente existente
BD --> Sistema : Cliente válido

Sistema -> Pasarela : Procesar pago (monto)
activate Pasarela

alt Pago aprobado
    Pasarela --> Sistema : Confirmar transacción (Aprobado, referencia)
    Sistema -> BD : Registrar Pago (estado=Aprobado)
    Sistema -> BD : Crear Membresía (fechaInicio, fechaFin, estado=Activa)
    BD --> Sistema : Membresía creada
    Sistema --> FE : Compra exitosa + detalle de membresía
    FE --> Cliente : Mostrar confirmación
else Pago rechazado
    Pasarela --> Sistema : Confirmar transacción (Rechazado)
    Sistema --> FE : Error: pago rechazado
    FE --> Cliente : Mostrar mensaje de error
end

deactivate Pasarela

@enduml
```

---

## 5. Diagrama de Secuencia: Control de Ingreso al Gimnasio

```plantuml
@startuml Secuencia_ControlIngreso

actor Usuario
participant "Terminal de Acceso" as Terminal
participant "Sistema Gimnasio" as Sistema
database "Base de Datos" as BD

Usuario -> Terminal : Identificarse (documento/credencial)
Terminal -> Sistema : Solicitar validación de acceso (usuarioId)
Sistema -> BD : Consultar tipo y estado de usuario

alt Es Cliente
    Sistema -> BD : Calcular membresía vigente (estado=Activa AND fechaFin>=hoy)
    BD --> Sistema : Resultado de vigencia
else Es Entrenador
    Sistema -> BD : Consultar estadoContrato
    BD --> Sistema : estadoContrato
else Es Administrador
    Sistema -> BD : Consultar estado del usuario
    BD --> Sistema : estado
end

alt Condición de acceso cumplida
    Sistema -> BD : Registrar Ingreso (resultado=Permitido)
    Sistema --> Terminal : Autorizar ingreso
    Terminal --> Usuario : Acceso permitido
else Condición no cumplida
    Sistema -> BD : Registrar Ingreso (resultado=Rechazado, motivo)
    Sistema --> Terminal : Rechazar ingreso
    Terminal --> Usuario : Acceso denegado
end

@enduml
```
