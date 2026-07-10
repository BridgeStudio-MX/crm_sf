# Parks Industrial — Área Comercial
## Flujo Completo + Historias de Usuario para implementación en CRM
### Documento técnico para Cursor

---

## CONTEXTO GENERAL

Este documento define el flujo completo del área comercial de Parks Industrial, empresa dedicada a la **renta de naves industriales** en parques industriales a nivel nacional en México.

El CRM base ya está montado. Este documento extiende esa base con:
- Objetos custom específicos del negocio de rentas industriales
- Flujos de cada escenario comercial
- Historias de usuario por rol
- Reglas de negocio y validaciones
- Automatizaciones requeridas
- Punto de handoff con el área legal

---

## ROLES DEL ÁREA COMERCIAL

```
Director Comercial (CEM / Héctor)
├── Leasing Officer 1
├── Leasing Officer 2
└── Leasing Officer 3

Broker Externo (no tiene acceso al sistema)
└── Intermediario entre cliente y Leasing Officer
```

**Regla de negocio — asignación:**
Todos los leads pasan primero por el Director Comercial, quien los asigna manualmente a un Leasing Officer. No hay asignación automática por zona — todos los LOs pueden atender cualquier parque en cualquier región del país.

---

## OBJETOS DEL SISTEMA (CUSTOM)

### Objeto: Lead / Prospecto
```
Campos requeridos:
- nombre_completo (texto)
- empresa (texto)
- correo (email)
- telefono (telefono)
- giro_empresa (lista: Manufactura / Logística / Distribución / E-commerce / Farmacéutica / Automotriz / Otro)
- metros_cuadrados_requeridos (número)
- ubicacion_deseada (lista: Guadalajara / Monterrey / CDMX / Bajío / Norte / Sur / Otro)
- plazo_contrato_meses (número)
- presupuesto_mensual_usd (moneda USD)
- canal_origen (lista: Recomendación / Call Center / CEM / LinkedIn / Página web / Broker / Evento / Otro)
- broker_referente (relación → Broker, opcional)
- leasing_officer_asignado (relación → Usuario)
- fecha_de_registro (fecha, auto)
- estatus (lista: Nuevo / En seguimiento / Calificado / No calificado / Perdido)
- razon_no_calificado (texto, visible si estatus = No calificado)
```

### Objeto: Oportunidad
```
Campos requeridos:
- nombre (auto-generado: [Empresa] - [Parque] - [M²] m²)
- lead_origen (relación → Lead)
- inquilino (relación → Cuenta)
- broker (relación → Broker, opcional)
- leasing_officer (relación → Usuario)
- nave_de_interes (relación → Nave, opcional hasta etapa 3)
- metros_cuadrados_ofertados (número)
- precio_por_m2_usd (moneda USD)
- renta_mensual_calculada (fórmula: metros × precio_por_m2)
- tipo_operacion (lista: Nave disponible / Build-to-suit)
- plazo_contrato_meses (número)
- periodo_de_gracia_meses (número)
- deposito_garantia_meses (número, default: 2)
- rentas_adelantadas_meses (número, default: 2)
- escalacion_anual (lista: INPC / Porcentaje fijo)
- porcentaje_escalacion (número, visible si escalacion = Porcentaje fijo)
- condiciones_especiales (texto largo)
- esquema_comision (lista: Recursos propios / Broker top 10 / Broker no top 10)
- etapa_pipeline (ver Pipeline Stages abajo)
- probabilidad_cierre (número, auto según etapa)
- fecha_estimada_cierre (fecha)
- razon_perdida (texto, visible si etapa = Perdida)
- fecha_reactivacion (fecha, visible si etapa = Perdida y tipo = Pospuesto)
```

### Objeto: Nave
```
- nombre_clave (texto, ej: BOD-PA-1H-E1)
- parque (relación → Parque)
- metros_cuadrados_totales (número)
- altura_libre_metros (número)
- numero_andenes (número)
- carga_de_piso_ton_m2 (número)
- potencia_electrica_kva (número)
- cajones_estacionamiento (número)
- tiene_oficinas (boolean)
- es_propiedad_funo (boolean) ← CRÍTICO para comisiones
- estatus (lista: Disponible / En negociación / Rentada / En construcción / Mantenimiento)
- precio_lista_usd_m2 (moneda)
- etapa_construccion (texto, para build-to-suit)
```

### Objeto: Parque
```
- nombre (texto)
- ubicacion_estado (lista)
- ciudad (texto)
- metros_cuadrados_totales (número)
- metros_cuadrados_rentados (número, calculado)
- metros_cuadrados_disponibles (número, calculado)
- porcentaje_ocupacion (fórmula)
- administrador_parque (relación → Usuario)
```

### Objeto: Broker
```
- nombre_completo (texto)
- empresa (texto)
- correo (email)
- telefono (teléfono)
- clasificacion (lista: Top 10 / No top 10)
- operaciones_cerradas_count (número, calculado)
- comisiones_históricas (moneda, calculado)
- activo (boolean)
```

### Objeto: Hoja de Acuerdos
```
- oportunidad (relación → Oportunidad)
- inquilino (relación → Cuenta)
- nave (relación → Nave)
- parque (relación → Parque)
- metros_cuadrados_acordados (número)
- precio_por_m2_acordado_usd (moneda)
- renta_mensual_acordada (fórmula)
- plazo_meses (número)
- fecha_inicio_contrato (fecha)
- periodo_gracia_meses (número)
- deposito_garantia_meses (número)
- rentas_adelantadas_meses (número)
- escalacion_tipo (lista: INPC / Porcentaje fijo)
- porcentaje_escalacion (número)
- condiciones_especiales (texto largo)
- broker_nombre (texto)
- esquema_comision (lista)
- firmada_por_cliente (boolean)
- firmada_por_cem (boolean)
- fecha_firma (fecha)
- estatus (lista: Borrador / Firmada / Enviada a Legal)
```

---

## PIPELINE STAGES

```
Etapa 1: Lead recibido          → Probabilidad: 10%
Etapa 2: Calificado             → Probabilidad: 20%
Etapa 3: Tour / Visita          → Probabilidad: 35%
Etapa 4: Cotización enviada     → Probabilidad: 50%
Etapa 5: En negociación         → Probabilidad: 65%
Etapa 6: Hoja de Acuerdos      → Probabilidad: 85%
Etapa 7: En proceso legal       → Probabilidad: 95%
Etapa 8: Ganada ✓               → Probabilidad: 100%
Etapa 9: Perdida ✗              → Probabilidad: 0%
```

---

## ESCENARIO A — LEAD DIRECTO (SIN BROKER)

### Flujo completo

```
[Entrada del lead]
        ↓
Lead llega por: Página web / LinkedIn / Call Center / Recomendación / CEM
        ↓
Sistema crea Lead automáticamente (si web/LinkedIn) 
O bien: LO o CEM crea el Lead manualmente
        ↓
CEM asigna Lead a un Leasing Officer
        ↓
[ETAPA 1: Lead recibido]
Tarea automática al LO: "Contactar prospecto en máximo 24 horas"
        ↓
LO hace primer contacto (llamada / correo / WhatsApp)
LO registra la actividad en el sistema
        ↓
¿Prospecto responde y tiene necesidad clara?
    ├── NO → Marcar como "No calificado" + razón → Fin del flujo A
    └── SÍ → [ETAPA 2: Calificado]
        ↓
[ETAPA 2: Calificado]
LO completa campos obligatorios:
  - M² requeridos
  - Ubicación
  - Giro
  - Plazo deseado
  - Presupuesto aproximado
  - Tipo de operación (nave disponible o build-to-suit)
        ↓
LO consulta inventario disponible (desde módulo de naves)
¿Hay nave que coincida?
    ├── NO → Marcar como "Pendiente de disponibilidad" 
    │         Tarea futura: cuando se libere nave compatible, reactivar
    └── SÍ → Agendar tour
        ↓
[ETAPA 3: Tour / Visita]
LO agenda el tour en el sistema (fecha, parque, nave, asistentes)
Tarea automática post-tour (48 hrs): "Dar seguimiento al prospecto"
        ↓
LO realiza el tour
LO registra en el sistema: fecha, naves mostradas, feedback del cliente
        ↓
¿El cliente quiere avanzar?
    ├── NO → Ver Escenario C (Lead perdido)
    └── SÍ → Preparar cotización
        ↓
[ETAPA 4: Cotización enviada]
LO genera cotización en el sistema con:
  - Nave específica vinculada
  - M² ofertados
  - Precio por m² (USD)
  - Renta mensual calculada automáticamente
  - Plazo propuesto
  - Período de gracia
  - Depósito en garantía
  - Rentas adelantadas
  - Escalación anual (INPC)
  - Condiciones base
        ↓
Tarea automática a los 5 días hábiles: "Seguimiento de cotización — ¿tiene dudas el cliente?"
        ↓
¿El cliente acepta las condiciones?
    ├── NO → [ETAPA 5: En negociación] (ver detalles abajo)
    └── SÍ → Directo a Hoja de Acuerdos
        ↓
[ETAPA 5: En negociación]
LO registra cada ronda de negociación como actividad
Campos actualizados en la oportunidad con condiciones actuales vs iniciales
        ↓
¿Hay condiciones especiales que requieren aprobación?
    ├── Descuento menor → Aprobación del CEM en el sistema
    └── Descuento mayor o condición significativa → Aprobación del CEO
        ↓
Flujo de aprobación:
  - Sistema notifica al aprobador (CEM o CEO)
  - Aprobador acepta o rechaza con comentario
  - Si rechaza: LO ajusta y vuelve a negociar
  - Si acepta: avanza a Hoja de Acuerdos
        ↓
[ETAPA 6: Hoja de Acuerdos]
LO crea la Hoja de Acuerdos en el sistema con todas las condiciones finales acordadas
CEM revisa y firma digitalmente en el sistema
El cliente firma físicamente (LO registra la fecha de firma del cliente)
        ↓
LO marca la Hoja de Acuerdos como "Firmada"
        ↓
[HANDOFF A LEGAL]
Sistema dispara automáticamente:
  - Crea Caso Legal vinculado a la Oportunidad
  - Notificación al equipo Legal con toda la info comercial
  - Inicia contador de SLA (60 días para contrato nuevo)
  - Genera checklist de documentación del cliente
  - Tarea al LO: "Recopilar y entregar documentación del cliente en 5 días hábiles"
        ↓
[ETAPA 7: En proceso legal]
LO mantiene comunicación con el cliente
LO ve en tiempo real el semáforo del caso en Legal
Si Legal pide documentación faltante: LO la gestiona con el cliente
        ↓
Cuando Legal cierra el contrato:
  - Oportunidad pasa automáticamente a [ETAPA 8: Ganada]
  - Sistema calcula comisión del LO según esquema
  - Notificación al CEM del cierre
```

---

### Historias de Usuario — Escenario A

**US-COM-001**
```
COMO Leasing Officer
QUIERO registrar un nuevo lead en el sistema
PARA tener su información centralizada y poder darle seguimiento

Criterios de aceptación:
- Puedo crear un lead con los campos: nombre, empresa, correo, teléfono, giro, m² requeridos, 
  ubicación, plazo, presupuesto y canal de origen
- El sistema me pide canal de origen obligatoriamente
- Al guardar, el sistema notifica al CEM que hay un lead nuevo sin asignar
- Si el lead viene de web, se crea automáticamente desde el formulario
```

**US-COM-002**
```
COMO Director Comercial (CEM)
QUIERO ver todos los leads sin asignar en un dashboard
PARA asignarlos al Leasing Officer adecuado

Criterios de aceptación:
- Vista de lista de leads con estatus "Nuevo" ordenados por fecha de registro
- Botón de asignación directa desde la lista
- Al asignar: el LO recibe notificación inmediata
- El sistema registra quién asignó y cuándo
```

**US-COM-003**
```
COMO Leasing Officer
QUIERO ver las naves disponibles al calificar un prospecto
PARA saber si tenemos algo que ofrecerle antes de agendar un tour

Criterios de aceptación:
- Filtro de naves por: m² mínimos, ubicación, altura libre, número de andenes
- Cada nave muestra: m², precio/m², parque, estatus, foto si existe
- Naves en estatus "En negociación" aparecen marcadas como condicionalmente disponibles
- Naves en estatus "Rentada" no aparecen
- Puedo vincular una o varias naves de interés a la oportunidad
```

**US-COM-004**
```
COMO Leasing Officer
QUIERO registrar el resultado del tour en el sistema
PARA tener un historial completo de la visita y los próximos pasos

Criterios de aceptación:
- Registro de: fecha, parque visitado, naves mostradas, asistentes del cliente
- Campo de notas de feedback del cliente
- Campo de próximos pasos acordados
- El sistema crea automáticamente una tarea de seguimiento a 48 horas
```

**US-COM-005**
```
COMO Leasing Officer
QUIERO generar una cotización formal desde la oportunidad
PARA enviarla al cliente con todas las condiciones claras

Criterios de aceptación:
- La cotización se genera desde la oportunidad con los datos ya cargados
- Calcula automáticamente la renta mensual (m² × precio/m²)
- Incluye: nave, m², precio, plazo, gracia, depósito, escalación
- Se puede previsualizar antes de enviar
- Al enviarse, el sistema registra la fecha y crea tarea de seguimiento a 5 días hábiles
```

**US-COM-006**
```
COMO Leasing Officer
QUIERO solicitar aprobación de condiciones especiales
PARA poder ofrecerle al cliente descuentos o condiciones fuera del estándar

Criterios de aceptación:
- Puedo marcar una condición como "requiere aprobación"
- El sistema determina el nivel: CEM o CEO según el tipo de condición
- El aprobador recibe notificación con las condiciones actuales vs las propuestas
- Puedo ver en tiempo real el estatus de la aprobación
- Si es rechazado, recibo el comentario del aprobador para ajustar
```

**US-COM-007**
```
COMO Leasing Officer
QUIERO crear la Hoja de Acuerdos con las condiciones finales
PARA formalizar el acuerdo comercial antes de pasarlo a Legal

Criterios de aceptación:
- La Hoja de Acuerdos se genera desde la oportunidad con los datos de la negociación
- Incluye todos los campos: m², precio, plazo, gracia, depósito, rentas adelantadas, 
  escalación, condiciones especiales, broker (si aplica), esquema de comisión
- El CEM debe aprobar la Hoja antes de que se active el handoff a Legal
- Al marcarse como "Firmada por cliente": el sistema dispara el proceso legal automáticamente
- La oportunidad avanza automáticamente a Etapa 7 (En proceso legal)
```

**US-COM-008**
```
COMO Leasing Officer
QUIERO ver el progreso del contrato en Legal desde mi vista
PARA mantener informado al cliente sin tener que preguntar a Legal directamente

Criterios de aceptación:
- En la oportunidad veo el semáforo del caso legal (azul/naranja/amarillo/rojo)
- Veo el SLA: días transcurridos vs días disponibles
- Si Legal necesita documentación del cliente, recibo una tarea con la lista exacta
- No puedo modificar el caso legal — solo lo veo
```

---

## ESCENARIO B — LEAD VÍA BROKER EXTERNO

### Flujo completo

```
[Entrada del broker]
Broker contacta al LO directamente (llamada / WhatsApp / correo)
Broker presenta el requerimiento de su cliente
        ↓
LO verifica si el broker ya está registrado en el sistema
    ├── NO → LO crea el perfil del broker: nombre, empresa, clasificación (top 10 / no top 10)
    └── SÍ → LO vincula el broker existente
        ↓
LO crea el Lead con:
  - Canal origen: "Broker"
  - Broker referente: [broker registrado]
  - Datos del cliente final (empresa, giro, m², etc.)
  - Nota: el broker representa al cliente — la negociación es con el broker, 
    no directamente con el cliente en la mayoría de los casos
        ↓
[ETAPA 1: Lead recibido]
CEM asigna al LO (el mismo que habló con el broker si no fue asignado ya)
        ↓
[ETAPA 2: Calificado]
LO evalúa el requerimiento del broker con el inventario disponible
        ↓
[ETAPA 3: Tour / Visita]
LO coordina el tour con el broker Y con el cliente final
El broker puede acompañar o no al cliente en el tour
Registro en el sistema: broker + asistentes del cliente final
        ↓
[ETAPA 4: Cotización enviada]
LO prepara la cotización
La cotización puede enviarse al broker (quien la lleva a su cliente)
O directamente al cliente con copia al broker — según el caso
        ↓
[ETAPA 5: En negociación]
La negociación ocurre principalmente con el broker
El broker negocia en nombre de su cliente
Pueden existir 2-4 rondas de negociación
        ↓
REGLA CRÍTICA: si hay condiciones especiales → flujo de aprobación igual al Escenario A
        ↓
[ETAPA 6: Hoja de Acuerdos]
La Hoja de Acuerdos incluye:
  - Nombre del broker
  - Clasificación del broker (top 10 / no top 10)
  - Esquema de comisión aplicable
El sistema determina automáticamente el esquema:
  - Broker = null → "Recursos propios"
  - Broker.clasificacion = "Top 10" → "Broker top 10"
  - Broker.clasificacion = "No top 10" → "Broker no top 10"
        ↓
[HANDOFF A LEGAL]
Igual al Escenario A
La documentación del cliente se pide a través del broker o directamente según el caso
        ↓
Al cerrar:
Sistema calcula comisión del LO Y comisión del broker según su esquema
Comisión del broker queda registrada como pendiente de pago
```

---

### Historias de Usuario — Escenario B

**US-COM-009**
```
COMO Leasing Officer
QUIERO registrar un lead proveniente de un broker
PARA vincular correctamente la operación y asegurar el cálculo correcto de comisiones

Criterios de aceptación:
- Puedo seleccionar "Broker" como canal de origen
- El sistema me pide seleccionar o crear el broker
- Al crear el broker, le asigno su clasificación (top 10 / no top 10)
- La clasificación del broker determina automáticamente el esquema de comisión en la Hoja de Acuerdos
- El broker puede estar vinculado a múltiples oportunidades históricas
```

**US-COM-010**
```
COMO Director Comercial (CEM)
QUIERO ver un ranking de brokers por operaciones cerradas y comisiones generadas
PARA saber cuáles son los más activos y revisar si alguno debe reclasificarse (top 10 / no top 10)

Criterios de aceptación:
- Vista de brokers ordenada por: operaciones cerradas (último año) y comisiones totales
- Puedo cambiar la clasificación de un broker desde esa vista
- El sistema registra cuándo y quién cambió la clasificación
```

---

## ESCENARIO C — LEAD PERDIDO Y NURTURING

### Sub-escenarios

#### C1 — Lead no calificado
```
El prospecto no tiene necesidad clara o no cumple criterios mínimos
        ↓
LO marca el lead como "No calificado" con razón:
  - "M² fuera de rango no disponible"
  - "Ubicación no operamos"
  - "Plazo demasiado corto (menos de 12 meses)"
  - "Sin capacidad financiera aparente"
  - "Sector no compatible"
  - "No responde"
        ↓
Lead queda archivado — no genera tarea futura
```

#### C2 — Oportunidad perdida contra competencia
```
El cliente eligió a otro operador de parques industriales
        ↓
LO marca la oportunidad como "Perdida"
Sistema obliga a registrar:
  - Razón de pérdida
  - Competidor que ganó (lista: Prologis / Vesta / Finsa / Vynmsa / American Industries / Otro)
        ↓
Esta información alimenta el reporte de inteligencia de mercado
No genera tarea futura de reactivación
```

#### C3 — Oportunidad pospuesta (reactivación futura)
```
El cliente interesa pero pospone su decisión
        ↓
LO marca la oportunidad como "Perdida — Pospuesto"
LO registra:
  - Fecha estimada de reactivación (mes/año)
  - Razón del pospuesto
        ↓
Sistema crea tarea automática para la fecha de reactivación:
"Recontactar a [Empresa] — habían pospuesto su búsqueda de nave"
        ↓
En la fecha de reactivación:
  - LO recibe la tarea
  - Si hay disponibilidad que coincide: el sistema resalta la oportunidad con bandera verde
  - LO reactiva la oportunidad y regresa a Etapa 2
```

#### C4 — Reactivación automática por disponibilidad
```
Una nave se libera (cliente salió o nueva nave disponible)
        ↓
Sistema busca en oportunidades perdidas:
  ¿Hay alguna oportunidad "Perdida — Sin disponibilidad" 
  cuyos m² y ubicación coinciden con esta nave liberada?
        ↓
  SÍ → Sistema crea tarea al LO que manejaba esa oportunidad:
       "La nave [X] en [Parque] está disponible — [Empresa] la buscaba. Recontactar."
        ↓
LO reactiva la oportunidad si el cliente sigue interesado
```

---

### Historias de Usuario — Escenario C

**US-COM-011**
```
COMO Leasing Officer
QUIERO registrar por qué se perdió una oportunidad
PARA que el equipo tenga inteligencia de mercado y yo pueda reactivarla en el futuro

Criterios de aceptación:
- Al marcar "Perdida" el sistema obliga a seleccionar razón y sub-tipo (competencia / pospuesto / sin disponibilidad)
- Si es "Pospuesto", el sistema me pide una fecha estimada de reactivación
- Si es "Competencia", el sistema me pide registrar qué competidor ganó
- Las oportunidades pospuestas generan tarea automática en la fecha de reactivación
```

**US-COM-012**
```
COMO Leasing Officer
QUIERO recibir una alerta cuando se libere una nave que coincide con un prospecto que perdí
PARA recontactarlos antes que la competencia

Criterios de aceptación:
- Cuando una nave cambia a estatus "Disponible", el sistema cruza con oportunidades perdidas por falta de disponibilidad
- Si hay match de m² (±20%) y ubicación: el sistema me notifica con el nombre de la empresa y los detalles
- La notificación incluye el historial de la oportunidad anterior para contexto
```

---

## ESCENARIO D — RENOVACIÓN (LADO COMERCIAL)

```
[Trigger de renovación desde Legal]
Legal detecta contrato a 12 meses de vencer
Sistema crea automáticamente una Oportunidad de tipo "Renovación"
  vinculada al contrato activo del inquilino
        ↓
Sistema notifica al LO que tiene asignada esa cuenta:
"El contrato de [Empresa] en [Nave / Parque] vence el [fecha]. 
 Iniciar proceso de renovación."
        ↓
[ETAPA 1: Lead recibido (tipo Renovación)]
Tarea al LO: "Primer acercamiento con el cliente sobre renovación"
        ↓
LO contacta al cliente para sondear intención de renovar
LO registra resultado:
  - "Quiere renovar" → avanza
  - "Evalúa opciones" → avanza con seguimiento intensivo
  - "No quiere renovar" → marcar como "Terminación anticipada" y notificar a Legal
        ↓
[ETAPA 2: Calificado (tipo Renovación)]
LO identifica si el cliente quiere:
  - Mismas condiciones (simplificado)
  - Nuevas condiciones (precio, m², plazo)
  - Expansión (más m² en el mismo u otro parque) → puede derivar en oportunidad nueva adicional
        ↓
[ETAPA 3-4: Negociación de condiciones de renovación]
LO negocia las nuevas condiciones:
  - Nueva renta por m² (sujeta a INPC + posible ajuste negociado)
  - Nuevo plazo
  - Período de gracia adicional (si el cliente pide)
  - Condiciones especiales
        ↓
REGLA NEGOCIO: si la nueva renta es menor al INPC aplicable → requiere aprobación del CEM
REGLA NEGOCIO: si hay condonación de rentas o descuento significativo → requiere aprobación del CEO
        ↓
[ETAPA 6: Hoja de Acuerdos de Renovación]
LO genera la Hoja de Acuerdos con las nuevas condiciones
El sistema distingue automáticamente que es una renovación (tipo: "Convenio de renovación")
SLA en Legal para renovación: 45 días hábiles (no 60)
        ↓
[HANDOFF A LEGAL]
Sistema notifica a Legal con la Hoja de Acuerdos de Renovación
Inicia SLA de 45 días
```

### Alertas automáticas de renovación

```
12 meses antes del vencimiento:
  → Notificación al LO: "Iniciar proceso de renovación con [Empresa]"
  → Creación automática de oportunidad tipo Renovación

6 meses sin actividad registrada en la oportunidad de renovación:
  → Escalamiento al CEM: "[Empresa] vence en 6 meses sin avance en negociación"

3 meses antes del vencimiento sin Hoja de Acuerdos firmada:
  → Alerta urgente al CEM y al Director Legal

1 mes antes del vencimiento sin contrato en proceso:
  → Alerta crítica — riesgo de holdover
  → Notificación al CEO

Contrato vencido sin renovación firmada:
  → Holdover activado — notificación a Legal y CxC
  → La oportunidad de renovación permanece abierta con estatus crítico
```

---

### Historias de Usuario — Escenario D

**US-COM-013**
```
COMO Leasing Officer
QUIERO recibir una alerta cuando un contrato está próximo a vencer
PARA iniciar el proceso de renovación con suficiente anticipación

Criterios de aceptación:
- Recibo alerta automática 12 meses antes del vencimiento
- La alerta incluye: nombre del cliente, nave, parque, fecha de vencimiento, condiciones actuales del contrato
- El sistema crea automáticamente la oportunidad de renovación vinculada al contrato
- Puedo ver el historial completo del cliente (contratos anteriores, condiciones históricas)
```

**US-COM-014**
```
COMO Leasing Officer
QUIERO registrar el resultado del acercamiento de renovación con el cliente
PARA que Legal y el CEM sepan el estatus en tiempo real

Criterios de aceptación:
- Puedo registrar: "Quiere renovar / Evaluando opciones / No quiere renovar"
- Si "No quiere renovar": el sistema notifica a Legal para preparar proceso de terminación
- Cada contacto con el cliente queda registrado como actividad con fecha, medio y resultado
- Si el cliente quiere expandir m²: puedo crear una oportunidad nueva vinculada sin perder el historial
```

---

## ESCENARIO E — BUILD-TO-SUIT

```
El cliente requiere una nave construida a su medida
Especificaciones técnicas particulares que no cubre el inventario actual
        ↓
LO registra la oportunidad con tipo_operacion = "Build-to-suit"
Campos adicionales activos para build-to-suit:
  - especificaciones_tecnicas (texto largo)
  - altura_requerida (número)
  - andenes_requeridos (número)
  - potencia_electrica_requerida (número)
  - carga_piso_requerida (número)
  - requisitos_especiales (texto: cámara refrigeración, piso epóxico, etc.)
  - nave_a_construir (texto: se creará objeto Nave al confirmar)
  - fecha_estimada_entrega_obra (fecha)
        ↓
LO involucra al equipo de construcción (Tenant / PHH) para validar viabilidad y costo
        ↓
El proceso comercial sigue igual que Escenario A pero con estas diferencias:
  - El tour es al terreno disponible, no a una nave existente
  - La cotización incluye el costo de construcción o las especificaciones de lo que Parks construirá
  - La negociación puede durar más tiempo por complejidad técnica
  - El plazo del contrato suele ser mayor (10+ años)
        ↓
[ETAPA 6: Hoja de Acuerdos — Build-to-suit]
La Hoja incluye un anexo de especificaciones técnicas
        ↓
[HANDOFF A LEGAL]
SLA en Legal para build-to-suit: 90 días hábiles (no 60)
El contrato incluye anexos técnicos de construcción
```

---

### Historias de Usuario — Escenario E

**US-COM-015**
```
COMO Leasing Officer
QUIERO registrar una oportunidad de build-to-suit con sus especificaciones técnicas
PARA que Legal y el equipo de construcción tengan la información exacta desde el inicio

Criterios de aceptación:
- Al seleccionar tipo "Build-to-suit" se activan campos adicionales de especificaciones técnicas
- El SLA en Legal se asigna automáticamente como 90 días (no 60)
- El sistema me avisa que este tipo de operación puede tomar más tiempo en todas las etapas
- Puedo adjuntar documentos de especificaciones técnicas a la oportunidad
```

---

## ESCENARIO F — CLIENTE CON MÚLTIPLES CONTRATOS

```
Un mismo cliente (empresa) tiene o busca rentar en más de una nave o parque
        ↓
En el sistema: un solo registro de Cuenta (Inquilino)
con múltiples Oportunidades y múltiples Contratos vinculados
        ↓
REGLA: el mismo LO atiende TODAS las oportunidades y contratos del mismo cliente
para dar una experiencia unificada
        ↓
El LO ve en la vista de la Cuenta:
  - Todos los contratos activos del cliente (naves, parques, montos, vencimientos)
  - Todas las oportunidades en proceso
  - Historial completo de interacciones
  - Estado de pagos (dato que llega de Oracle vía integración)
        ↓
Si el cliente quiere expandir a una nave adicional:
  - LO crea una nueva Oportunidad vinculada a la misma Cuenta
  - El historial del cliente es contexto para la nueva negociación
```

---

### Historias de Usuario — Escenario F

**US-COM-016**
```
COMO Leasing Officer
QUIERO ver todo el historial de un cliente en una sola vista
PARA entender la relación completa antes de negociar una expansión o renovación

Criterios de aceptación:
- En la vista de Cuenta veo: contratos activos, oportunidades en proceso, historial de interacciones
- Veo el estado de pagos del cliente (al corriente / con adeudos) — dato de Oracle
- Veo si el cliente tiene contratos en propiedades FUNO (afecta comisiones)
- Puedo crear una nueva oportunidad desde la vista de Cuenta sin perder el contexto histórico
```

---

## ESCENARIO G — CHECKLIST DE DOCUMENTACIÓN DEL CLIENTE (HANDOFF A LEGAL)

```
Cuando la Hoja de Acuerdos se marca como "Firmada"
el sistema activa automáticamente el Checklist de Documentación
        ↓
El LO ve en su tarea:
"Recopilar y entregar a Legal la siguiente documentación en 5 días hábiles:"

CHECKLIST:
□ Acta constitutiva
□ Poder notarial del representante legal
□ Comprobante de domicilio fiscal
□ INE del representante legal
□ Constancia de Situación Fiscal (CSF)
□ Constancia de cumplimiento de obligaciones
□ Estados financieros auditados (obligado solidario)
□ Garantía: carta de crédito / fianza / garantía corporativa

        ↓
El LO va marcando cada ítem conforme lo recopila
        ↓
REGLA: La oportunidad NO puede pasar a Etapa 7 si el checklist no está al 100%
        ↓
Si el checklist no está completo en 5 días:
  - Escalamiento automático al CEM
  - Alerta a Legal: "Documentación pendiente — SLA en espera"
```

---

### Historias de Usuario — Escenario G

**US-COM-017**
```
COMO Leasing Officer
QUIERO saber exactamente qué documentos necesito recopilar del cliente para pasarlos a Legal
PARA no retrasar el proceso contractual

Criterios de aceptación:
- Al firmar la Hoja de Acuerdos aparece automáticamente el checklist de documentación
- Puedo marcar cada ítem conforme lo recibo
- Puedo adjuntar los documentos directamente al checklist
- Si no completo el checklist en 5 días, el CEM recibe una alerta
- Legal recibe notificación inmediata cuando el checklist está al 100%
- La oportunidad no puede avanzar a Etapa 7 mientras el checklist esté incompleto
```

---

## AUTOMATIZACIONES REQUERIDAS

```javascript
// AUTOMATION 1: Tarea de primer contacto
trigger: Lead.estatus == "Asignado"
action: crear_tarea(
  asignado_a: lead.leasing_officer,
  descripcion: "Contactar a [Empresa] — lead nuevo asignado",
  fecha_vencimiento: ahora + 24_horas,
  prioridad: "Alta"
)

// AUTOMATION 2: Seguimiento post-cotización
trigger: Oportunidad.etapa == "Cotización enviada"
action: crear_tarea(
  asignado_a: oportunidad.leasing_officer,
  descripcion: "Dar seguimiento a cotización enviada a [Empresa]",
  fecha_vencimiento: ahora + 5_días_hábiles,
  prioridad: "Media"
)

// AUTOMATION 3: Seguimiento post-tour
trigger: Oportunidad.etapa cambia_a "Tour realizado"
action: crear_tarea(
  asignado_a: oportunidad.leasing_officer,
  descripcion: "Seguimiento post-tour con [Empresa]",
  fecha_vencimiento: ahora + 48_horas,
  prioridad: "Alta"
)

// AUTOMATION 4: Handoff a Legal
trigger: Hoja_de_Acuerdos.estatus == "Firmada" AND checklist_completo == true
action: [
  crear_caso_legal(oportunidad, tipo_sla),
  notificar(equipo_legal, datos_oportunidad + datos_contacto_cliente),
  iniciar_contador_sla(tipo_contrato),
  crear_tarea(leasing_officer, "Entregar documentación a Legal", ahora + 5_días_hábiles),
  cambiar_etapa_oportunidad("En proceso legal")
]

// AUTOMATION 5: Alertas de renovación
trigger: Contrato.fecha_vencimiento - hoy == 365_días (12 meses)
action: [
  crear_oportunidad_renovacion(inquilino, contrato),
  notificar(leasing_officer, "Iniciar renovación con [Empresa]"),
  crear_tarea(leasing_officer, "Primer acercamiento de renovación", ahora + 3_días)
]

trigger: Oportunidad_renovacion.dias_sin_actividad >= 30 AND meses_para_vencimiento <= 6
action: notificar(cem, "ALERTA: Renovación de [Empresa] sin avance — vence en 6 meses")

trigger: Contrato.fecha_vencimiento - hoy == 90_días
action: notificar([cem, director_legal], "URGENTE: [Empresa] vence en 90 días sin renovación firmada")

trigger: Contrato.fecha_vencimiento - hoy == 30_días
action: notificar([cem, director_legal, ceo], "CRÍTICO: [Empresa] vence en 30 días — riesgo de holdover")

// AUTOMATION 6: Reactivación por disponibilidad
trigger: Nave.estatus cambia_a "Disponible"
action: 
  buscar oportunidades donde:
    estatus == "Perdida" AND 
    razon == "Sin disponibilidad" AND
    metros_cuadrados >= nave.metros * 0.8 AND
    metros_cuadrados <= nave.metros * 1.2 AND
    ubicacion == nave.parque.estado
  para cada resultado:
    notificar(leasing_officer, 
      "La nave [nave.nombre] acaba de quedar disponible — [Empresa] la buscaba")

// AUTOMATION 7: Oportunidad sin actividad
trigger: Oportunidad.etapa NOT IN ["Ganada", "Perdida", "En proceso legal"]
         AND Oportunidad.ultima_actividad < ahora - 15_días
action: crear_tarea(
  asignado_a: oportunidad.leasing_officer,
  descripcion: "ATENCIÓN: [Empresa] lleva 15 días sin actividad en el pipeline",
  prioridad: "Alta"
)

// AUTOMATION 8: Reactivación programada
trigger: Oportunidad.fecha_reactivacion == hoy
         AND Oportunidad.estatus == "Perdida — Pospuesto"
action: [
  notificar(leasing_officer, "HOY: Recontactar a [Empresa] — habían pospuesto su búsqueda"),
  crear_tarea(leasing_officer, "Reactivar oportunidad con [Empresa]", hoy)
]
```

---

## REGLAS DE NEGOCIO Y VALIDACIONES

```
REGLA 1 — Avance de etapa bloqueado:
  Etapa 2 (Calificado) requiere: m² requeridos + ubicación + giro + plazo + presupuesto
  Etapa 3 (Tour) requiere: nave de interés vinculada o motivo sin nave
  Etapa 4 (Cotización) requiere: precio/m² + condiciones base completas
  Etapa 6 (Hoja de Acuerdos) requiere: aprobaciones pendientes resueltas
  Etapa 7 (En proceso legal) requiere: checklist de documentación al 100%

REGLA 2 — Comisiones:
  Si nave.es_propiedad_funo == true → NO calcular comisión interna
  Si broker != null Y broker.clasificacion == "Top 10" → esquema "Broker top 10"
  Si broker != null Y broker.clasificacion == "No top 10" → esquema "Broker no top 10"
  Si broker == null → esquema "Recursos propios"

REGLA 3 — SLA en Legal (determinado por tipo de oportunidad):
  tipo_operacion == "Nave disponible" Y tipo == "Nuevo" → SLA: 60 días
  tipo_operacion == "Renovación" → SLA: 45 días
  tipo_operacion == "Build-to-suit" → SLA: 90 días

REGLA 4 — Aprobaciones requeridas:
  Descuento < [umbral menor] → aprueba CEM
  Descuento >= [umbral mayor] O condición significativa → aprueba CEO
  [Nota: umbrales exactos a definir con Héctor Montelongo antes de implementar]

REGLA 5 — Asignación:
  Todos los leads pasan por el CEM para asignación manual
  No hay asignación automática por zona — todos los LOs pueden atender cualquier parque

REGLA 6 — Prospectos perdidos:
  No se pueden eliminar del sistema — solo archivar con razón
  Los pospuestos generan tarea futura obligatoria

REGLA 7 — Oportunidades de renovación:
  Una oportunidad de renovación sin avance a 90 días del vencimiento
  bloquea al LO en su dashboard con alerta roja hasta que registre actividad
```

---

## DASHBOARDS Y REPORTES COMERCIALES

### Dashboard del Leasing Officer
```
- Mis leads activos por etapa (kanban o lista)
- Mis tareas pendientes por prioridad y fecha
- Mis oportunidades sin actividad en +15 días (alerta)
- Mis renovaciones activas con semáforo de tiempo
- Mi pipeline total en m² y en USD
```

### Dashboard del Director Comercial (CEM)
```
- Pipeline del equipo completo por etapa y por LO
- Leads sin asignar (pendientes de asignación)
- Oportunidades en riesgo (+15 días sin actividad)
- Renovaciones críticas del equipo (próximas a vencer sin Hoja firmada)
- Aprobaciones pendientes (descuentos o condiciones especiales)
- Conversión por canal de origen (de dónde vienen los mejores leads)
- Comparativa de desempeño por LO (m² cerrados, tiempo promedio de ciclo)
```

### Dashboard Ejecutivo (CEO)
```
- % Ocupación total de todos los parques
- M² rentados vs prospectados vs en construcción (actual vs mes anterior vs mismo mes año anterior)
- Pipeline activo en m² y en valor USD
- Contratos por vencer próximos 30 / 60 / 90 / 180 días
- Comisiones generadas en el período
- Oportunidades perdidas y razones (inteligencia competitiva)
- Top brokers por operaciones cerradas
- Tiempo promedio de ciclo de venta del equipo
```

### Reportes automáticos
```
- Reporte mensual comparativo de m² (genera y envía automáticamente el día 1 del mes)
- Reporte semanal de pipeline al CEM (lunes por la mañana)
- Reporte de leads sin actividad (viernes, al CEM)
- Reporte de renovaciones a 12 meses (mensual, al CEM y al Director Legal)
```

---

## PUNTO DE HANDOFF COMERCIAL → LEGAL

Este es el evento que conecta ambos módulos:

```
TRIGGER: Hoja de Acuerdos marcada como "Firmada por cliente" 
         AND checklist de documentación al 100%

ACCIONES EN CASCADA:
1. Oportunidad avanza a Etapa 7 "En proceso legal"
2. Se crea un Caso Legal con:
   - Tipo de documento (Contrato nuevo / Renovación / Build-to-suit)
   - SLA correspondiente (60 / 45 / 90 días)
   - Datos del inquilino con CONTACTOS (nombre, correo, teléfono) ← dato crítico que hoy falta
   - Datos de la nave (incluyendo flag FUNO)
   - Condiciones de la Hoja de Acuerdos
   - Documentación adjunta
   - Broker (si aplica) con clasificación y esquema de comisión
3. Notificación a Legal con toda la información
4. El LO ve el semáforo del caso pero no puede modificar nada en Legal

DATOS MÍNIMOS QUE DEBE INCLUIR LA NOTIFICACIÓN A LEGAL:
- Razón social del inquilino
- RFC del inquilino
- Nombre del representante legal
- Correo del representante legal ← hoy no llega en el ticket manual
- Teléfono del contacto ← hoy no llega en el ticket manual
- Nave y parque
- Precio/m², m², renta mensual, plazo
- Período de gracia
- Depósito en garantía
- Escalación (INPC o fijo)
- Tipo de operación (nave disponible / build-to-suit)
- Flag FUNO (sí/no)
- Broker (nombre, empresa, clasificación) si aplica
- Condiciones especiales acordadas
- Lista de documentos adjuntos
```

---

## NOTAS DE IMPLEMENTACIÓN PARA CURSOR

```
1. OBJETOS BASE YA EXISTENTES EN EL CRM:
   - Account (Cuenta) → usar para Inquilino y Broker (diferenciar con campo "tipo_cuenta")
   - Contact (Contacto) → representantes del cliente y contactos del broker
   - Lead → adaptar con campos custom de parques industriales
   - Opportunity (Oportunidad) → adaptar pipeline stages y campos custom
   - Activity / Task → ya existente, usar para registro de interacciones
   - User → para LOs, CEM y CEO

2. OBJETOS CUSTOM NUEVOS A CREAR:
   - Parque__c
   - Nave__c
   - Broker__c (o usar Account con tipo = Broker)
   - Hoja_de_Acuerdos__c
   - Checklist_Documentacion__c

3. INTEGRACIONES EXTERNAS:
   - Power BI / Oracle → inventario de naves disponibles (fuente a confirmar)
   - Oracle → estado de pagos del cliente (lectura)
   - Módulo Legal → handoff automático al cerrar Hoja de Acuerdos

4. MONEDA:
   - Confirmar con Parks Industrial si precios son en USD o MXN
   - ALLUX (empresa hermana) usa MXN — pero industrial típicamente cotiza en USD

5. PORCENTAJES DE COMISIÓN:
   - Los 3 esquemas de comisión están definidos (propios / broker top10 / broker no top10)
   - Los porcentajes exactos están pendientes de confirmación con Héctor Montelongo
   - El motor de comisiones debe ser configurable sin cambios de código

6. REFERENCIA DE UI:
   - La empresa hermana ALLUX tiene implementado el módulo "Comité ALLUX" en Salesforce
   - Los campos de ese módulo son la referencia más directa para el formulario de Hoja de Acuerdos
   - Campos confirmados: portafolio, parque, cotización, nombre comercio, giro, nomenclatura nave, 
     GLA, costo m², renta mensual, % incremento, moneda, plazo, prórroga, guante, depósito, 
     rentas adelantadas, período de gracia, razón social, broker, condiciones especiales

7. DATOS PARA LA DEMO:
   Use estos datos de ejemplo al poblar la demo:
   
   Parque: Parks Industrial Guadalajara Norte
   Nave disponible: BOD-GDL-N-01 | 5,000 m² | $85 USD/m² | 12 andenes | Propiedad propia
   
   Inquilino caso 1: LogiMex S.A. de C.V. | Logística | Busca 5,000 m² | Presupuesto $450K MXN/mes
   Inquilino caso 2: KoreaManuf S.A. de C.V. | Manufactura (nearshoring) | 12,000 m² build-to-suit
   Inquilino caso 3: Cliente activo con renovación venciendo en 8 meses
   
   Broker caso 2: Christian Lua | Empresa broker | Clasificación: Top 10
   
   LOs de demo: LO1 (Alejandro García), LO2 (María Torres), LO3 (Carlos Mendoza)
   CEM: Héctor Montelongo
```

---

*Documento preparado por Bridge Studio — Julio 2026*
*Base de implementación para demo Salesforce CRM — Parks Industrial*
*Versión 1.0 — Área Comercial completa*
