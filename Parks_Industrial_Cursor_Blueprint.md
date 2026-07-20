# Parks Industrial CRM — Blueprint para Cursor
## Módulos y Vistas Custom sobre Twenty CRM
**Versión:** 1.0 | **Fecha:** Junio 2026 | **Confidencial — Uso interno Bridge Studio**

---

## CONTEXTO PARA EL AGENTE

Estás construyendo una capa de UI personalizada encima de **Twenty CRM** (self-hosted) para el cliente Parks Industrial, una empresa de parques industriales en México. Twenty CRM ya tiene los objetos custom configurados (Parque, Nave, Inquilino, Contrato, Renovación, Comisión, Broker). Tu tarea es construir las vistas y módulos que Twenty no tiene de manera nativa pero que son críticos para la demo con el cliente.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
**API:** Twenty CRM GraphQL API (http://localhost:3000/api o dominio propio)
**Auth:** Twenty API Key (env var TWENTY_API_KEY)
**Carpeta del proyecto:** /apps/parks-dashboard

---

## MÓDULO 1 — STACKING PLAN DE NAVES

### Qué es
Vista visual tipo grid que muestra todas las naves de un parque industrial con su status de ocupación, fechas de vencimiento de contrato y alertas de renovación. Reemplaza el stacking plan de AscendixRE (que está diseñado para edificios multi-piso, no para parques industriales horizontales).

### Ruta
/parque/[parqueId]/stacking-plan

### Componentes a crear

#### StackingPlanGrid.tsx
```
props:
  - parqueId: string
  - fecha: Date (default: today)

layout:
  - Grid CSS auto-fit de tarjetas de naves
  - Cada tarjeta = 1 nave del parque
  - Tarjetas ordenadas por nombre (Nave A, B, C o por número)

lógica por tarjeta:
  - Fetch GraphQL: nave + contrato activo + fecha vencimiento
  - Si contrato activo:
      dias_restantes = fecha_vencimiento - hoy
      <= 90 dias  → color ROJO (#DC2626), badge "Vence pronto"
      <= 180 dias → color AMARILLO (#D97706), badge "Por renovar"
      > 180 dias  → color VERDE (#16A34A), badge "Activo"
  - Sin contrato: color GRIS (#6B7280), badge "Disponible"

contenido de cada tarjeta:
  - Nombre de nave (ej: "Nave 7 - Sector B")
  - m² totales
  - Nombre del inquilino (o "Disponible")
  - Fecha de vencimiento (o "—")
  - Días restantes (pill con color)
  - Precio/m² actual
```

#### StackingPlanHeader.tsx
```
contenido:
  - Nombre del parque
  - Fecha del reporte (datepicker)
  - Resumen: X naves total | X ocupadas | X disponibles | X por renovar
  - Botón "Exportar a Excel"
  - Botón "Nueva Nave"
```

#### StackingPlanLegend.tsx
```
leyenda de colores:
  🟢 Activo (>180 días)
  🟡 Por renovar (90–180 días)
  🔴 Vence pronto (<90 días)
  ⚫ Disponible
```

### Query GraphQL
```graphql
query StackingPlan($parqueId: ID!) {
  naves(filter: { parque: { id: { eq: $parqueId } } }) {
    edges {
      node {
        id
        nombre
        metrosCuadrados
        precioPorMetro
        contratoActivo {
          id
          fechaVencimiento
          inquilino { id nombre }
        }
      }
    }
  }
}
```

---

## MÓDULO 2 — DASHBOARD EJECUTIVO (para Charlie Meta, CEO)

### Qué es
Dashboard de métricas de alto nivel. Funciona en desktop y móvil. Responde a lo que Charlie pidió: métricas del grupo, no de nave individual.

### Ruta
/dashboard

### Componentes a crear

#### MetricCard.tsx (reutilizable)
```
props:
  - label: string
  - value: string | number
  - trend?: { valor: number, periodo: string }
  - color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray'
  - icon?: LucideIcon
```

#### DashboardPage.tsx
```
sección 1 — KPIs (grid 4 col desktop, 2 col móvil):
  - Total m² rentados / disponibles
  - Tasa de ocupación (%) con trend vs mes anterior
  - Ingresos mensuales estimados (precio/m² × m² rentados)
  - Contratos por vencer en 90 días (número en rojo si >0)

sección 2 — Vencimientos por mes (barras, Recharts):
  - Eje X: próximos 12 meses
  - Eje Y: contratos que vencen ese mes
  - Colores: rojo si mes actual/siguiente, amarillo 2-3 meses, azul >3 meses

sección 3 — Ocupación por parque:
  - Una fila por parque
  - Progress bar horizontal con % ocupación

sección 4 — Pipeline de deals activos:
  - 5 deals más recientes: prospecto, nave, valor, responsable, etapa

sección 5 — Panel de alertas (derecha):
  - Contratos con vencimiento en 60 días
  - Botón "Ver contrato" por cada alerta
```

#### Responsividad móvil
```
- <768px: KPIs en 2 columnas, gráfica en scroll horizontal
- Navbar colapsable con hamburger menu
```

---

## MÓDULO 3 — PIPELINE KANBAN (para Héctor, Dir. Comercial)

### Qué es
Vista Kanban customizada con campos específicos de Parks y acciones rápidas.

### Ruta
/pipeline

### Etapas (columnas)
```
1. Prospecto nuevo
2. Visita agendada
3. Propuesta enviada
4. Negociación
5. Letter of Intent (LOI)
6. Contrato en revisión legal
7. Contrato firmado
8. Cancelado (oculta por default, toggle para mostrar)
```

### Componentes a crear

#### PipelineBoard.tsx
```
- Scroll horizontal
- Header de columna: nombre | cantidad de deals | valor total
- Drag & drop: usar @dnd-kit/core
- Al soltar: PATCH a Twenty API actualizando campo "etapa"
- Optimistic update: mover tarjeta en UI antes de respuesta API

filtros en toolbar:
  - Por responsable
  - Por parque
  - Por m² (mínimo/máximo)
  - Botón "Mis deals" para filtrar por usuario activo
```

#### DealCard.tsx
```
contenido:
  - Nombre del prospecto
  - Nave de interés (si asignada)
  - m² requeridos
  - Valor estimado del deal
  - Responsable (avatar + nombre)
  - Días en etapa actual:
      >14 días → pill AMARILLO
      >30 días → pill ROJO
  - Próxima actividad o "Sin actividad agendada" en rojo

acciones en hover:
  - Editar deal
  - Agendar actividad
  - Ver detalle
```

---

## MÓDULO 4 — FLUJO DE APROBACIÓN DE CONTRATOS (para Catalina, Legal)

### Qué es
Flujo de 4 etapas de aprobación antes de firma de contrato.

### Ruta
/contratos/[contratoId]/aprobacion

### Flujo
```
Etapa 1: Revisión Comercial        → Aprueba: Héctor
Etapa 2: Revisión Legal            → Aprueba: Catalina
Etapa 3: Aprobación Grupo (Oracle) → Placeholder "En configuración"
Etapa 4: Firma Final               → Aprueba: CEO / apoderado
```

### Componentes a crear

#### ApprovalTimeline.tsx
```
- Timeline vertical de 4 nodos
- Completado: círculo verde con checkmark
- Activo: círculo azul con pulse animation (CSS)
- Pendiente: círculo gris

cada nodo:
  - Nombre de etapa
  - Responsable
  - Fecha de aprobación (si ya pasó)
  - Comentarios
```

#### ApprovalActions.tsx
```
visible solo si usuario activo = responsable de etapa actual:
  - Botón "Aprobar" → modal con campo de comentario
  - Botón "Rechazar con observaciones" → modal con campo obligatorio
  - Al aprobar: PATCH contrato en Twenty avanzando etapa + timestamp + usuario
  - Al rechazar: retrocede a Comercial con flag de observaciones
```

#### ContratoDetail.tsx
```
panel izquierdo (60%):
  - Inquilino, nave, m², precio/m², duración, fechas
  - Documentos adjuntos (lista de links o PDF embed)
  - Historial de cambios

panel derecho (40%):
  - ApprovalTimeline
  - ApprovalActions
  - Chat de comentarios entre aprobadores
```

---

## MÓDULO 5 — MOTOR DE COMISIONES

### Ruta
/comisiones

### Lógica de cálculo
```
comision_base = precio_m2 × m2 × meses × porcentaje_broker
si broker trajo inquilino directo: + bono_referido (default 0.5%)
si es renovación: comision = comision_base × 0.5
```

### Componentes a crear

#### ComisionesTable.tsx
```
columnas:
  - Broker (nombre + foto)
  - Deal / contrato
  - Nave
  - Valor del contrato
  - % comisión
  - Monto calculado
  - Status: Pendiente | Aprobada | Pagada
  - Acciones: Aprobar pago | Ver detalle

filtros:
  - Por broker
  - Por período (mes/trimestre/año)
  - Por status

pie de tabla:
  - Total comisiones pendientes
  - Total comisiones del mes
```

#### ComisionSummaryByBroker.tsx
```
ranking de brokers (solo visible para admin):
  - Posición, nombre, deals cerrados, total comisiones
  - Barra de progreso hacia meta del período
```

---

## MÓDULO 6 — MAPA DE PARQUES

### Ruta
/mapa

### ParkesMap.tsx
```
librería: @react-google-maps/api
env var: GOOGLE_MAPS_API_KEY

markers por parque:
  - Marker azul por parque industrial
  - Al click: InfoWindow con nombre, dirección, % ocupación, botón "Ver naves"

panel lateral:
  - Lista de parques con % ocupación
  - Click → centra mapa y abre InfoWindow
```

---

## INFRAESTRUCTURA DEL PROYECTO

### Cliente GraphQL centralizado — /lib/twenty-api.ts
```typescript
const TWENTY_API_URL = process.env.TWENTY_API_URL
const TWENTY_API_KEY = process.env.TWENTY_API_KEY

export async function twentyQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(TWENTY_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!response.ok) throw new Error(`Twenty API error: ${response.status}`)
  const data = await response.json()
  if (data.errors) throw new Error(data.errors[0].message)
  return data.data
}
```

### Variables de entorno (.env.local)
```env
TWENTY_API_URL=https://crm.bridgestudio.mx/api
TWENTY_API_KEY=tu_api_key_de_twenty
GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
NEXT_PUBLIC_APP_URL=https://dashboard.parkscrm.bridgestudio.mx
```

### AppNav.tsx — Navbar principal
```
rutas:
  Dashboard        → /dashboard
  Stacking Plan    → /parque/[default]/stacking-plan
  Pipeline         → /pipeline
  Contratos        → /contratos
  Comisiones       → /comisiones
  Mapa             → /mapa

móvil: hamburger menu
esquina derecha: avatar + nombre del usuario activo
logo: "Parks Industrial" (placeholder hasta recibir assets del cliente)
```

---

## SEED DATA PARA LA DEMO

Crear /scripts/seed-demo-data.ts con los siguientes registros:

### Parque
```
Nombre: Parques del Bajío - Silao
Dirección: Blvd. El Mezquital 234, Silao, GTO
Coordenadas: 20.9356 N, 101.4456 W
```

### 12 Naves
```
Nave 1  — 3,500 m² — Sigma Alimentos     — vence en 45 días  → ROJO
Nave 2  — 2,800 m² — Helvex          — vence en 140 días → AMARILLO
Nave 3  — 4,200 m² — Grupo Lala      — vence en 380 días → VERDE
Nave 4  — 3,100 m² — DISPONIBLE
Nave 5  — 2,500 m² — Yazaki          — vence en 210 días → VERDE
Nave 6  — 5,000 m² — Continental     — vence en 65 días  → ROJO
Nave 7  — 3,800 m² — DISPONIBLE
Nave 8  — 2,900 m² — Quala           — vence en 160 días → AMARILLO
Nave 9  — 4,500 m² — Bimbo           — vence en 290 días → VERDE
Nave 10 — 3,200 m² — DISPONIBLE
Nave 11 — 2,700 m² — Alpura          — vence en 85 días  → ROJO
Nave 12 — 3,600 m² — 3M              — vence en 420 días → VERDE
```

### Deal de demo (WOW moment para Héctor)
```
Prospecto: Nestlé México
Nave: Nave 4 (disponible, 3,100 m²)
Valor estimado: $310,000 USD/año
Etapa: Negociación
Responsable: Héctor Torres
D�as en etapa: 18 → aparece en AMARILLO (trigger de seguimiento)
```

### Contrato en aprobación (WOW moment para Catalina)
```
Inquilino: Sigma Alimentos (renovación urgente — vence en 45 días)
Nave: Nave 1
Nueva duración: 36 meses
Etapa actual: Revisión Legal (etapa 2)
→ Este contrato aparece primero en la lista de Catalina al iniciar sesión
```

---

## ORDEN DE CONSTRUCCIÓN

```
1. TwentyApiClient + .env + AppNav + layout base
2. Módulo 2: Dashboard         (abre la demo, máximo impacto visual)
3. Módulo 1: Stacking Plan     (segundo WOW)
4. Módulo 3: Pipeline Kanban   (para Héctor)
5. Módulo 4: Aprobación        (para Catalina)
6. Módulo 5: Comisiones        (cierre de demo)
7. Módulo 6: Mapa              (nice to have)
8. Seed data script
```

---

## NOTAS CRÍTICAS PARA EL DEVELOPER

- NUNCA mostrar "Twenty CRM" en la UI. Usar "Sistema de Gestión Parks Industrial".
- El cliente no sabe que la plataforma base es open source. No mencionarlo.
- Todos los textos de UI en español.
- Montos en USD (así opera Parks internacionalmente).
- Fechas en formato DD/MMM/YYYY (ej: 15/Jul/2026).
- Integración con Oracle: fuera del alcance de esta demo. Mostrar placeholder en etapa 3 del flujo de aprobación.
- Documentación de la API de Twenty: https://twenty.com/developers
