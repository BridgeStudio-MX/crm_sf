# Parks Industrial — Qué falta

> **Última actualización:** 2026-06-25  
> **Referencia:** [PROGRESS.md](./PROGRESS.md) · [DASHBOARD_PROGRESS.md](./DASHBOARD_PROGRESS.md) · [FLUJO-COMERCIAL-DEMO.md](./FLUJO-COMERCIAL-DEMO.md) · [Blueprint UI](../../Parks_Industrial_Cursor_Blueprint.md)

Documento de seguimiento de trabajo pendiente tras completar los módulos base de UI en Twenty (`/parks/*`), el microservicio `parks-twenty-service` y las vistas **Renovaciones** y **Reservas**.

---

## Resumen ejecutivo

| Área | Estado general |
| --- | --- |
| Backend (microservicio + metadata Twenty) | ✅ Base completa (fases A–C del blueprint §9) |
| UI integrada en Twenty (`packages/twenty-front`) | ✅ 11 módulos operativos (+ Sprint A comercial) |
| Demo lista para cliente | 🔄 Falta operación (roles, commit) |
| Producción / integraciones reales | ⬜ Pendiente |

---

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
| Pipeline comercial | `/parks/pipeline` | Kanban con drag-and-drop |
| Contratos | `/parks/contratos` | Lista de expedientes |
| Aprobación legal | `/parks/contratos/:contratoId/aprobacion` | Timeline + acciones |
| Comisiones | `/parks/comisiones` | Tabla y resumen |
| Mapa | `/parks/mapa` | Google Maps + panel lateral |
| Renovaciones | `/parks/renovaciones` | Cola de vencimientos + holdovers |
| Reservas | `/parks/reservas` | Naves en negociación |
| Notificaciones | `/parks/notificaciones` | Centro broker: tareas IA, alertas, enriquecimiento |
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

Mapeo demo (@apple.dev → persona Parks):

| Usuario | Rol Parks | Persona demo |
| --- | --- | --- |
| `jane.austen@apple.dev` | Admin Legal | Catalina |
| `phil.schiler@apple.dev` | Director Comercial | Héctor |
| `jony.ive@apple.dev` | CEO | Charlie |
| `scott.forstall@apple.dev` | CxC | Cobranza |
| `tim@apple.dev` | Ejecutivo Comercial | Broker principal |

**Nota:** el workspace local puede tener solo `tim@apple.dev`. Invita a los demás en **Settings → Members** y vuelve a ejecutar `setup:assign-roles`, o asigna manualmente en la UI.

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

- **Renovaciones:** contratos por vencer (ej. Genomma ~45 días)
- **Reservas:** nave en negociación (ej. Nestlé / Nave 4)
- **Pipeline:** deal de Nestlé en etapa Negociación
- **Aprobación:** caso Genomma en Revisión Legal

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
| 2026-06-25 | Scoring pipeline + secuencia nurture simulada; seed verificado |
| 2026-06-20 | Creación inicial tras fix Renovaciones/Reservas y revisión de roadmap |

---

*Actualizar este archivo cuando se complete un ítem de Prioridad 1 o 2.*
