# Parks Industrial — Twenty CRM Blueprint
## Integración completa: Pipeline Comercial + Legal + Holdover + Comisiones + Onboarding

> **Generado por:** The Architect — Bridge Studio  
> **Versión:** 1.1 — Actualizado con documento maestro del proyecto  
> **Fecha:** Junio 2026  
> **Target:** Claude Code — ejecución autónoma completa  
> **Stack:** Twenty CRM (local) + Node.js/TypeScript Microservicio  
> **Cliente:** Parks Industrial

---

## CHANGELOG v1.1
- ✅ Agregado módulo de generación de PDF (reemplaza S-Docs de Salesforce)
- ✅ Agregado módulo de sincronización Oracle (bidireccional, REST API custom)
- ✅ CLAUDE.md actualizado con contactos, dependencias externas y scope explícito
- ✅ Aclarado origen del semáforo de 5 colores vs Excel de 4 colores
- ✅ Documentado que Account Engagement / Marketing está fuera de scope

---

## SECCIÓN 1 — VISIÓN GENERAL DEL SISTEMA

### Qué se construye
Un sistema CRM completo para Parks Industrial que replica y automatiza todos sus procesos de negocio dentro de **Twenty CRM** (self-hosted local), extendido con un **microservicio Node.js/TypeScript** que maneja la lógica de negocio compleja que Twenty no puede procesar nativamente.

Parks Industrial reemplaza Monday.com (seguimiento legal + comercial) y Excel (control de renovaciones con semáforo). Oracle ERP permanece y se integra de forma bidireccional.

### Arquitectura de alto nivel

```
┌─────────────────────────────────────────────────────────────┐
│                      TWENTY CRM (local)                      │
│                                                             │
│  Custom Objects    Pipelines      Workflows    Dashboards   │
│  ─────────────    ─────────      ─────────    ──────────   │
│  Parque            Comercial      Triggers     KPIs Legal   │
│  Nave              Legal          Webhooks     KPIs Comerc  │
│  Inquilino         Renovación     Automation   Semáforo     │
│  Expediente        Holdover                                  │
│  CasoLegal                                                  │
│  VersionDoc                                                 │
│  FlujoDeFirmas                                              │
│  HojaDeAcuerdos                                             │
│  Comision                                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ Webhooks (POST)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            MICROSERVICIO — Node.js + TypeScript              │
│                    (puerto 3001)                             │
│                                                             │
│  /webhooks/twenty     Recibe eventos de Twenty              │
│  /sla/tick            Cron: evalúa SLAs cada hora           │
│  /holdover/scan       Cron: detecta vencimientos diario     │
│  /comisiones/calc     Calcula comisiones al cierre          │
│  /semaforo/update     Actualiza colores de semáforo         │
│  /notificaciones/     Dispara tickets multi-área            │
│  /pdf/generar         Genera PDF de contrato desde plantilla│
│  /oracle/sync         Sincronización bidireccional Oracle   │
└──────────────┬──────────────────────────┬───────────────────┘
               │ GraphQL API              │ REST API custom
               ▼                          ▼
       Twenty Metadata API          Oracle ERP (externo)
       Twenty Data API              (Javier — Bridge)
```

### Principio de diseño
- **Twenty** es la fuente de verdad, la UI y el almacenamiento
- **El microservicio** es el motor de reglas: SLAs, semáforos, holdover, comisiones, notificaciones, PDF y sincronización Oracle
- Todo cambio de estado pasa por Twenty — el microservicio nunca bypasea la UI
- Los webhooks de Twenty disparan la lógica — la lógica escribe de regreso a Twenty vía GraphQL
- **Oracle ERP permanece** — no se reemplaza. El microservicio actúa como puente bidireccional

### Fuera de scope de esta implementación
- **Account Engagement / Marketing automation** — Parks Industrial lo contempla pero es un módulo separado. No se implementa en este proyecto de Twenty.
- **S-Sign / DocuSign** — El CEO tiene directiva de firmas autógrafas físicas. Twenty gestiona seguimiento, no firma digital.
- **Portal para brokers** — Los brokers externos no tienen acceso al sistema. Solo reciben su pago.

---

## SECCIÓN 2 — CUSTOM OBJECTS EN TWENTY

Estos son los objetos que Claude Code debe crear vía la **Metadata API de Twenty** (`/metadata`).

### 2.1 Parque

```
Object: parque
Singular: Parque
Plural: Parques
Icon: building-2

Fields:
  nombre          Text        required
  ubicacion       Text        required  (estado / corredor industrial)
  m2_totales      Number      
  m2_rentados     Number      (calculado — suma de naves rentadas)
  administrador   Text        
  estatus         Select      [Activo, Inactivo]
```

### 2.2 Nave

```
Object: nave
Singular: Nave
Plural: Naves
Icon: warehouse

Fields:
  identificador     Text      required  (ej: "NVA-GDL-001")
  m2               Number    required
  altura_libre_m   Number    
  andenes          Number    
  carga_piso_ton   Number    
  potencia_kva     Number    
  oficinas_m2      Number    
  estatus          Select    [Disponible, En negociación, Rentada, En construcción]
  es_propiedad_funo Boolean  default: false   ← CRÍTICO para comisiones
  parque           Relation  → Parque
  precio_base_usd  Number    (USD/m²/mes)
  oracle_nave_id   Text      (ID de referencia en Oracle — para sincronización)
```

### 2.3 Inquilino

```
Object: inquilino
Singular: Inquilino
Plural: Inquilinos
Icon: building

Fields:
  empresa             Text      required
  rfc                 Text      
  sector              Select    [Manufactura, Logística, Distribución, E-commerce, 
                                 Farmacéutica, Automotriz, Tecnología, Otro]
  contacto_principal  Text      
  email_contacto      Text      
  telefono            Text      
  estatus             Select    [Prospecto, Activo, En renovación, En holdover, Inactivo]
  rep_legal_nombre    Text      
  rep_legal_email     Text      
  oracle_cliente_id   Text      (ID de referencia en Oracle — para sincronización)
  ultimo_pago_fecha   Date      (sincronizado desde Oracle)
  pagos_al_corriente  Boolean   default: true (sincronizado desde Oracle)
```

### 2.4 Broker

```
Object: broker
Singular: Broker
Plural: Brokers
Icon: users

Fields:
  empresa         Text    required
  contacto        Text    
  email           Text    
  telefono        Text    
  firma           Select  [Newmark, CBRE, JLL, Cushman, Independiente, Otro]
  operaciones_cnt Number  (calculado)
```

### 2.5 HojaDeAcuerdos

```
Object: hoja_de_acuerdos
Singular: Hoja de Acuerdos
Plural: Hojas de Acuerdos
Icon: file-signature

Fields:
  fecha_firma           Date      required
  tipo_contrato         Select    [Arrendamiento nuevo, Renovación, Modificatorio, 
                                   Terminación anticipada, Build-to-suit]
  m2_acordados          Number    required
  precio_usd_m2         Number    required
  plazo_meses           Number    required
  fecha_inicio          Date      
  periodo_gracia_meses  Number    default: 0
  deposito_meses        Number    default: 1
  escalacion_anual_pct  Number    default: 0
  condiciones_especiales Text     
  broker_comision_pct   Number    
  broker_comision_monto Number    
  ejecutivo_asignado    Text      
  nave                  Relation  → Nave
  inquilino             Relation  → Inquilino
  broker                Relation  → Broker (nullable)
  aprobacion_requerida  Boolean   default: false
  aprobado_por          Select    [Pendiente, Director Comercial, CEO]
```

### 2.6 CasoLegal

```
Object: caso_legal
Singular: Caso Legal
Plural: Casos Legales
Icon: scale

Fields:
  tipo_documento        Select    [Contrato nuevo, Convenio renovación, 
                                   Convenio aclaración, Terminación anticipada, 
                                   Build-to-suit]
  abogado_asignado      Text      
  estatus               Select    [Nuevo, Documentación incompleta, En elaboración,
                                   Primera versión enviada, En negociación con cliente,
                                   Versión final aceptada, Cotejo pendiente, 
                                   Flujo de firmas, Firmado — cerrado, Cancelado]
  semaforo              Select    [Azul, Naranja, Amarillo, Verde, Rojo]
  fecha_hoja_acuerdos   Date      required   ← inicio del SLA
  sla_dias_habiles      Number    required   (60 / 45 / 90 según tipo)
  sla_fecha_limite      Date      (calculado por microservicio)
  dias_transcurridos    Number    (calculado por microservicio)
  documentacion_completa Boolean  default: false
  cotejo_aprobado       Boolean   default: false
  es_propiedad_funo     Boolean   default: false
  hoja_de_acuerdos      Relation  → HojaDeAcuerdos
  inquilino             Relation  → Inquilino
  nave                  Relation  → Nave
  notas_catalina        Text      
  pdf_borrador_url      Text      (ruta al PDF generado por el microservicio)
```

### 2.7 DocumentoChecklist

```
Object: documento_checklist
Singular: Documento Checklist
Plural: Documentos Checklist
Icon: checklist

Fields:
  tipo_documento    Select    [Acta constitutiva, Poder notarial, Comprobante domicilio,
                               INE representante, CSF, Constancia obligaciones,
                               Estados financieros, Info obligado solidario,
                               Garantía, NDA/Convenio confidencialidad]
  entregado         Boolean   default: false
  fecha_entrega     Date      
  observaciones     Text      
  caso_legal        Relation  → CasoLegal
```

### 2.8 VersionDocumento

```
Object: version_documento
Singular: Versión de Documento
Plural: Versiones de Documento
Icon: file-diff

Fields:
  numero_version      Number    required
  fecha_envio         Date      required
  enviado_por         Text      
  dirigido_a          Select    [Cliente, Broker, FUNO/NEXT, Subdirector Legal, CEO]
  respuesta_cliente   Select    [Pendiente, Aceptada, Modificaciones solicitadas, Rechazada]
  cambios_solicitados Text      
  es_version_final    Boolean   default: false
  pdf_url             Text      (ruta al PDF de esta versión)
  caso_legal          Relation  → CasoLegal
```

### 2.9 FlujoDeFirmas

```
Object: flujo_firmas
Singular: Flujo de Firmas
Plural: Flujos de Firmas
Icon: pen-tool

Fields:
  orden             Number    required   (1, 2, 3, 4)
  firmante          Text      required
  rol               Select    [Cliente, Subdirector Legal, Director General, 
                               Apoderado FUNO 1, Apoderado FUNO 2, Director Jurídico FUNO]
  estatus           Select    [Pendiente, Enviado, Firmado, Rechazado]
  fecha_envio       Date      
  fecha_firma       Date      
  es_externo        Boolean   default: false   (true para FUNO/NEXT)
  caso_legal        Relation  → CasoLegal
```

### 2.10 Holdover

```
Object: holdover
Singular: Holdover
Plural: Holdovers
Icon: alert-triangle

Fields:
  fecha_inicio_holdover     Date      required
  renta_base_mensual_usd    Number    required
  monto_holdover_mensual    Number    (calculado: renta_base × 2)
  facturas_emitidas         Number    default: 0
  corte_servicios_autorizado Boolean  default: false
  corte_autorizado_por      Text      
  fecha_corte_servicios     Date      
  condonacion_autorizada    Boolean   default: false
  condonacion_autorizada_por Text     
  monto_condonado           Number    
  resolucion                Select    [Activo, Renovado, Condonado, Corte aplicado]
  oracle_notificado         Boolean   default: false  (confirmación de sync a Oracle)
  caso_legal                Relation  → CasoLegal
  inquilino                 Relation  → Inquilino
  nave                      Relation  → Nave
```

### 2.11 Comision

```
Object: comision
Singular: Comisión
Plural: Comisiones
Icon: dollar-sign

Fields:
  tipo              Select    [Interna ejecutivo, Broker externo]
  beneficiario      Text      required
  monto_usd         Number    required
  base_calculo      Text      (descripción de cómo se calculó)
  estatus           Select    [Calculada, Aprobada, Pagada]
  aplica_funo       Boolean   default: false   (si true → no se genera)
  hoja_acuerdos     Relation  → HojaDeAcuerdos
  caso_legal        Relation  → CasoLegal
```

### 2.12 ExpedienteContrato

```
Object: expediente_contrato
Singular: Expediente de Contrato
Plural: Expedientes de Contrato
Icon: folder

Fields:
  numero_expediente     Text      (generado automáticamente: EXP-AÑO-###)
  fecha_apertura        Date      
  fecha_vencimiento     Date      required  ← crítico para alertas de renovación
  renta_mensual_usd     Number    (copia de hoja_acuerdos para acceso rápido)
  estatus               Select    [Activo, Archivado FUNO, Cerrado]
  notas                 Text      
  oracle_contrato_id    Text      (ID de referencia en Oracle)
  oracle_sincronizado   Boolean   default: false
  caso_legal            Relation  → CasoLegal      (1:1)
  inquilino             Relation  → Inquilino
  nave                  Relation  → Nave
```

---

## SECCIÓN 3 — PIPELINES EN TWENTY

### Pipeline 1: Proceso Comercial

**Nombre:** Pipeline Comercial Parks Industrial  
**Objeto vinculado:** Oportunidad (objeto nativo de Twenty, extendido con campos custom)

#### Campos custom adicionales en Oportunidad:

```
tipo_operacion      Select    [Arrendamiento nuevo, Renovación, Build-to-suit, 
                               Terminación anticipada]
m2_requeridos       Number    
nave_vinculada      Relation  → Nave
broker_vinculado    Relation  → Broker
inquilino_vinculado Relation  → Inquilino
condiciones_especiales Boolean
aprobacion_requerida Boolean
canal_origen        Select    [Directo, Broker, Digital, Referido]
```

#### Stages del pipeline:

| Stage | Nombre en Twenty | Probabilidad | Color |
|-------|-----------------|--------------|-------|
| 1 | Lead recibido | 10% | Gris |
| 2 | Calificado | 20% | Azul claro |
| 3 | Tour / Visita | 35% | Azul |
| 4 | Cotización enviada | 50% | Amarillo |
| 5 | En negociación | 65% | Naranja |
| 6 | Hoja de Acuerdos firmada | 85% | Verde claro |
| 7 | En proceso legal | 95% | Verde |
| 8 | Ganado — Contrato firmado | 100% | Verde oscuro |
| 9 | Perdido | 0% | Rojo |

---

### Pipeline 2: Proceso Legal

**Nombre:** Pipeline Legal Parks Industrial  
**Objeto vinculado:** CasoLegal (custom)

#### Semáforo — aclaración de colores

El semáforo del pipeline legal tiene **5 colores**, no 4. El Excel original de Parks Industrial tenía 4 colores (Azul, Naranja, Amarillo, Verde). El quinto color, **Rojo**, se agrega para el estado de holdover activo, que en Excel se gestionaba por separado y no era parte del semáforo de renovaciones.

| Color | Origen | Qué representa |
|-------|--------|----------------|
| 🔵 Azul | Excel original | Hoja de Acuerdos recibida — caso recién asignado |
| 🟠 Naranja | Excel original | Versión enviada al cliente — en revisión |
| 🟡 Amarillo | Excel original | Cliente próximo a salir — en riesgo |
| 🟢 Verde | Excel original | Contrato firmado — cerrado |
| 🔴 Rojo | Agregado en Twenty | Contrato vencido sin renovación — holdover activo |

#### Stages del pipeline legal:

| Stage | Nombre en Twenty | Semáforo |
|-------|-----------------|----------|
| 1 | Recibido — asignado | 🔵 Azul |
| 2 | Documentación incompleta | ⚪ Gris (bloqueado) |
| 3 | Elaborando borrador | 🔵 Azul |
| 4 | Primera versión enviada | 🟠 Naranja |
| 5 | Negociando versión | 🟠 Naranja |
| 6 | Versión final aceptada | 🟠 Naranja |
| 7 | Cotejo pendiente | 🟡 Amarillo |
| 8 | Flujo de firmas activo | 🟡 Amarillo |
| 9 | Firmado — cerrado | 🟢 Verde |
| 10 | Cancelado | ⚫ Negro |

---

### Pipeline 3: Renovaciones

**Nombre:** Pipeline Renovaciones  
**Objeto vinculado:** Oportunidad (tipo_operacion = "Renovación")

#### Stages con alertas automáticas:

| Stage | Trigger | Acción automática |
|-------|---------|------------------|
| Alerta 12 meses | 12m antes de vencimiento | Notificación a ejecutivo comercial |
| Alerta 6 meses | 6m sin actividad | Escalamiento a Director Comercial |
| Alerta 3 meses | Sin acuerdo | Alerta urgente + involucra CEO |
| Alerta 1 mes | Sin contrato | Alerta crítica — riesgo holdover |
| En negociación | Manual | Ejecutivo inicia negociación |
| Hoja firmada | Manual | Pase automático a Legal (SLA 45 días) |
| Renovado | Automático desde Legal | Cierre |
| Holdover activo | Automático por vencimiento | 🔴 Rojo — acción urgente |

---

### Pipeline 4: Holdovers

**Nombre:** Holdovers Activos  
**Objeto vinculado:** Holdover (custom)

#### Stages:

| Stage | Descripción |
|-------|-------------|
| Detectado | Vencimiento sin renovación — factura doble emitida |
| Notificado | Cliente notificado del holdover |
| Corte autorizado | Director General autorizó corte de servicios |
| Corte aplicado | Operaciones cortó agua/acceso |
| En negociación | Cliente reactivó proceso de renovación |
| Resuelto — renovado | Convenio de renovación firmado |
| Resuelto — salida | Cliente salió — nave regresa a disponible |
| Condonado | CEO autorizó condonación del holdover |

---

## SECCIÓN 4 — MICROSERVICIO NODE.JS/TYPESCRIPT

### Estructura de directorios

```
parks-twenty-service/
├── src/
│   ├── index.ts                      # Express app entry
│   ├── config/
│   │   ├── twenty.config.ts          # Twenty API keys, endpoints
│   │   └── oracle.config.ts          # Oracle API endpoint, auth
│   ├── webhooks/
│   │   ├── webhook.router.ts         # POST /webhooks/twenty
│   │   └── handlers/
│   │       ├── oportunidad.handler.ts
│   │       ├── caso-legal.handler.ts
│   │       ├── flujo-firmas.handler.ts
│   │       └── contrato.handler.ts
│   ├── services/
│   │   ├── twenty.client.ts          # GraphQL client para Twenty
│   │   ├── sla.service.ts            # Cálculo y tracking de SLAs
│   │   ├── semaforo.service.ts       # Lógica de semáforo
│   │   ├── holdover.service.ts       # Detección y gestión de holdovers
│   │   ├── comision.service.ts       # Cálculo de comisiones
│   │   ├── notificacion.service.ts   # Tickets multi-área
│   │   ├── checklist.service.ts      # Generación de checklists
│   │   ├── pdf.service.ts            # ← NUEVO: Generación de PDFs de contratos
│   │   ├── expediente.service.ts     # Apertura de expediente digital
│   │   └── oracle.service.ts         # ← NUEVO: Sincronización bidireccional Oracle
│   ├── crons/
│   │   ├── sla-ticker.cron.ts        # Cada hora: evalúa SLAs
│   │   ├── holdover-scanner.cron.ts  # Diario: detecta vencimientos
│   │   ├── renovacion-alerts.cron.ts # Diario: alertas de renovación
│   │   └── oracle-sync.cron.ts       # ← NUEVO: Sincronización Oracle (cada 4h)
│   ├── graphql/
│   │   ├── queries/                  # Queries GraphQL hacia Twenty
│   │   └── mutations/                # Mutations para actualizar Twenty
│   ├── templates/
│   │   ├── contrato-arrendamiento.hbs  # ← NUEVO: Plantilla Handlebars
│   │   ├── convenio-renovacion.hbs
│   │   ├── convenio-aclaracion.hbs
│   │   ├── terminacion-anticipada.hbs
│   │   └── build-to-suit.hbs
│   └── types/
│       └── parks.types.ts            # Interfaces TypeScript
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

### 4.1 Lógica de SLA

```typescript
// src/services/sla.service.ts

interface SLAConfig {
  'Contrato nuevo': 60;       // días hábiles
  'Renovación': 45;
  'Build-to-suit': 90;
  'Modificatorio': null;      // variable
  'Terminación anticipada': null;
}

// El microservicio:
// 1. Al recibir webhook de CasoLegal creado → calcula sla_fecha_limite
// 2. Cron cada hora → recalcula dias_transcurridos para todos los casos activos
// 3. Si dias_transcurridos > sla_dias_habiles → marca como vencido + alerta
// 4. Actualiza Twenty vía GraphQL mutation
```

**Cálculo de días hábiles:** Excluye sábados y domingos. Días festivos mexicanos configurables en `.env` como `DIAS_FESTIVOS_MX`.

---

### 4.2 Lógica de Semáforo

```typescript
// src/services/semaforo.service.ts

const calcularSemaforo = (caso: CasoLegal): Semaforo => {
  if (caso.estatus === 'Firmado — cerrado') return 'Verde';
  
  const pctSLA = caso.dias_transcurridos / caso.sla_dias_habiles;
  
  if (caso.holdover_activo) return 'Rojo';        // holdover — no existía en Excel
  if (caso.cliente_no_renueva) return 'Amarillo'; // cliente próximo a salir
  if (pctSLA >= 0.8) return 'Rojo';               // >80% SLA consumido
  if (pctSLA >= 0.5) return 'Naranja';            // >50% SLA consumido
  return 'Azul';                                   // Recién asignado / en tiempo
}
```

---

### 4.3 Lógica de Holdover

```typescript
// src/crons/holdover-scanner.cron.ts

// Cron diario a las 08:00 AM:
// 1. Consulta en Twenty todos los ExpedienteContrato activos
// 2. Para cada uno: verifica si fecha_vencimiento < hoy
// 3. Si vencido y sin CasoLegal de renovación firmado:
//    a. Crea objeto Holdover en Twenty
//    b. Calcula monto_holdover_mensual = renta_base × 2
//    c. Actualiza estatus Inquilino → "En holdover"
//    d. Actualiza Nave → semáforo rojo
//    e. Crea notificación a Legal (Catalina)
//    f. Crea notificación a Comercial (ejecutivo asignado)
//    g. Crea tarea en CxC para emitir factura de holdover
//    h. Notifica a Oracle del inicio de holdover (oracle.service.notifyHoldover)
```

---

### 4.4 Lógica de Comisiones

```typescript
// src/services/comision.service.ts

const calcularComisiones = async (hojaAcuerdos: HojaDeAcuerdos) => {
  const nave = await getNave(hojaAcuerdos.nave_id);
  
  // FUNO check — si la nave es FUNO, no se generan comisiones internas
  if (nave.es_propiedad_funo) {
    await createNote(hojaAcuerdos.id, 
      'Propiedad FUNO — comisión va directo a FIBRA. No aplica comisión interna.');
    return;
  }

  const valorTotalContrato = 
    hojaAcuerdos.precio_usd_m2 * 
    hojaAcuerdos.m2_acordados * 
    hojaAcuerdos.plazo_meses;

  // Comisión del ejecutivo comercial
  // ⚠️ COMISION_EJECUTIVO_PCT pendiente de confirmar con Parks Industrial
  // El documento maestro indica que las reglas de comisión deben ser
  // documentadas y firmadas por dirección antes de activar este módulo
  await createComision({
    tipo: 'Interna ejecutivo',
    beneficiario: hojaAcuerdos.ejecutivo_asignado,
    monto_usd: valorTotalContrato * parseFloat(process.env.COMISION_EJECUTIVO_PCT!),
    base_calculo: `${valorTotalContrato} USD × ${process.env.COMISION_EJECUTIVO_PCT}`,
    estatus: 'Calculada',
    aplica_funo: false,
  });

  // Comisión del broker (si aplica)
  if (hojaAcuerdos.broker_id && hojaAcuerdos.broker_comision_pct > 0) {
    await createComision({
      tipo: 'Broker externo',
      beneficiario: await getBrokerNombre(hojaAcuerdos.broker_id),
      monto_usd: valorTotalContrato * (hojaAcuerdos.broker_comision_pct / 100),
      base_calculo: `${valorTotalContrato} USD × ${hojaAcuerdos.broker_comision_pct}%`,
      estatus: 'Calculada',
      aplica_funo: false,
    });
  }
};
```

---

### 4.5 Módulo de Generación de PDF — NUEVO

Este módulo reemplaza la función que S-Docs cumpliría en Salesforce. Genera el borrador del contrato en PDF usando los datos del CasoLegal y plantillas Handlebars, renderizadas a PDF con Puppeteer.

```typescript
// src/services/pdf.service.ts

import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

interface PDFContext {
  casoLegal: CasoLegal;
  hojaAcuerdos: HojaDeAcuerdos;
  inquilino: Inquilino;
  nave: Nave;
  parque: Parque;
  broker?: Broker;
  fechaGeneracion: string;
  numeroVersion: number;
}

export const generarPDFContrato = async (ctx: PDFContext): Promise<string> => {
  // 1. Seleccionar plantilla según tipo de contrato
  const templateMap: Record<string, string> = {
    'Contrato nuevo':         'contrato-arrendamiento.hbs',
    'Convenio renovación':    'convenio-renovacion.hbs',
    'Convenio aclaración':    'convenio-aclaracion.hbs',
    'Terminación anticipada': 'terminacion-anticipada.hbs',
    'Build-to-suit':          'build-to-suit.hbs',
  };

  const templateFile = templateMap[ctx.casoLegal.tipo_documento];
  const templatePath = path.join(__dirname, '../../templates', templateFile);
  const templateSrc = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSrc);
  const html = template(ctx);

  // 2. Renderizar HTML a PDF con Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputDir = path.join(__dirname, '../../output/pdfs');
  fs.mkdirSync(outputDir, { recursive: true });
  
  const fileName = `${ctx.casoLegal.id}_v${ctx.numeroVersion}_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, fileName);

  await page.pdf({
    path: outputPath,
    format: 'Letter',
    margin: { top: '2cm', bottom: '2cm', left: '2.5cm', right: '2cm' },
    printBackground: true,
  });

  await browser.close();

  // 3. Actualizar CasoLegal en Twenty con la ruta del PDF
  await updateCasoLegal(ctx.casoLegal.id, { pdf_borrador_url: outputPath });

  return outputPath;
};
```

#### Estructura de las plantillas HBS

Las plantillas Handlebars deben contener el texto legal base de Parks Industrial con variables interpoladas:

```handlebars
<!-- templates/contrato-arrendamiento.hbs -->
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 2em; }
    .clausula { margin-bottom: 1.5em; }
    .partes { display: flex; justify-content: space-between; margin-top: 4em; }
  </style>
</head>
<body>
  <div class="header">
    <h2>CONTRATO DE ARRENDAMIENTO</h2>
    <p>Parks Industrial — {{parque.nombre}}</p>
  </div>

  <p>Contrato celebrado entre <strong>Parks Industrial S.A. de C.V.</strong> 
  como ARRENDADOR, y <strong>{{inquilino.empresa}}</strong>, 
  representada por <strong>{{inquilino.rep_legal_nombre}}</strong>, como ARRENDATARIO.</p>

  <div class="clausula">
    <strong>PRIMERA — OBJETO:</strong> El ARRENDADOR da en arrendamiento al ARRENDATARIO
    la nave industrial identificada como <strong>{{nave.identificador}}</strong>,
    con una superficie de <strong>{{hojaAcuerdos.m2_acordados}} m²</strong>,
    ubicada en {{parque.ubicacion}}.
  </div>

  <div class="clausula">
    <strong>SEGUNDA — VIGENCIA:</strong> El presente contrato tendrá una vigencia de
    <strong>{{hojaAcuerdos.plazo_meses}} meses</strong>,
    con inicio el <strong>{{hojaAcuerdos.fecha_inicio}}</strong>.
  </div>

  <div class="clausula">
    <strong>TERCERA — RENTA:</strong> La renta mensual acordada es de
    <strong>USD ${{hojaAcuerdos.precio_usd_m2}}/m²</strong>, equivalente a
    <strong>USD ${{rentaMensualTotal}}</strong> mensuales.
  </div>

  {{#if hojaAcuerdos.periodo_gracia_meses}}
  <div class="clausula">
    <strong>CUARTA — PERÍODO DE GRACIA:</strong> Se otorga un período de gracia de
    <strong>{{hojaAcuerdos.periodo_gracia_meses}} meses</strong> sin pago de renta.
  </div>
  {{/if}}

  <!-- Aquí irán el resto de las cláusulas estándar de Parks Industrial -->
  <!-- ⚠️ Claude Code: dejar espacio con comentario "INSERTAR CLÁUSULAS ESTÁNDAR" -->
  <!-- Las cláusulas reales las proporcionará Catalina al iniciar Fase 4 -->

  <div class="partes">
    <div>
      <p>_______________________</p>
      <p>Parks Industrial S.A. de C.V.</p>
    </div>
    <div>
      <p>_______________________</p>
      <p>{{inquilino.empresa}}</p>
      <p>{{inquilino.rep_legal_nombre}}</p>
    </div>
  </div>

  <p style="font-size:9pt; color:#666; margin-top:3em;">
    Generado el {{fechaGeneracion}} — Versión {{numeroVersion}} — Borrador sujeto a revisión legal
  </p>
</body>
</html>
```

> ⚠️ **Nota para Claude Code:** Las plantillas `.hbs` deben crearse con estructura completa pero con un bloque comentado `<!-- INSERTAR CLÁUSULAS ESTÁNDAR DE PARKS INDUSTRIAL -->` donde irá el cuerpo legal real. Catalina proporcionará el texto de las cláusulas en la Fase 4 del proyecto real. Para la demo, usar texto placeholder que indique claramente que es un borrador.

#### Dependencias adicionales para PDF

```bash
npm install puppeteer handlebars
npm install @types/handlebars --save-dev
```

---

### 4.6 Módulo de Sincronización Oracle — NUEVO

Este módulo gestiona la integración bidireccional entre el microservicio y Oracle ERP. 

> ⚠️ **Dependencia crítica:** La implementación real de este módulo requiere la documentación de endpoints de Oracle proporcionada por el equipo técnico de Parks Industrial. Para la demo, el módulo se implementa en **modo mock** — simula las respuestas de Oracle con datos ficticios pero mantiene la misma interfaz que usará en producción.

```typescript
// src/services/oracle.service.ts

const ORACLE_BASE_URL = process.env.ORACLE_API_URL;
const ORACLE_API_KEY  = process.env.ORACLE_API_KEY;
const ORACLE_MOCK     = process.env.ORACLE_MOCK === 'true'; // true en demo

// ─── ORACLE → TWENTY ────────────────────────────────────────────────────────

/**
 * Sincroniza pagos realizados por inquilinos desde Oracle hacia Twenty.
 * Oracle es la fuente de verdad para pagos — Twenty solo lee.
 */
export const syncPagosDesdeOracle = async (): Promise<void> => {
  if (ORACLE_MOCK) {
    console.log('[Oracle MOCK] syncPagosDesdeOracle — simulando pagos al corriente');
    return;
  }

  // GET /oracle/api/pagos?desde=<ultima_sync>
  const response = await axios.get(`${ORACLE_BASE_URL}/pagos`, {
    headers: { Authorization: `Bearer ${ORACLE_API_KEY}` },
    params: { desde: await getUltimaSyncFecha() }
  });

  for (const pago of response.data.pagos) {
    // Actualizar campo pagos_al_corriente en Inquilino en Twenty
    const inquilino = await findInquilinoByOracleId(pago.cliente_id);
    if (inquilino) {
      await updateInquilino(inquilino.id, {
        ultimo_pago_fecha: pago.fecha,
        pagos_al_corriente: pago.al_corriente,
      });
    }
  }
};

/**
 * Sincroniza disponibilidad de naves desde Oracle hacia Twenty.
 * Oracle tiene el inventario maestro de propiedades.
 */
export const syncDisponibilidadNaves = async (): Promise<void> => {
  if (ORACLE_MOCK) {
    console.log('[Oracle MOCK] syncDisponibilidadNaves — sin cambios simulados');
    return;
  }

  // GET /oracle/api/naves/disponibilidad
  const response = await axios.get(`${ORACLE_BASE_URL}/naves/disponibilidad`, {
    headers: { Authorization: `Bearer ${ORACLE_API_KEY}` }
  });

  for (const nave of response.data.naves) {
    const naveEnTwenty = await findNaveByOracleId(nave.nave_id);
    if (naveEnTwenty) {
      await updateNave(naveEnTwenty.id, { estatus: mapOracleStatus(nave.estatus) });
    }
  }
};

// ─── TWENTY → ORACLE ────────────────────────────────────────────────────────

/**
 * Notifica a Oracle cuando se cierra un contrato nuevo.
 * Oracle actualiza la nave de "Disponible" a "Rentada" en su inventario.
 */
export const notifyContratoFirmado = async (expediente: ExpedienteContrato): Promise<void> => {
  if (ORACLE_MOCK) {
    console.log(`[Oracle MOCK] notifyContratoFirmado — ${expediente.numero_expediente}`);
    await updateExpediente(expediente.id, { oracle_sincronizado: true });
    return;
  }

  await axios.post(`${ORACLE_BASE_URL}/contratos/nuevo`, {
    oracle_nave_id:     expediente.nave.oracle_nave_id,
    oracle_cliente_id:  expediente.inquilino.oracle_cliente_id,
    expediente_id:      expediente.numero_expediente,
    fecha_inicio:       expediente.caso_legal.hoja_de_acuerdos.fecha_inicio,
    fecha_vencimiento:  expediente.fecha_vencimiento,
    renta_mensual_usd:  expediente.renta_mensual_usd,
  }, {
    headers: { Authorization: `Bearer ${ORACLE_API_KEY}` }
  });

  await updateExpediente(expediente.id, { oracle_sincronizado: true });
};

/**
 * Notifica a Oracle cuando inicia un holdover.
 * Oracle ajusta la facturación al doble de la renta en su ciclo de cobranza.
 */
export const notifyHoldoverIniciado = async (holdover: Holdover): Promise<void> => {
  if (ORACLE_MOCK) {
    console.log(`[Oracle MOCK] notifyHoldoverIniciado — ${holdover.nave.identificador}`);
    await updateHoldover(holdover.id, { oracle_notificado: true });
    return;
  }

  await axios.post(`${ORACLE_BASE_URL}/holdover/iniciar`, {
    oracle_cliente_id:    holdover.inquilino.oracle_cliente_id,
    oracle_nave_id:       holdover.nave.oracle_nave_id,
    fecha_inicio:         holdover.fecha_inicio_holdover,
    monto_holdover:       holdover.monto_holdover_mensual,
  }, {
    headers: { Authorization: `Bearer ${ORACLE_API_KEY}` }
  });

  await updateHoldover(holdover.id, { oracle_notificado: true });
};

/**
 * Notifica a Oracle cuando se firma una renovación.
 */
export const notifyRenovacionFirmada = async (expediente: ExpedienteContrato): Promise<void> => {
  if (ORACLE_MOCK) {
    console.log(`[Oracle MOCK] notifyRenovacionFirmada — ${expediente.numero_expediente}`);
    return;
  }

  await axios.put(`${ORACLE_BASE_URL}/contratos/renovar`, {
    oracle_contrato_id:  expediente.oracle_contrato_id,
    nueva_fecha_venc:    expediente.fecha_vencimiento,
    nueva_renta:         expediente.renta_mensual_usd,
  }, {
    headers: { Authorization: `Bearer ${ORACLE_API_KEY}` }
  });
};
```

#### Cron de sincronización Oracle

```typescript
// src/crons/oracle-sync.cron.ts

// Cron cada 4 horas: sincroniza pagos y disponibilidad desde Oracle
// Configurable via CRON_ORACLE_SYNC en .env

schedule(process.env.CRON_ORACLE_SYNC!, async () => {
  console.log('[Oracle Sync] Iniciando sincronización...');
  try {
    await oracleService.syncPagosDesdeOracle();
    await oracleService.syncDisponibilidadNaves();
    console.log('[Oracle Sync] Completado.');
  } catch (err) {
    console.error('[Oracle Sync] Error en sincronización:', err);
    // Crear alerta en Twenty para el admin
    await createAlertaEnTwenty('Error en sincronización Oracle', err);
  }
});
```

#### Endpoints Oracle que se necesitan confirmar con Parks

Estos endpoints deben ser documentados y confirmados con el equipo técnico de Oracle de Parks Industrial antes de Fase 6 del proyecto real:

```
GET  /oracle/api/pagos?desde=<fecha>              → lista de pagos realizados
GET  /oracle/api/naves/disponibilidad             → estatus actual de todas las naves
POST /oracle/api/contratos/nuevo                  → registrar nuevo contrato
POST /oracle/api/holdover/iniciar                 → activar holdover en cobranza
PUT  /oracle/api/contratos/renovar                → actualizar contrato existente
```

---

### 4.7 Lógica de Notificaciones Multi-Área

```typescript
// src/services/notificacion.service.ts

const dispararTicketCierre = async (casoLegal: CasoLegal) => {
  const tickets = [
    {
      area: 'Comercial',
      titulo: `Contrato firmado — ${casoLegal.inquilino.empresa}`,
      descripcion: 'Contrato completo con todas las firmas. Procede a calcular comisión.',
    },
    {
      area: 'CxC',
      titulo: `Emitir factura pagos iniciales — ${casoLegal.inquilino.empresa}`,
      descripcion: `Depósito en garantía + primera renta. Nave: ${casoLegal.nave.identificador}`,
    },
    {
      area: 'Facturación',
      titulo: `Configurar factura mensual recurrente — ${casoLegal.inquilino.empresa}`,
      descripcion: `${casoLegal.hoja_acuerdos.precio_usd_m2} USD/m² × ${casoLegal.hoja_acuerdos.m2_acordados} m²`,
    },
    {
      area: 'Tenant',
      titulo: `Coordinar entrega de nave — ${casoLegal.nave.identificador}`,
      descripcion: 'Levantamiento de acta de entrega. Coordinar accesos y condiciones.',
    },
    {
      area: 'Administrador Parque',
      titulo: `Nuevo inquilino — ${casoLegal.inquilino.empresa}`,
      descripcion: `Nave ${casoLegal.nave.identificador}. Configurar accesos, credenciales y servicios.`,
    },
  ];

  for (const ticket of tickets) {
    await createTaskInTwenty(ticket);
  }

  // Actualizar estatus de la nave
  await updateNave(casoLegal.nave_id, { estatus: 'Rentada' });

  // Marcar oportunidad como Ganada
  await updateOportunidad(casoLegal.oportunidad_id, {
    stage: 'Ganado — Contrato firmado',
    closeDate: new Date(),
  });

  // Notificar a Oracle del cierre
  await oracleService.notifyContratoFirmado(casoLegal.expediente);
};
```

---

### 4.8 Webhook Handler — Eventos Clave

```typescript
// src/webhooks/handlers/caso-legal.handler.ts

export const handleCasoLegalEvent = async (event: TwentyWebhookEvent) => {
  
  switch (event.action) {
    
    case 'created':
      await slaService.iniciarSLA(event.record);
      await checklistService.generarChecklist(event.record);
      await notificacionService.notificarCatalina(event.record);
      break;

    case 'updated':
      const prev = event.previousRecord;
      const curr = event.record;

      // Documentación completa → desbloquear caso
      if (!prev.documentacion_completa && curr.documentacion_completa) {
        await slaService.reanudarSLA(curr);
        await updateCasoLegal(curr.id, { estatus: 'En elaboración' });
        // Generar PDF del borrador base al desbloquear
        await pdfService.generarPDFContrato(await buildPDFContext(curr));
      }

      // Primera versión enviada → registrar timestamp + generar PDF de esa versión
      if (curr.estatus === 'Primera versión enviada' && 
          prev.estatus !== 'Primera versión enviada') {
        await slaService.registrarHito(curr.id, 'primera_version', new Date());
      }

      // Cotejo aprobado → iniciar flujo de firmas
      if (!prev.cotejo_aprobado && curr.cotejo_aprobado) {
        await firmasService.iniciarFlujoFirmas(curr);
      }

      // Firmado y cerrado → disparar todo
      if (curr.estatus === 'Firmado — cerrado' && 
          prev.estatus !== 'Firmado — cerrado') {
        await notificacionService.dispararTicketCierre(curr);
        await comisionService.calcularComisiones(curr.hoja_acuerdos_id);
        await expedienteService.abrirExpediente(curr);
        await slaService.cerrarSLA(curr.id);
        // oracle.service ya se llama desde dispararTicketCierre
      }

      await semaforoService.actualizar(curr);
      break;
  }
};
```

---

## SECCIÓN 5 — FLUJOS DE TRABAJO AUTOMATIZADOS

### Flujo 1: Comercial → Legal (handoff)

**Trigger:** Oportunidad pasa a Stage "Hoja de Acuerdos firmada"

**Acciones automáticas:**
1. Crear `CasoLegal` vinculado a la Oportunidad
2. Copiar datos de la HojaDeAcuerdos al CasoLegal
3. Asignar SLA según tipo: 60/45/90 días hábiles
4. Generar 9 registros de `DocumentoChecklist`
5. Crear tarea para el ejecutivo: "Entregar documentación cliente en 5 días hábiles"
6. Notificar a Catalina: nuevo caso asignado
7. Actualizar Oportunidad → Stage "En proceso legal"

---

### Flujo 2: Documentación bloqueante

**Trigger:** `CasoLegal.documentacion_completa` cambia de estado

**Si incompleta:**
- Estatus → "Documentación incompleta" / Semáforo → Gris
- Tarea a Comercial con lista de documentos faltantes

**Si completa:**
- Estatus → "En elaboración" / Semáforo → Azul
- `pdfService.generarPDFContrato()` — genera borrador base
- Notificación al abogado asignado para proceder

---

### Flujo 3: Flujo de firmas secuencial

**Trigger:** `CasoLegal.cotejo_aprobado` = true

**Acciones:**
1. Crear registros de `FlujoDeFirmas` en orden estricto:
   - Orden 1: Subdirector Legal
   - Orden 2: Director General (Charlie Meta)
   - Orden 3 y 4: Apoderados FUNO/NEXT (solo si `es_propiedad_funo = true`)
2. Activar el primero en espera
3. Al completarse cada firma → activar el siguiente
4. Al completarse todos → marcar CasoLegal como "Firmado — cerrado"

---

### Flujo 4: Detección de renovaciones

**Cron:** Diario 07:00 AM

```
Para cada ExpedienteContrato activo:
  meses_para_vencer = diff_meses(hoy, fecha_vencimiento)
  
  if meses_para_vencer == 12 → crear tarea a ejecutivo comercial
  if meses_para_vencer == 6  → si sin actividad → escalar a Director Comercial
  if meses_para_vencer == 3  → alerta urgente + involucrar CEO
  if meses_para_vencer == 1  → alerta crítica
  if meses_para_vencer <= 0 y sin renovación firmada → activar Flujo Holdover
```

---

### Flujo 5: Activación de holdover

**Trigger:** Contrato vencido sin renovación (detectado por cron)

**Acciones:**
1. Crear objeto `Holdover` en Twenty
2. `monto_holdover_mensual` = renta × 2
3. Actualizar Inquilino → "En holdover"
4. Tarea a CxC: emitir factura de holdover
5. Alerta 🔴 Rojo a Legal y Comercial
6. `oracleService.notifyHoldoverIniciado()` — notificar a Oracle para ajustar cobranza

---

## SECCIÓN 6 — PERMISOS Y ROLES EN TWENTY

| Rol en Twenty | Objeto | Permiso |
|--------------|--------|---------|
| Admin Legal (Catalina) | Todos los objetos legales | CRUD completo |
| Director Legal | Todos los objetos legales | CRUD completo |
| Subdirector Legal | Todos los objetos legales | CRUD completo |
| CEO (Charlie Meta) | Todos | Solo lectura + aprobaciones |
| Abogado asignado | Solo sus CasosLegales | Read + update estatus |
| Ejecutivo Comercial | Oportunidades + CasoLegal vinculado | Read oportunidades, read legal |
| CxC | ExpedienteContrato + Holdover | Solo lectura |
| Director Comercial | Oportunidades + Dashboards | CRUD oportunidades |

> ⚠️ Configurar via `Roles` en Settings de Twenty. Un rol por perfil.

---

## SECCIÓN 7 — DASHBOARDS Y REPORTES

### Dashboard Legal (Catalina)

| Widget | Tipo | Datos |
|--------|------|-------|
| Casos activos por semáforo | Kanban | CasosLegales agrupados por `semaforo` |
| SLA en riesgo | Lista | CasosLegales con pct_sla > 70% |
| Holdovers activos | KPI + lista | Holdovers estatus Activo |
| Documentación pendiente | Lista | CasosLegales `documentacion_completa = false` |
| Contratos por vencer 90 días | Lista | ExpedientesContrato `fecha_vencimiento < +90d` |
| Carga por abogado | Bar chart | Casos agrupados por `abogado_asignado` |
| SLA promedio por tipo | KPI | Avg `dias_transcurridos` por `tipo_documento` |

### Dashboard Ejecutivo (CEO)

| Widget | Tipo | Datos |
|--------|------|-------|
| % Ocupación | Gauge | `m2_rentados / m2_totales` por parque y nacional |
| Pipeline activo | Funnel | Oportunidades por stage |
| Contratos por vencer | Timeline | 30/60/90/180 días |
| Holdovers activos | Alerta roja | Count + monto en riesgo |
| Nuevos contratos mes | KPI | Count cerrados en el mes |
| Comisiones generadas | KPI | Sum comisiones calculadas |
| Revenue por m² | KPI | Avg `precio_usd_m2` por parque |
| Sincronización Oracle | Indicador | Última sync exitosa — estado de conexión |

---

## SECCIÓN 8 — VARIABLES DE ENTORNO

```bash
# .env
TWENTY_API_URL=http://localhost:3000
TWENTY_API_KEY=your_twenty_api_key_here

PORT=3001
NODE_ENV=development

# SLA Configuration
DIAS_FESTIVOS_MX=2026-01-01,2026-02-03,2026-03-21,2026-04-02,2026-04-03,2026-05-01,2026-09-16,2026-11-02,2026-11-16,2026-12-25

# Comisiones — PENDIENTE DE CONFIRMAR CON PARKS INDUSTRIAL
# Las reglas exactas deben documentarse y firmarse antes de activar el módulo
COMISION_EJECUTIVO_PCT=0.03

# Holdover
HOLDOVER_MULTIPLIER=2

# Oracle ERP Integration
ORACLE_API_URL=https://oracle-api.parks-industrial.com   # confirmar con equipo TI de Parks
ORACLE_API_KEY=your_oracle_api_key_here
ORACLE_MOCK=true   # ← IMPORTANTE: true para demo, false en producción

# Cron schedules (cron syntax)
CRON_SLA_TICKER=0 * * * *          # cada hora
CRON_HOLDOVER_SCANNER=0 8 * * *    # diario 8am
CRON_RENOVACION_ALERTS=0 7 * * *   # diario 7am
CRON_ORACLE_SYNC=0 */4 * * *       # cada 4 horas
```

---

## SECCIÓN 9 — ORDEN DE CONSTRUCCIÓN (BUILD ORDER)

**Este es el orden exacto en que Claude Code debe ejecutar las tareas. No saltarse pasos.**

### Paso 1 — Setup del microservicio

```bash
mkdir parks-twenty-service && cd parks-twenty-service
npm init -y
npm install express typescript ts-node @types/node @types/express
npm install node-cron @types/node-cron
npm install dotenv axios graphql-request
npm install puppeteer handlebars @types/handlebars
npx tsc --init
```

Crear estructura de directorios completa. Configurar `tsconfig.json` con `strict: true`.

### Paso 2 — Cliente GraphQL de Twenty

Implementar `src/services/twenty.client.ts`:
- Método genérico `query(gql, variables)`
- Método genérico `mutate(gql, variables)`
- Auth header con `TWENTY_API_KEY`
- Manejo de errores con retry (3 intentos, backoff exponencial)

### Paso 3 — Crear Custom Objects en Twenty (Metadata API)

Script `scripts/setup-objects.ts` que crea todos los objetos en este orden:
1. Parque
2. Nave (depende de Parque)
3. Inquilino
4. Broker
5. HojaDeAcuerdos (depende de Nave, Inquilino, Broker)
6. CasoLegal (depende de HojaDeAcuerdos, Inquilino, Nave)
7. DocumentoChecklist (depende de CasoLegal)
8. VersionDocumento (depende de CasoLegal)
9. FlujoDeFirmas (depende de CasoLegal)
10. Holdover (depende de CasoLegal, Inquilino, Nave)
11. Comision (depende de HojaDeAcuerdos, CasoLegal)
12. ExpedienteContrato (depende de CasoLegal, Inquilino, Nave)

### Paso 4 — Extender objeto Oportunidad nativo de Twenty

Agregar campos custom a la Oportunidad nativa vía Metadata API.

### Paso 5 — Crear Pipelines en Twenty

Crear los 4 pipelines:
1. Pipeline Comercial (8 stages + Perdido)
2. Pipeline Legal (10 stages)
3. Pipeline Renovaciones (9 stages)
4. Pipeline Holdovers (8 stages)

### Paso 6 — Implementar cliente Oracle (modo mock)

Implementar `src/services/oracle.service.ts` completo con `ORACLE_MOCK=true`.
Crear `src/crons/oracle-sync.cron.ts`.
Verificar que todas las funciones de Oracle loggean correctamente en modo mock.

### Paso 7 — Crear plantillas HBS de contratos

Crear los 5 archivos `.hbs` en `src/templates/` con estructura completa:
- Encabezado Parks Industrial
- Variables interpoladas desde el contexto
- Cláusulas placeholder claramente marcadas como `[INSERTAR CLÁUSULA N]`
- Pie de página con número de versión, fecha y leyenda de borrador
- Estilos CSS embebidos para formato Letter

### Paso 8 — Implementar servicios del microservicio

En este orden:
1. `sla.service.ts`
2. `semaforo.service.ts`
3. `checklist.service.ts`
4. `holdover.service.ts`
5. `comision.service.ts`
6. `pdf.service.ts` ← nuevo
7. `notificacion.service.ts`
8. `expediente.service.ts`

### Paso 9 — Implementar webhook handlers

1. `webhook.router.ts`
2. `oportunidad.handler.ts`
3. `caso-legal.handler.ts`
4. `flujo-firmas.handler.ts`
5. `contrato.handler.ts`

### Paso 10 — Configurar webhooks en Twenty

En Twenty Settings → Webhooks:
- URL: `http://localhost:3001/webhooks/twenty`
- Eventos: `record.created`, `record.updated` para todos los objetos custom

### Paso 11 — Implementar crons

1. `sla-ticker.cron.ts`
2. `holdover-scanner.cron.ts`
3. `renovacion-alerts.cron.ts`
4. `oracle-sync.cron.ts`

### Paso 12 — Datos de demo

Script `scripts/seed-demo.ts` con los 6 casos:
- Caso 1: LogiMex — contrato nuevo en proceso 🟠
- Caso 2: Manufactura GDL — renovación en tiempo 🔵
- Caso 3: Retail — renovación en riesgo 🟡
- Caso 4: Holdover activo 8 semanas 🔴
- Caso 5: Terminación anticipada en negociación 🟠
- Caso 6: Propiedad FUNO — cerrado y archivado 🟢

El seed también debe:
- Crear 2 Parques con 4 naves cada uno (mix de disponibles/rentadas)
- Crear 3 brokers (Newmark, CBRE, un independiente)
- Dejar 1 nave marcada `es_propiedad_funo = true`

### Paso 13 — Verificación end-to-end

1. Crear lead → calificar → tour → cotización → negociación → hoja acuerdos
2. Verificar creación automática del CasoLegal
3. Completar checklist → verificar generación de PDF borrador
4. Simular envío de versiones → verificar tracking SLA y semáforo
5. Aprobar cotejo → verificar inicio flujo de firmas
6. Completar todas las firmas → verificar tickets multi-área, comisiones y mock Oracle
7. Revisar dashboard ejecutivo con todos los KPIs poblados

---

## SECCIÓN 10 — QUERIES GRAPHQL CLAVE

### Query: Casos legales activos con SLA

```graphql
query GetCasosLegalesActivos {
  casoLegals(
    filter: {
      estatus: { notIn: ["Firmado — cerrado", "Cancelado"] }
    }
  ) {
    edges {
      node {
        id
        tipo_documento
        abogado_asignado
        estatus
        semaforo
        fecha_hoja_acuerdos
        sla_dias_habiles
        sla_fecha_limite
        dias_transcurridos
        documentacion_completa
        es_propiedad_funo
        pdf_borrador_url
        inquilino { empresa }
        nave { identificador es_propiedad_funo }
      }
    }
  }
}
```

### Mutation: Actualizar semáforo

```graphql
mutation UpdateSemaforo($id: ID!, $semaforo: String!, $diasTranscurridos: Int!) {
  updateCasoLegal(
    id: $id
    data: { semaforo: $semaforo, dias_transcurridos: $diasTranscurridos }
  ) {
    id
    semaforo
    dias_transcurridos
  }
}
```

### Query: Contratos vencidos (para holdover scanner)

```graphql
query GetContratosVencidos($hoy: Date!) {
  expedienteContratos(
    filter: {
      estatus: { eq: "Activo" }
      fecha_vencimiento: { lte: $hoy }
    }
  ) {
    edges {
      node {
        id
        numero_expediente
        fecha_vencimiento
        renta_mensual_usd
        oracle_contrato_id
        oracle_sincronizado
        inquilino { id empresa oracle_cliente_id }
        nave { id identificador oracle_nave_id }
        caso_legal { id }
      }
    }
  }
}
```

### Query: Contratos próximos a vencer (para alertas de renovación)

```graphql
query GetContratosProximosAVencer($desde: Date!, $hasta: Date!) {
  expedienteContratos(
    filter: {
      estatus: { eq: "Activo" }
      fecha_vencimiento: { gte: $desde, lte: $hasta }
    }
    orderBy: { fecha_vencimiento: AscNullsLast }
  ) {
    edges {
      node {
        id
        numero_expediente
        fecha_vencimiento
        inquilino { empresa contacto_principal email_contacto }
        nave { identificador }
      }
    }
  }
}
```

---

## SECCIÓN 11 — CASOS ESPECIALES Y REGLAS DE NEGOCIO

### Regla 1: FUNO siempre excluye comisiones
`nave.es_propiedad_funo = true` → no crear ningún registro de `Comision`. Crear nota en el expediente. Marcar expediente como `"Archivado FUNO"` al cierre. El expediente físico va a FUNO — no a Parks.

### Regla 2: El cliente firma primero (sin excepciones)
`FlujoDeFirmas` inicia con el cliente. El microservicio bloquea el flujo interno si `cotejo_aprobado = false`. Las firmas son físicas — el sistema registra fechas y seguimiento, no firma digitalmente.

### Regla 3: SLA — pendiente confirmar con Parks
¿El contador se pausa cuando la documentación está incompleta? El microservicio soporta ambos modos via flag `SLA_PAUSA_POR_DOCS=true/false` en `.env`. Implementar ambos y dejar el flag como decisión de Parks Industrial.

### Regla 4: Renovaciones vencidas — holdover + SLA corren en paralelo
Hoja de Acuerdos tardía → SLA de Legal inicia desde la fecha de la Hoja. Holdover inicia desde la fecha de vencimiento original. Dos procesos paralelos activos simultáneamente.

### Regla 5: Cotejo obligatorio antes del flujo de firmas
Si `cotejo_aprobado = true` sin `VersionDocumento.es_version_final = true` → alerta a Catalina. No se bloquea el flujo (Catalina puede override), pero sí se registra la anomalía.

### Regla 6: Comisiones pendientes de confirmar
Los porcentajes exactos de comisión no están documentados en los archivos de discovery. Según el documento maestro del proyecto, deben ser **firmados por dirección antes de arrancar el módulo de comisiones**. El microservicio implementa la estructura completa pero con `COMISION_EJECUTIVO_PCT` como variable de entorno configurable.

---

## SECCIÓN 12 — CLAUDE.MD (para Claude Code)

```markdown
# CLAUDE.md — Parks Industrial Twenty CRM

## Contexto del proyecto
Sistema CRM completo para Parks Industrial implementado en Twenty CRM (self-hosted, 
puerto 3000) + microservicio Node.js/TypeScript (puerto 3001).

Reemplaza: Monday.com (legal y comercial) y Excel (control de renovaciones).
Complementa: Oracle ERP (permanece — integración bidireccional vía REST API custom).

## Stack
- CRM: Twenty (local, puerto 3000) — ya está corriendo, no tocar
- Microservicio: Node.js + TypeScript (puerto 3001)
- DB de Twenty: PostgreSQL (gestionado por Twenty internamente)
- Runtime: Node 20+
- PDF: Puppeteer + Handlebars
- Oracle: REST API custom (modo mock para demo)

## Lo que YA existe
- Twenty corriendo localmente en puerto 3000
- Nada configurado — empezar desde cero

## Lo que NO se implementa (fuera de scope)
- Account Engagement / Marketing automation
- Firma digital (S-Sign, DocuSign) — CEO tiene directiva de firmas físicas
- Portal para brokers externos
- Integración real con Oracle (se mockea para demo — ver ORACLE_MOCK en .env)

## Contactos clave del proceso de negocio
- Lilibeth: punto de contacto principal del proyecto en Parks Industrial
- Catalina Moreno Monroy: coordinadora legal — única persona que aprueba documentación
  y sube información al sistema actualmente
- Héctor Montelongo: referente del proceso comercial
- Charlie Meta: Director General / CEO — aprobaciones ejecutivas, primera rúbrica

## Dependencias externas
- Javier (Bridge Studio): responsable de la integración real con Oracle ERP en producción
  El microservicio tiene el módulo Oracle en modo mock — Javier lo conectará al API real
- Equipo TI de Parks Industrial: debe confirmar endpoints de Oracle antes de Fase 6

## Reglas críticas de negocio (NO violar)
1. nave.es_propiedad_funo = true → NUNCA generar comisiones internas ni de broker
2. El cliente SIEMPRE firma el contrato físicamente ANTES que cualquier actor interno
3. El cotejo de Catalina es obligatorio antes de activar el flujo de firmas internas
4. SLA cuenta desde fecha de Hoja de Acuerdos — no desde inicio de negociación
5. Holdover = doble de la renta mensual base (HOLDOVER_MULTIPLIER=2)
6. Las plantillas HBS de contratos son borradores — marcar claramente con leyenda

## Comandos del proyecto
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Crear custom objects en Twenty
npm run setup:objects

# Cargar datos de demo
npm run seed:demo

# Verificar conexión con Twenty
npm run health

# Generar PDF de prueba
npm run pdf:test

# Probar mock de Oracle
npm run oracle:test

## Twenty API
- Base URL: http://localhost:3000
- Metadata API: http://localhost:3000/metadata
- GraphQL: http://localhost:3000/graphql
- API Key: variable TWENTY_API_KEY en .env

## Modo Oracle Mock
ORACLE_MOCK=true en .env → todas las llamadas a Oracle se simulan con console.log.
El código de producción está implementado pero inactivo hasta que Javier configure
los endpoints reales. No cambiar ORACLE_MOCK a false en la demo.
```

---

## SECCIÓN 13 — NOTAS PARA LA DEMO

Al ejecutar `npm run seed:demo`, los dashboards deben mostrar:

**Pipeline Legal — Semáforo:**
- 🔵 LogiMex S.A. de C.V. — 32 / 60 días — Borrador en revisión
- 🔵 Empresa Manufactura GDL — 18 / 45 días — Primera versión enviada
- 🟡 Empresa Retail — Sin iniciar — Bloqueado en Comercial
- 🔴 Empresa Holdover — 56 días vencida — Factura doble emitida
- 🟠 Empresa Terminación — Penalización en negociación — Aprobación CEO pendiente
- 🟢 Empresa FUNO Norte — Firmado — Expediente enviado a FUNO

**Dashboard ejecutivo:**
- Holdovers activos: 1 (con monto mensual en riesgo visible)
- Contratos próximos a vencer 90 días: al menos 2
- Pipeline activo: 5 oportunidades en distintos stages
- Última sincronización Oracle: hace menos de 4 horas (mock)

**Para demostrar el PDF:**
- Abrir el CasoLegal de LogiMex → botón "Ver PDF borrador"
- El PDF debe abrirse con los datos reales del caso, leyenda de borrador y número de versión

---

*Blueprint v1.1 preparado por Bridge Studio — Junio 2026*  
*Para implementación autónoma con Claude Code*  
*Fuentes: Catalina Moreno Monroy (Legal) + Héctor Montelongo (Comercial) + Documento Maestro del Proyecto Parks Industrial*
