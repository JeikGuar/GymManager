# Sistema de Administración de Membresías y Control de Ingreso a Gimnasio

Documento de análisis y diseño: modelo de dominio, casos de uso, clases, secuencia y BPMN (PlantUML).

> Alcance actual: **NO incluye Rutinas ni Ejercicios** (se dejarán para una fase posterior).

---

## Índice

1. [Contexto del sistema](#1-contexto-del-sistema)
2. [Modelo de dominio (aprobado)](#2-modelo-de-dominio-aprobado)
3. [Reglas de negocio consolidadas](#3-reglas-de-negocio-consolidadas)
4. [Diagrama de Casos de Uso](#4-diagrama-de-casos-de-uso)
5. [Diagrama de Clases](#5-diagrama-de-clases)
6. [Diagramas de Secuencia](#6-diagramas-de-secuencia)
7. [Diagramas BPMN (Activity Diagram con carriles)](#7-diagramas-bpmn-activity-diagram-con-carriles)
8. [Cómo visualizar estos diagramas](#8-cómo-visualizar-estos-diagramas)

---

## 1. Contexto del sistema

El sistema administra un gimnasio: clientes, entrenadores, planes, membresías, pagos y control de ingreso, verificando que la membresía del cliente esté vigente para permitir el acceso.

**Actores:**

- **Administrador**: gestiona clientes, entrenadores, planes, membresías, pagos y genera reportes.
- **Entrenador**: consulta clientes (rol reducido por ahora, sin rutinas/ejercicios).
- **Cliente**: compra/renueva membresías, consulta su estado, ingresa al gimnasio.
- **Pasarela de Pago**: sistema externo que procesa y confirma transacciones (no es un actor humano).

---

## 2. Modelo de dominio (aprobado)

### Jerarquía de herencia

```
Usuario (clase base abstracta)
 ├── Cliente
 ├── Entrenador
 └── Administrador
```

**Usuario** (atributos comunes): id, nombre, documento de identidad, correo, teléfono, estado (Activo/Inactivo).

- **Cliente** agrega: fechaRegistro
- **Entrenador** agrega: especialidad, fechaContratación, estadoContrato (Activo/Inactivo)
- **Administrador** agrega: usuario (credencial de acceso al sistema)

### Entidades de negocio

| Entidad | Atributos principales |
|---|---|
| **Plan** | id, nombre, descripción, duración, precio, beneficios |
| **Membresía** | id, fechaInicio, fechaFin, estado (Activa/Vencida/Cancelada), clienteId, planId |
| **Pago** | id, monto, fecha, método, estado (Aprobado/Rechazado), referenciaTransacciónPasarela |
| **Ingreso** | id, fecha/hora, resultado (Permitido/Rechazado), motivoRechazo, usuarioId |
| **PasarelaPago** | servicio externo: procesar pago, confirmar transacción (sin persistencia en el dominio) |

### Relaciones

| Relación | Cardinalidad | Naturaleza |
|---|---|---|
| Usuario → Cliente / Entrenador / Administrador | — | Herencia |
| Cliente — Membresía | 1 a 0..N | Asociación (historial completo) |
| Plan — Membresía | 1 a 0..N | Asociación |
| Membresía — Pago | 1 a 1 | Composición (no existe una sin la otra) |
| Usuario — Ingreso | 1 a 0..N | Asociación (aplica a cualquier rol) |
| Sistema — PasarelaPago | — | Dependencia (servicio externo) |

---

## 3. Reglas de negocio consolidadas

1. Cada compra o renovación genera una **nueva** Membresía (se conserva historial completo del cliente).
2. Una Membresía **solo existe** si el Pago asociado fue **Aprobado**. Un pago rechazado no genera Membresía.
3. La **membresía vigente** de un cliente se calcula dinámicamente: `estado = Activa` y `fechaFin >= fecha actual` (no se guarda un campo fijo de "membresía actual").
4. El control de **Ingreso aplica a cualquier Usuario** (Cliente, Entrenador, Administrador), pero la validación cambia según el rol:
   - **Cliente** → requiere membresía vigente.
   - **Entrenador** → requiere `estadoContrato = Activo`.
   - **Administrador** → requiere `estado = Activo`.
5. El Pago tiene únicamente dos estados finales: **Aprobado** o **Rechazado** (sin estado intermedio "Pendiente").

---

## 4. Diagrama de Casos de Uso

**Notación:** PlantUML

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

' --- Usuario (generalización) ---
Usuario --> UC_Ingreso

' --- Administrador ---
Administrador --> UC_GestClientes
Administrador --> UC_GestEntrenadores
Administrador --> UC_GestPlanes
Administrador --> UC_GestMembresias
Administrador --> UC_GestPagos
Administrador --> UC_Reportes

' --- Entrenador ---
Entrenador --> UC_ConsultarClientes

' --- Cliente ---
Cliente --> UC_Comprar
Cliente --> UC_Renovar
Cliente --> UC_ConsultarMembresia

' --- Pasarela de Pago ---
Pasarela --> UC_ProcesarPago
Pasarela --> UC_ConfirmarTransaccion

' --- Relaciones include ---
UC_Comprar .> UC_ProcesarPago : <<include>>
UC_Renovar .> UC_ProcesarPago : <<include>>
UC_ProcesarPago .> UC_ConfirmarTransaccion : <<include>>

@enduml
```

**Notas de diseño:**

- `Usuario` es un actor abstracto del cual heredan `Cliente`, `Entrenador` y `Administrador`, ya que el caso de uso "Solicitar Ingreso al Gimnasio" aplica a los tres roles.
- Se usa `<<include>>` (no `<<extend>>`) entre Comprar/Renovar Membresía y Procesar Pago, porque el pago **siempre** es obligatorio en esos flujos, nunca opcional.

---

## 5. Diagrama de Clases

**Notación:** PlantUML

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

**Notas de diseño:**

- `Usuario` es abstracta, con el método polimórfico `puedeIngresar()` sobrescrito distinto en cada subclase.
- La composición estricta `Membresia *-- Pago` (1 a 1) refleja la regla "no existe una sin la otra".
- `PasarelaPago` es una interfaz externa (dependencia), no una clase persistida del dominio.

---

## 6. Diagramas de Secuencia

### 6.1 Compra de Membresía

> La renovación sigue exactamente el mismo flujo (nueva membresía tras pago aprobado).

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
    note right of Sistema
      No se crea Membresía
      (regla de negocio confirmada)
    end note
    Sistema --> FE : Error: pago rechazado
    FE --> Cliente : Mostrar mensaje de error
end

deactivate Pasarela

@enduml
```

### 6.2 Control de Ingreso al Gimnasio

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

---

## 7. Diagramas BPMN (Activity Diagram con carriles)

> ⚠️ **Aclaración importante:** PlantUML no tiene un módulo de notación BPMN 2.0 formal (no genera los símbolos estándar de pools, tareas de servicio, eventos de mensaje, etc., según el estándar OMG BPMN). Lo que se muestra a continuación es un **Activity Diagram con carriles (`|Carril|`)**, la representación más cercana disponible en PlantUML. **No debe presentarse como un BPMN 2.0 certificado.** Para notación BPMN formal se recomienda Bizagi Modeler, Camunda Modeler o draw.io (con paleta BPMN).

### 7.1 Compra / Renovación de Membresía

```plantuml
@startuml BPMN_CompraMembresia

|Cliente|
start
:Seleccionar plan;
:Solicitar compra/renovación de membresía;

|Sistema Gimnasio|
:Validar datos del cliente;
:Enviar solicitud de pago;

|Pasarela de Pago|
:Procesar transacción;

if (¿Pago aprobado?) then (sí)
  |Sistema Gimnasio|
  :Registrar pago aprobado;
  :Crear nueva membresía (estado=Activa);
  :Notificar confirmación;
  |Cliente|
  :Recibir confirmación de membresía;
  stop
else (no)
  |Sistema Gimnasio|
  :Registrar intento de pago rechazado;
  :Notificar rechazo;
  |Cliente|
  :Recibir notificación de rechazo;
  stop
endif

@enduml
```

### 7.2 Control de Ingreso al Gimnasio

```plantuml
@startuml BPMN_ControlIngreso

|Usuario|
start
:Presentarse en el punto de acceso;
:Identificarse;

|Sistema Gimnasio|
:Consultar tipo de usuario;

if (¿Es Cliente?) then (sí)
  :Calcular vigencia de membresía;
elseif (¿Es Entrenador?) then (sí)
  :Consultar estado de contrato;
else (Administrador)
  :Consultar estado del usuario;
endif

if (¿Condición de acceso cumplida?) then (sí)
  :Registrar ingreso permitido;
  |Usuario|
  :Ingresar al gimnasio;
  stop
else (no)
  |Sistema Gimnasio|
  :Registrar ingreso rechazado;
  |Usuario|
  :Recibir notificación de rechazo;
  stop
endif

@enduml
```

---

## 8. Cómo visualizar estos diagramas

Todo el código está en **PlantUML**. Para renderizarlo, tu amigo puede usar cualquiera de estas opciones:

1. **Editor en línea oficial:** [https://www.plantuml.com/plantuml/uml/](https://www.plantuml.com/plantuml/uml/) — copiar y pegar el bloque de código (incluyendo `@startuml` / `@enduml`).
2. **Extensión de VS Code:** "PlantUML" (by jebbs) — permite previsualizar directamente los bloques de código.
3. **IntelliJ / otros IDEs:** existen plugins de PlantUML similares.

Basta con copiar cada bloque de código completo (desde `@startuml` hasta `@enduml`) en cualquiera de estas herramientas.

---

## Resumen de coherencia

Los cuatro artefactos (Casos de Uso, Clases, Secuencia y BPMN) comparten los mismos conceptos base: la generalización `Usuario`, la regla "sin pago aprobado no hay membresía", y el control de ingreso diferenciado por rol — sin contradicciones entre ellos.
