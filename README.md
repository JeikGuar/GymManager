# Sistema de Administración de Membresías y Control de Ingreso a Gimnasio

Proyecto de análisis y diseño de software para la administración de un gimnasio: gestión de clientes, entrenadores, planes, membresías, pagos (con pasarela externa) y control de ingreso según vigencia de membresía.

> **Alcance actual:** este diseño **no incluye** Rutinas ni Ejercicios; queda planificado para una fase posterior.

---

## 📌 Descripción

El sistema centraliza la administración de un gimnasio y permite controlar el acceso físico de los usuarios (clientes, entrenadores y administradores) verificando reglas de negocio específicas para cada rol.

Este repositorio contiene la **documentación de diseño** del sistema: modelo de dominio, diagrama de casos de uso, diagrama de clases, diagramas de secuencia y diagramas de proceso (BPMN), todos en formato PlantUML.

---

## 👥 Actores del sistema

| Actor | Descripción |
|---|---|
| **Administrador** | Gestiona clientes, entrenadores, planes, membresías, pagos y reportes. |
| **Entrenador** | Consulta clientes. Tiene permiso de ingreso al gimnasio según estado de contrato. |
| **Cliente** | Compra/renueva membresías, consulta su estado e ingresa al gimnasio si su membresía está vigente. |
| **Pasarela de Pago** | Sistema externo que procesa y confirma transacciones. |

---

## 🧱 Modelo de dominio (resumen)

```
Usuario (abstracta)
 ├── Cliente
 ├── Entrenador
 └── Administrador
```

- Un **Cliente** puede tener varias **Membresías** a lo largo del tiempo (historial completo).
- Cada compra o renovación genera una **nueva** Membresía.
- Una Membresía **solo existe** si su **Pago** asociado fue **Aprobado** (relación 1 a 1 obligatoria).
- El **Control de Ingreso** aplica a cualquier Usuario, con reglas distintas por rol:
  - **Cliente** → requiere membresía vigente.
  - **Entrenador** → requiere estado de contrato activo.
  - **Administrador** → requiere estado de usuario activo.

---

## 📊 Diagramas incluidos

Toda la notación está en **PlantUML**, dentro de [`docs/Sistema_Gimnasio_Diagramas.md`](docs/Sistema_Gimnasio_Diagramas.md):

1. **Diagrama de Casos de Uso** — actores, funcionalidades y relaciones `<<include>>`.
2. **Diagrama de Clases** — entidades del dominio, herencia, composición y dependencias.
3. **Diagramas de Secuencia** — Compra de Membresía y Control de Ingreso.
4. **Diagramas BPMN (equivalente Activity Diagram)** — Compra/Renovación de Membresía y Control de Ingreso.

> ⚠️ Los diagramas "BPMN" están representados como Activity Diagrams con carriles, ya que PlantUML no tiene un módulo BPMN 2.0 formal. Para notación BPMN certificada se recomienda Bizagi, Camunda Modeler o draw.io.

---

## 🛠️ Cómo visualizar los diagramas

El código PlantUML se puede renderizar con cualquiera de estas opciones:

- **Editor en línea oficial:** https://www.plantuml.com/plantuml/uml/
- **VS Code:** extensión [PlantUML (jebbs)](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)
- **IntelliJ / otros IDEs:** plugins equivalentes de PlantUML

Simplemente copia el bloque de código completo (desde `@startuml` hasta `@enduml`) en la herramienta elegida.

---

## 📁 Estructura del repositorio

```
├── docs/
│   └── Sistema_Gimnasio_Diagramas.md   # Modelo de dominio y todos los diagramas
├── README.md                            # Este archivo
```

---

## 🚧 Estado del proyecto

- [x] Modelo de dominio
- [x] Diagrama de Casos de Uso
- [x] Diagrama de Clases
- [x] Diagramas de Secuencia
- [x] Diagramas BPMN (Activity Diagram)
- [ ] Módulo de Rutinas y Ejercicios (fase futura)
- [ ] Implementación técnica

