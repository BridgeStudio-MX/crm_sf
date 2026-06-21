# Parks Industrial — Progreso de implementación

> **Cliente:** Parks Industrial  
> **Proyecto:** Twenty CRM + microservicio Node.js/TypeScript  
> **Blueprint:** [parks-industrial-twenty-blueprint.md](./parks-industrial-twenty-blueprint.md) (v1.1, Jun 2026)  
> **Última actualización:** 2026-06-20

---

## Dónde estamos ahora

| Campo | Valor |
| --- | --- |
| **Fase actual** | Fase B completada — listo para demo con cliente |
| **Siguiente paso** | Asignar roles a usuarios en Twenty Settings · Demo con Parks |
| **Bloqueado por** | Nada |
| **Última sesión** | Pasos 6b + 7b: 8 roles Parks + 2 dashboards (Legal + Ejecutivo) |

### Cómo retomar en la próxima sesión

1. Leer la sección **Siguiente paso** de este archivo.
2. Consultar el blueprint en la sección indicada (ej. Sección 9, Paso N).
3. Al terminar una sesión, actualizar este archivo: marcar checkboxes, cambiar **Fase actual** / **Siguiente paso**, y agregar una línea en **Historial de sesiones**.

---

## Trabajo previo en el fork (Bridge Studio)

Completado antes de iniciar el blueprint Parks Industrial:

- [x] Entorno local (Twenty `:3000`, UI `:3001`, Postgres/Redis Docker)
- [x] Traducciones al español (objetos, campos, vistas, etapas Kanban, locale `es-ES`)
- [x] Caché de metadatos invalidada al cambiar idioma (`syncApplicationMetadataLocale`)
- [x] Menú interno: ocultar Community, Documentación, Panel admin → Empresa
- [x] Commit local guardado (sin push a remoto aún)

Pendiente del README_BS original (revisar si aplica al scope Parks):

- [ ] Actualizar `README_BS.md` marcando traducciones/menú como hechos
- [ ] Revisar resto de ítems de menú para CRM interno Parks

---

## Mapa de fases (Sección 9 del blueprint)

Orden **obligatorio** — no saltar pasos.

### Fase A — Microservicio base

| Paso | Descripción | Blueprint | Estado |
| --- | --- | --- | --- |
| 1 | Setup `parks-twenty-service` (Express, TS, deps) | §9 Paso 1 | ✅ Hecho |
| 2 | Cliente GraphQL Twenty (`twenty.client.ts`) | §9 Paso 2 | ✅ Hecho |
| 6 | Cliente Oracle **modo mock** + cron sync | §9 Paso 6, §4.6 | ✅ Hecho |
| 7 | Plantillas HBS de contratos (5 archivos) | §9 Paso 7, §4.5 | ✅ Hecho |
| 8 | Servicios: SLA, semáforo, checklist, holdover, comisiones, PDF, notificaciones, expediente | §9 Paso 8 | ✅ Hecho |
| 9 | Webhook handlers | §9 Paso 9 | ✅ Hecho |
| 11 | Crons (SLA, holdover, renovaciones, Oracle) | §9 Paso 11 | ✅ Hecho |

### Fase B — Twenty (Metadata API)

| Paso | Descripción | Blueprint | Estado |
| --- | --- | --- | --- |
| 3 | Custom objects (12 objetos, orden de dependencias) | §2, §9 Paso 3 | ✅ Hecho |
| 4 | Extender Oportunidad nativa (campos custom) | §3 Pipeline 1, §9 Paso 4 | ✅ Hecho |
| 5 | 4 pipelines (Comercial, Legal, Renovaciones, Holdovers) | §3, §9 Paso 5 | ✅ Hecho |
| 10 | Configurar webhooks en Twenty → microservicio | §9 Paso 10 | ✅ Hecho |
| 6b | Roles y permisos (Sección 6) | §6 | ✅ Hecho |
| 7b | Dashboards Legal + Ejecutivo | §7 | ✅ Hecho |

### Fase C — Demo y validación

| Paso | Descripción | Blueprint | Estado |
| --- | --- | --- | --- |
| 12 | Seed demo (6 casos + parques, naves, brokers) | §9 Paso 12, §13 | ✅ Hecho |
| 13 | Verificación end-to-end | §9 Paso 13 | ✅ Hecho |

**Leyenda:** ⬜ Pendiente · 🔄 En curso · ✅ Hecho · ⏸ Pausado

---

## Custom objects a crear (checklist detallado)

Referencia: Sección 2 del blueprint. Crear en este orden vía Metadata API:

1. [x] `parque` (`parque`)
2. [x] `nave` → Parque
3. [x] `inquilino`
4. [x] `broker`
5. [x] `hojaDeAcuerdos` → Nave, Inquilino, Broker
6. [x] `casoLegal` → HojaDeAcuerdos, Inquilino, Nave
7. [x] `documentoChecklist` → CasoLegal
8. [x] `versionDocumento` → CasoLegal
9. [x] `flujoFirmas` → CasoLegal
10. [x] `holdover` → CasoLegal, Inquilino, Nave
11. [x] `comision` → HojaDeAcuerdos, CasoLegal
12. [x] `expedienteContrato` → CasoLegal, Inquilino, Nave

> **Nota:** Twenty exige nombres API en **camelCase** (sin `_`). El blueprint usa snake_case; en código/API usamos camelCase (`hojaDeAcuerdos`, `casoLegal`, etc.). Algunos objetos tienen campo `referencia`/`titulo` TEXT extra para el label identifier (Twenty no permite SELECT/DATE/NUMBER).

---

## Pipelines a crear

1. [x] Pipeline Comercial Parks Industrial (`opportunity.stage` — 9 etapas)
2. [x] Pipeline Legal Parks Industrial (`casoLegal.estatus` — Kanban)
3. [x] Pipeline Renovaciones (`opportunity.etapaRenovacion` — 8 etapas)
4. [x] Holdovers Activos (`holdover.etapaPipeline` — 8 etapas)

---

## Decisiones y riesgos documentados

### Conflicto de puertos (importante)

El blueprint asigna el microservicio al **puerto 3001**, pero en este fork la **UI de Twenty ya usa `:3001`** y la API `:3000`.

**Decisión pendiente:** usar para `parks-twenty-service`:

- Opción recomendada: **`:3002`** (microservicio) y actualizar webhooks en Twenty accordingly, **o**
- Mantener 3001 solo para el microservicio en producción y mover Vite a otro puerto en dev.

Registrar la decisión aquí cuando se tome:

```
PUERTO_MICROSERVICIO=3002   ← confirmado para dev local (npm run dev)
WEBHOOK_URL=http://localhost:3002/webhooks/twenty
```

### Fuera de scope (no implementar)

- Account Engagement / Marketing automation
- Firma digital (DocuSign, S-Sign)
- Portal para brokers externos
- Oracle real en demo (`ORACLE_MOCK=true` hasta Fase 6 producción)

### Dependencias externas

| Dependencia | Responsable | Estado |
| --- | --- | --- |
| Endpoints Oracle ERP | Equipo TI Parks + Javier (Bridge) | ⬜ Pendiente documentación |
| Texto legal cláusulas HBS | Catalina Moreno Monroy | ⬜ Fase 4 del proyecto real |
| Reglas comisión `%` | Dirección Parks | ⬜ Confirmar `COMISION_EJECUTIVO_PCT` |
| SLA pausa por docs incompletos | Parks Industrial | ⬜ Flag `SLA_PAUSA_POR_DOCS` TBD |

### Contactos de negocio (referencia)

- **Lilibeth** — contacto principal del proyecto
- **Catalina Moreno Monroy** — legal, cotejo y documentación
- **Héctor Montelongo** — proceso comercial
- **Charlie Meta** — CEO, aprobaciones ejecutivas
- **Javier (Bridge Studio)** — integración Oracle producción

---

## Variables de entorno clave

Ver Sección 8 del blueprint. Archivo objetivo: `parks-twenty-service/.env`

```bash
TWENTY_API_URL=http://localhost:3000
TWENTY_API_KEY=...
PORT=3002                    # ver nota de puertos arriba
FORCE_DEMO_SEED=false           # true para re-ejecutar seed demo
ORACLE_MOCK=true
COMISION_EJECUTIVO_PCT=0.03  # pendiente confirmar con Parks
HOLDOVER_MULTIPLIER=2
```

---

## Historial de sesiones

| Fecha | Qué se hizo | Siguiente |
| --- | --- | --- |
| 2026-06-20 | Traducciones ES, locale, menú interno, commit local. Blueprint importado a `docs/parks-industrial/`. | Paso 1: scaffold `parks-twenty-service` |
| 2026-06-21 | Paso 11: `renovacion.service` (alertas 12/6/3/1 meses) + crons con try/catch + `crons:test`. | Paso 12: seed demo |
| 2026-06-20 | Paso 12: `demo-seed.service` + `npm run seed:demo`. Fix PDF relaciones/plantillas. | Paso 13: E2E |
| 2026-06-20 | Paso 13: `e2e-verification.service` + `npm run e2e:test` — 11/11. | Roles + dashboards |
| 2026-06-20 | Pasos 6b+7b: `setup:roles` (8 roles) + `setup:dashboards` (Legal + Ejecutivo, 15 widgets). | Asignar roles a usuarios |

---

## Comandos útiles (Twenty / fork)

```bash
# UI local (hot-reload)
bash packages/twenty-utils/setup-dev-env.sh --docker
# Backend + front + worker (ver README_BS / sesiones previas)

# Metadata API
open http://localhost:3000/metadata

# GraphQL
open http://localhost:3000/graphql
```

Cuando exista el microservicio:

```bash
cd parks-twenty-service
npm run dev
npm run setup:objects
npm run setup:opportunity
npm run setup:pipelines
npm run setup:roles
npm run setup:dashboards
npm run setup:webhooks
npm run seed:demo
npm run health
npm run services:test
npm run webhook:test
npm run crons:test
npm run e2e:test
npm run pdf:test
npm run oracle:test
```

---

*Actualizar este archivo al cerrar cada sesión de trabajo.*
