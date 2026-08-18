# Parks Industrial — Qué falta

> **Última actualización:** 2026-07-14  
> **Referencia:** [PROGRESS.md](./PROGRESS.md) · [DASHBOARD_PROGRESS.md](./DASHBOARD_PROGRESS.md) · [FLUJO-COMERCIAL-DEMO.md](./FLUJO-COMERCIAL-DEMO.md) · [CxC US](./Parks_Industrial_CxC_UserStories_Cursor.md) · [Blueprint UI](../../Parks_Industrial_Cursor_Blueprint.md) · [Roles inventario](./ROLES-INVENTARIO.md)

Documento de seguimiento de trabajo pendiente tras completar los módulos base de UI en Twenty (`/parks/*`), el microservicio `parks-twenty-service` y las vistas **Renovaciones** y **Reservas**.

---

## Resumen ejecutivo

| Área | Estado general |
| --- | --- |
| Backend (microservicio + metadata Twenty) | ✅ Base completa + flujo comercial US |
| UI integrada en Twenty (`packages/twenty-front`) | ✅ Flujo comercial + legal + CxC + **Comité** + roles |
| Demo lista para cliente | ✅ Comercial + legal + comité; CxC demo con datos mock |
| Producción / integraciones reales | ⬜ Oracle real + portales + Fibra Uno |

---

## Roles y permisos (Jul 2026)

Acoplado a `Parks_Industrial_Roles_Permisos_Cursor.md`:

- [x] Inventario + reporte de cambios a roles existentes ([ROLES-INVENTARIO.md](./ROLES-INVENTARIO.md))
- [x] 14 system codes / 16 labels Twenty (aliases LO + CxC)
- [x] Matriz rutas front (CEO sin asignación; Dir. Legal sin comité; Admin Legal sin CxC; CEO vota en comité al empate)
- [x] Asientos comité CFO/Ops + guard de voto por `viewerEmail`
- [x] 12 usuarios nuevos `@parksindustrial.com` (`Parks2026!NN`); 8 `@apple.dev` sin cambio de password
- [x] Prueba funcional `npx tsx scripts/test-roles-functional.ts`

---

## Asignación inteligente (Jul 2026)

Acoplado a `Parks_Industrial_Asignacion_Inteligente_Cursor.md` (solo agregar):

- [x] Scoring Capa 1 (pesos m²/presupuesto/canal/sector/internacional) + forzado AAA por m²
- [x] Config umbrales editable (`GET|PATCH /asignacion-inteligente/config`)
- [x] Selección LO por tier + especialidad + carga + top 3 sugerencias
- [x] Fallbacks A–G (carga max, sin LO activos → CEM provisional, escalamiento SLA)
- [x] Scoring IA mock (recomendación + razón) cuando `iaScoringActivo`
- [x] Auto-clasifica al crear lead (`POST /commercial/leads` additive)
- [x] UI CEM `/parks/asignacion` — equipo + pendientes + asignar 1 clic
- [x] Campo nuevo `opportunity.paisOrigen` (metadata)
- [ ] Persistencia Clasificacion_Lead / Config en Twenty (hoy store + API)

**API:** `GET /asignacion-inteligente/dashboard`, `POST .../seed-demo`, `POST .../clasificar`, `POST .../confirmar-asignacion`, `POST .../jobs/escalation`

---

## Valor agregado (Jul 2026)

Acoplado a `Parks_Industrial_Funcionalidades_ValorAgregado_Cursor.md` (solo agregar):

- [x] F1 vigencia checklist + gate adicional en `advanceEstatus` + cron diario alerts
- [x] F2 detección expansión (cron semanal + notificaciones)
- [x] F3 concentración vencimientos (reporte + cron mensual + umbral en Parque)
- [x] F4 ROI por canal (reporte demo)
- [x] F5 ofertas renovación anticipada (API create/aceptar/expirar)
- [x] F6 match automático naves (endpoint + overlay/`matchNavesSugeridas`)
- [x] F7 tiempo respuesta leads (métricas + semáforo)
- [x] F8 outreach brokers top 10 + inactividad 45d
- [x] UI `/parks/valor-agregado`
- [ ] Persistencia metadata Twenty en prod (campos nuevos listos en definitions)

**API:** `GET /valor-agregado/dashboard`, checklist vigencia, ofertas, match-auto, lead-response, broker-outreach, jobs daily/weekly/monthly

---

## Comité de Autorización (Jul 2026)

Acoplado a `Parks_Industrial_Comite_Autorizacion_V2_Cursor.md`:

- [x] Store + API `/comite` (list, detail, vote, Q&A, config, ceo-decision)
- [x] Gate: Hoja firmada CEM+cliente → abre comité (no Legal directo) si `PARKS_COMITE_ENABLED=true`
- [x] Mayoría simple 2/3 con resolución inmediata; abstenciones / empate → **voto CEO** (Aprueba / Rechaza)
- [x] Aprobado → `commercialLegalHandoffService` crea caso legal
- [x] Rechazado → oportunidad a negociación + razones al LO
- [x] UI `/parks/comite` — listado, votación trío, voto CEO en empate, semáforo, flags IA, bitácora, Q&A
- [x] 4 escenarios demo (FEMSA deliberación, LogiMex aprobado disidente, XYZ rechazado, Samsung empate → CEO)
- [ ] Metadata Twenty persistente (`Comite_Autorizacion`, `Pregunta_Comite`)
- [ ] SLA real por horas hábiles + jobs de recordatorio/vencimiento
- [ ] Rol dedicado “Miembro del Comité” (hoy: CFO / Ops + Dir. Comercial en asientos; CEO vota al empate)

**API:** `GET /comite`, `GET /comite/:id`, `POST .../vote`, `POST .../ceo-decision`, `POST .../questions`, `POST .../questions/:id/answer`, `GET|PATCH /comite/config`

**Demo votos (trío):** Dir. Comercial=`directorcomercial@prk.com.mx` · CFO=`cfo@prk.com.mx` · Ops=`directoroperaciones@prk.com.mx`  
**Voto CEO (empate):** CEO=`ceo@prk.com.mx` → Aprobar / Rechazar

---

## Flujo CEO Dashboard KPIs (Jul 2026)

Acoplado a `Parks_Industrial_CEO_Dashboard_KPIs_Cursor.md`:

- [x] API `GET /ceo/dashboard` — 16 KPIs + snapshots 6 meses + alertas
- [x] Vista diaria (móvil-first): ocupación / MRR / cobranza + alertas + vencimientos + pipeline
- [x] Vista de consejo: portafolio, ingresos, renovaciones, cobranza, eficiencia (gráficas)
- [x] Toggle Diario ↔ Consejo en `/parks/dashboard` (rol CEO)
- [x] Bandeja CEO en `/parks/mis-pendientes` (aprobaciones, condonaciones, firmas DG)
- [x] Dashboard CEO enlaza pendientes vía badge / alerta (sin lista embebida)
- [x] CEO ve Dashboard comercial (`/parks/dashboard-comercial`) y Dashboard legal (nav + CTAs)
- [ ] Metadata Twenty persistente (`Snapshot_Ocupacion_Mensual`, tipo de cambio, campos Caso Legal)
- [ ] Automatización mensual real de snapshots + Oracle como fuente de facturación

---

Acoplado a [Parks_Industrial_CxC_UserStories_Cursor.md](./Parks_Industrial_CxC_UserStories_Cursor.md):

- [x] Dashboard `/parks/cxc` — KPIs, forecast 7/30/90, anomalías, riesgo, cartera por ejecutivo
- [x] Seed demo in-memory (LogiMex, Norte portal/OC, Holdover GDL, depósito salida, ColdChain USD)
- [x] Panel detalle operativo: OC, depósito, **aplicar pago**, bitácora cobranza, recordatorio/escala OC
- [x] Handoff Legal → crea ciclo/cuenta en cartera CxC (además de tareas)
- [x] Rol CxC + nav Operaciones → CxC
- [ ] Metadata Twenty persistente (Ciclo_Facturacion, Factura_CxC, etc.) — demo usa store
- [ ] Integración Oracle real (lectura/escritura facturas y pagos)
- [ ] Recordatorios OC / cobranza por email automatizados en producción
- [ ] Bloqueo renovación Legal ↔ adeudos CxC end-to-end

**API:** `GET /cxc/dashboard`, `GET /cxc/accounts/:id`, `POST .../register-oc`, `.../deposit-step`, `.../suggest-payment`, `.../apply-payment`, `.../actions`, `.../oc-reminder`, `.../anomalies/:id/resolve`

---

## Flujo comercial US (Jul 2026)

Acoplado a `Parks_Industrial_Comercial_UserStories_Cursor.md` (escenarios A–C, E–F) y al documento maestro `Parks_Industrial_Salesforce_ProyectoCompleto.md` (copiados en `docs/parks-industrial/`):

- [x] Campos Opportunity/Broker/Hoja extendidos
- [x] Crear lead + cola CEM + asignación LO
- [x] **Decisores del cliente (§4.8)** — panel en deal + Cuenta 360 + tour
- [x] Tour, cotización formal, aprobaciones, pérdida/reactivación
- [x] Hoja desde oportunidad + firma CEM/cliente
- [x] `PARKS_LEGAL_HANDOFF_ENABLED=false` (no crea casoLegal)
- [x] Cuenta 360 `/parks/inquilinos/:id`
- [x] Stage gates en kanban

Ver [FLUJO-COMERCIAL-DEMO.md](./FLUJO-COMERCIAL-DEMO.md).

**Documentos fuente de negocio (Jul 2026):**

- [Parks_Industrial_Salesforce_ProyectoCompleto.md](./Parks_Industrial_Salesforce_ProyectoCompleto.md) — discovery maestro (incl. §4.8 decisores)
- [Parks_Industrial_Comercial_UserStories_Cursor.md](./Parks_Industrial_Comercial_UserStories_Cursor.md) — US escenarios A–G
- [Parks_Industrial_Legal_UserStories_Cursor.md](./Parks_Industrial_Legal_UserStories_Cursor.md) — US área legal US-LEG-001…012
- [Parks_Industrial_CxC_UserStories_Cursor.md](./Parks_Industrial_CxC_UserStories_Cursor.md) — US área CxC US-CXC-001…010

---

## Flujo legal US (Jul 2026) — Completo

Acoplado a `Parks_Industrial_Legal_UserStories_Cursor.md` (US-LEG-001…012):

- [x] Handoff comercial→legal (`PARKS_LEGAL_HANDOFF_ENABLED=true` por defecto)
- [x] `legal-workflow.service` — checklist, abogado, versiones, cotejo, firmas, SLA pause/resume, NDA
- [x] API `/legal/*` — dashboard, workload, metrics, reporte quincenal, acta restitución, condonación holdover
- [x] UI `/parks/contratos/:id/aprobacion` — pipeline 12 etapas + todos los paneles
- [x] `/parks/legal-pipeline` — Kanban legal
- [x] `/parks/legal-dashboard` — director legal + métricas abogados + reporte quincenal
- [x] Objeto `actaRestitucion` + flujo depósito/devolución
- [x] Condonación CEO holdover (solicitud + aprobación)
- [x] Crons: reporte quincenal, seguimiento versiones sin respuesta, acumulado holdover
- [x] Holdover US-LEG-010: scanner + Facturación + montos acumulados vs cobrados

**Nota:** Permisos por rol en UI Parks implementados (Jul 2026): menú filtrado, rutas protegidas, abogado ve solo casos asignados, contratos en solo lectura para Comercial/CxC/CEO. Requiere `npm run setup:demo-users` + logout/login por usuario.


## Lo que ya está hecho

### Backend — `parks-twenty-service`

Según [PROGRESS.md](./PROGRESS.md):

- [x] Setup Express + TypeScript + cliente GraphQL Twenty
- [x] 12 custom objects (Metadata API)
- [x] Extensión de Oportunidad (campos custom)
- [x] 4 pipelines (Comercial, Legal, Renovaciones, Holdovers)
- [x] 8 roles Parks + dashboards Legal y Ejecutivo
- [x] Webhooks configurados hacia el microservicio (`:3002`)
- [x] Servicios: SLA, semáforo, checklist, holdover, comisiones, PDF, notificaciones, expediente
- [x] Crons (SLA, holdover, renovaciones, Oracle mock)
- [x] Seed demo + verificación E2E (`npm run e2e:test`)

### UI en Twenty — rutas `/parks/*`

| Módulo | Ruta | Notas |
| --- | --- | --- |
| Dashboard ejecutivo | `/parks/dashboard` | KPIs, gráficas, embudo pipeline |
| Stacking Plan | `/parks/stacking-plan` | Export CSV, leyenda de colores |
| Pipeline comercial | `/parks/pipeline` | Kanban con drag-and-drop · banner CEM si hay pendientes |
| Leads CEM | `/parks/leads-cem` | Cola completa de asignación (US-COM-002) |
| Prospectos | `/parks/prospectos` | Búsqueda demanda + matching naves (Ascendix-style) |
| Contratos | `/parks/contratos` | Lista de expedientes |
| Aprobación legal | `/parks/contratos/:contratoId/aprobacion` | Pipeline legal 9 etapas + checklist/firmas/versiones |
| Comisiones | `/parks/comisiones` | Tabla y resumen |
| Mapa | `/parks/mapa` | Google Maps + panel lateral |
| Renovaciones | `/parks/renovaciones` | Cola de vencimientos + holdovers |
| Reservas | `/parks/reservas` | Naves en negociación |
| Notificaciones | `/parks/notificaciones` | Centro broker: tareas IA, alertas, enriquecimiento |
| CxC / Cobranza | `/parks/cxc` | Cartera, riesgo IA, OC, holdovers, forecast, anomalías |
| Asistente IA | Panel en todas las vistas Parks | Fases 1–2 (demo + OpenAI opcional) |

**Código principal:**

```
packages/twenty-front/src/modules/parks-industrial/
packages/twenty-front/src/pages/parks-industrial/
packages/twenty-shared/src/types/AppPath.ts
parks-twenty-service/
```

**App legacy:** `apps/parks-dashboard` (Next.js, `:3010`) — prototipo; la demo oficial es Twenty en **http://localhost:3001**.

---

## Prioridad 1 — Antes de la demo con el cliente

### 1. Asignar roles a usuarios en Twenty

Los 8 roles Parks ya están creados (`npm run setup:roles`). Asignación automática demo:

```bash
cd parks-twenty-service
npm run setup:assign-roles
```

Mapeo demo (`@prk.com.mx` / `parksindustrial2026!`):

| Usuario | Rol Parks | Puesto |
| --- | --- | --- |
| `adminlegal@prk.com.mx` | Admin Legal | Admin Legal |
| `directorcomercial@prk.com.mx` | Director Comercial | Director Comercial |
| `ceo@prk.com.mx` | CEO | CEO |
| `gerentecxc@prk.com.mx` | Gerente CxC | Gerente CxC |
| `leasingofficeraaa@prk.com.mx` | LO AAA Senior | Leasing Officer AAA |

**Nota:** el workspace local arranca con `tim@apple.dev` como admin técnico de Twenty. Para la demo Parks corre `npm run setup:demo-users` y entra con los correos `@prk.com.mx`. Lista: [USUARIOS_DEMO.md](./USUARIOS_DEMO.md).

### 2. Commitear y pushear el trabajo de UI

Gran parte del módulo `parks-industrial/` puede estar sin trackear en git. Antes de la demo conviene:

- Commit con módulos UI, rutas, Renovaciones, Reservas, Asistente IA
- Push a remoto para que el equipo pueda desplegar o revisar

### 3. Verificar seed demo en el workspace correcto ✅

```bash
cd parks-twenty-service
npm run seed:demo
npm run health
```

Seed verificado 2026-06-25 (`DEMO-*` presente, Twenty GraphQL OK).

Comprobar en UI que existan datos visibles en:

- **Renovaciones:** contratos por vencer (ej. Sigma Alimentos ~45 días)
- **Reservas:** nave en negociación (ej. Nestlé / Nave 4)
- **Pipeline:** deal de Nestlé en etapa Negociación
- **Aprobación:** caso Sigma Alimentos en Revisión Legal

### 4. Microservicio activo para IA y webhooks

| Servicio | Puerto |
| --- | --- |
| Twenty API | 3000 |
| Twenty UI | 3001 |
| `parks-twenty-service` | 3002 |

```bash
cd parks-twenty-service
npm run dev
```

En el front, `VITE_PARKS_SERVICE_URL=http://localhost:3002` (ver `.env.example`).

---

## Prioridad 2 — Siguiente sprint de UI (impacto en demo)

| # | Feature | Descripción | Estado |
| --- | --- | --- | --- |
| 1 | **Kanban de Renovaciones** | Vista drag-and-drop sobre `opportunity.etapaRenovacion` | ✅ |
| 2 | **"Reservar nave" desde el mapa** | Acción en mapa → Reservas | ✅ |
| 3 | **KPI holdovers en vivo** | Summary Renovaciones con conteo real | ✅ |
| 4 | **Ranking de brokers (Comisiones)** | Top brokers con barra de meta | ✅ |
| 5 | **Placeholder Oracle en aprobación** | Etapa 3 flujo legal | ✅ |

### Sprint A — Flujo comercial (completado 2026-06-25)

| Entregable | Ruta / servicio |
| --- | --- |
| Doc flujo demo 18 min | [FLUJO-COMERCIAL-DEMO.md](./FLUJO-COMERCIAL-DEMO.md) |
| Centro notificaciones | `/parks/notificaciones` |
| Webhook lead nuevo → tareas + notas | `opportunity.created` en `oportunidad.handler.ts` |
| Enriquecimiento IA prospecto | `POST /commercial/enrich-prospect` + panel en Pipeline |
| API notificaciones | `GET/PATCH /commercial/notifications` |

### Sprint C — Legal sin fricción (completado 2026-06-25)

| Entregable | Ubicación |
| --- | --- |
| Validación documental IA | `ParksDocumentValidationPanel` en aprobación |
| Generador + editor contratos | `ParksContractEditorPanel` |
| API legal | `parks-twenty-service/src/api/legal.router.ts` |

### Sprint D — Cierre y dinero (completado 2026-06-25)

| Entregable | Ubicación |
| --- | --- |
| Handoff CxC | `ParksCxcHandoffPanel` en aprobación |
| Registrar pago → comisión | Botón en `/parks/comisiones` |
| Mi desempeño broker | `/parks/mi-desempeno` |
| API operaciones | `parks-twenty-service/src/api/operations.router.ts` |

**Estado:** Flujo comercial demo (Sprints A–D) **completo**. Scoring en pipeline y secuencia nurture simulada **completados 2026-06-25**.

### Post-Sprint — Scoring + nurture (completado 2026-06-25)

| Entregable | Ubicación |
| --- | --- |
| Badge fit score + urgencia en cards | `ParksPipelineDealCard` + `POST /commercial/prospect-scores` |
| Secuencia nurture 3 emails | `ParksEmailSequencePanel` + `GET /commercial/email-sequence/:id` |
| Notificaciones por email | Sección dedicada en `/parks/notificaciones` |

### Sprint B — Propuesta comercial (completado 2026-06-25)

| Entregable | Ubicación |
| --- | --- |
| Matching naves top 3 | `ParksCommercialProposalSection` en Pipeline |
| Ficha técnica + link | `POST /commercial/ficha-tecnica` |
| Tracker vistas | `POST /commercial/ficha/:token/view` |
| Guion comercial | `POST /commercial/sales-script` |

### Sprint E — Inspirado en Ascendix (completado 2026-07-10)

| Entregable | Ubicación |
| --- | --- |
| OCR legal → aplicar al expediente | `POST /legal/extract-document` + `apply-extraction` · panel en aprobación |
| Búsqueda de demanda + matching | `/parks/prospectos` · `POST /commercial/demand-search` |
| Composer (brochure + reporte listing) | `ParksComposerPanel` · `POST /commercial/composer/generate` |
| Timeline Gmail + CRM | Tab Actividad en deal · `GET /commercial/activity-timeline/:id` |
| Deal win → reserva nave + expediente | Webhook oportunidad · preview `GET /commercial/deal-win-preview/:id` |
| Acciones masivas seguimiento | `POST /commercial/bulk-follow-up` |

---

## Prioridad 3 — Fuera de alcance demo (producción / negocio)

Ítems documentados en [PROGRESS.md](./PROGRESS.md) como **fuera de scope** o **dependencia externa**:

| Ítem | Responsable | Estado |
| --- | --- | --- |
| Integración Oracle ERP real | TI Parks + Javier (Bridge) | ⬜ Documentación pendiente |
| Texto legal en plantillas HBS (5 contratos) | Catalina Moreno Monroy | ⬜ Fase 4 proyecto real |
| Reglas de comisión `%` (`COMISION_EJECUTIVO_PCT`) | Dirección Parks | ⬜ Por confirmar |
| SLA pausa por documentos incompletos | Parks Industrial | ⬜ Flag `SLA_PAUSA_POR_DOCS` TBD |
| Portal para brokers externos | — | ⬜ Fuera de scope demo |
| Firma digital (DocuSign, S-Sign) | — | ⬜ Fuera de scope demo |
| Account Engagement / Marketing | — | ⬜ Fuera de scope demo |

### Producción

- [ ] Deploy imagen GHCR / entorno staging o producción
- [ ] Variables de entorno por ambiente (`TWENTY_API_KEY`, `ENCRYPTION_KEY`, `GOOGLE_MAPS_API_KEY`)
- [ ] Webhooks apuntando a URL pública del microservicio (no `localhost:3002`)
- [ ] `ORACLE_MOCK=false` solo cuando exista integración real

---

## Deuda técnica y documentación

| Ítem | Acción sugerida |
| --- | --- |
| [DASHBOARD_PROGRESS.md](./DASHBOARD_PROGRESS.md) desactualizado | Agregar rutas Renovaciones y Reservas |
| [PROGRESS.md](./PROGRESS.md) última sesión 2026-06-20 | Actualizar al cerrar próxima sesión |
| `apps/parks-dashboard` legacy | Deprecar o sincronizar nav con Twenty; no usar para demo principal |
| Hook seguro para objetos opcionales (`holdover`) | Patrón componente-guard implementado; opcional: `useParksFindManyRecords` |
| Rebuild `twenty-shared` tras cambios en `AppPath` | `npx nx build twenty-shared` después de nuevas rutas |

---

## Orden recomendado de trabajo

```
1. Asignar roles + verificar seed demo          ← operación, sin código
2. Commit / push módulo parks-industrial        ← entrega
3. Kanban Renovaciones                          ← mayor WOW comercial
4. Reservar nave desde mapa                     ← cierra loop Mapa ↔ Reservas
5. Ranking brokers + placeholder Oracle         ← pulido demo legal/comercial
6. Producción + Oracle real                     ← post-demo con cliente
```

---

## Comandos de referencia

### Desarrollo local (UI con hot-reload)

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker
yarn start
# UI: http://localhost:3001/parks/dashboard
```

### Microservicio + setup metadata

```bash
cd parks-twenty-service
npm run dev
npm run setup:objects
npm run setup:opportunity
npm run setup:pipelines
npm run setup:roles
npm run setup:assign-roles
npm run setup:dashboards
npm run setup:webhooks
npm run seed:demo
npm run health
npm run e2e:test
```

### Rebuild shared (tras cambios en rutas AppPath)

```bash
npx nx build twenty-shared
```

---

## Historial de este documento

| Fecha | Cambio |
| --- | --- |
| 2026-07-13 | Módulo CxC demo: `/parks/cxc`, API `/cxc/*`, handoff→cartera, US doc |
| 2026-07-13 | App móvil Campo LO: `/parks/campo` — notas de tour, guión, checklist |
| 2026-07-10 | Sprint E Ascendix: OCR, prospect search, Composer, timeline, deal-win |
| 2026-06-25 | Scoring pipeline + secuencia nurture simulada; seed verificado |
| 2026-06-20 | Creación inicial tras fix Renovaciones/Reservas y revisión de roadmap |

---

*Actualizar este archivo cuando se complete un ítem de Prioridad 1 o 2.*
