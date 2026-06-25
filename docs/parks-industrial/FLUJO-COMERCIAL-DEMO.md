# Flujo comercial Parks Industrial — Demo WOW

> **Versión:** 1.0 · Jun 2026  
> **Alcance:** Guión de demostración y mapa de capacidades (existentes vs. pendientes)  
> **Sprint activo:** Completado A–D + scoring + nurture simulado

---

## Principio rector

El flujo correcto es:

**capturar → enriquecer → asignar tareas → recomendar naves → enviar propuesta rastreable → avanzar pipeline → validar documentos → generar contratos → legal → CxC → comisión**

---

## Flujo maestro (5 fases, 18 pasos)

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────┐    ┌─────────────┐
│  CAPTURA    │ →  │ CALIFICACIÓN │ →  │  PROPUESTA  │ →  │   CIERRE   │ →  │ POST-CIERRE │
│  + IA       │    │  + MATCHING  │    │  COMERCIAL  │    │   LEGAL    │    │  CxC + $$$  │
└─────────────┘    └──────────────┘    └─────────────┘    └────────────┘    └─────────────┘
```

---

## FASE 1 — Captura e inteligencia (WOW #1)

| # | Paso | Qué pasa | Pantalla / módulo | Estado |
|---|------|----------|-------------------|--------|
| 1 | Lead entra al CRM | Web, referido, feria, llamada, LinkedIn, importación manual | Pipeline → *Prospecto nuevo* | ✅ |
| 2 | IA enriquece al prospecto | Empresa, industria, señales, tamaño, riesgo | Panel enriquecimiento en deal | ✅ Sprint A |
| 3 | Scoring automático | Puntaje fit industrial, urgencia, ticket | Badge en tarjeta pipeline | ✅ |
| 4 | Tareas automáticas al equipo | Broker: llamar en 2h. Asistente: dossier. Director: revisar si >X m² | `/parks/notificaciones` + Tasks Twenty | ✅ Sprint A |
| 5 | Secuencia de emails | Nurture por industria y etapa | Panel en deal + Notificaciones | ✅ (simulado) |

**Momento WOW:** Crear lead "Acme Logistics" → en segundos aparece resumen IA + 3 tareas + notificación al broker.

---

## FASE 2 — Propuesta comercial (WOW #2)

| # | Paso | Qué pasa | Pantalla | Estado |
|---|------|----------|----------|--------|
| 6 | IA recomienda naves | Cruza ubicación, m², presupuesto, industria | Mapa + Reservas + IA | ✅ Sprint B |
| 7 | Guion comercial por industria | Script de llamada/visita | Panel guion en Pipeline | ✅ Sprint B |
| 8 | Ficha técnica al prospecto | PDF o link público con tracker | Panel ficha en Pipeline | ✅ Sprint B |
| 8.1 | Registro del envío | Broker marca canal de envío | Botones email/WhatsApp/link | ✅ Sprint B |
| 8.2 | Tracker de visualización | Prospecto abre link → alerta al broker | Simular apertura + Notificaciones | ✅ Sprint B |

**Momento WOW:** Mover deal a *Visita agendada* → IA sugiere 3 naves → generar link → simular apertura → notificación en vivo.

---

## FASE 3 — Avance y expediente (WOW #3)

| # | Paso | Qué pasa | Pantalla | Estado |
|---|------|----------|----------|--------|
| 9 | Prospecto avanza en pipeline | Tour → Cotización → Negociación | Pipeline Kanban | ✅ |
| 10 | Checklist documental | RFC, acta, ID, comprobante fiscal | Contratos / expediente | ✅ backend |
| 11 | IA extrae y valida documentos | OCR: razón social vs acta, m² vs LOI | Validación documental | ✅ Sprint C |
| 11.1 | Alertas de mismatch | Semáforo rojo/verde | Aprobación legal | ✅ Sprint C |

---

## FASE 4 — Contratos y legal (WOW #4)

| # | Paso | Qué pasa | Pantalla | Estado |
|---|------|----------|----------|--------|
| 12 | Generación de contratos base | LOI, arrendamiento, renovación, término, ajustes | Generador documentos | ✅ Sprint C |
| 13 | Editor in-app | Editar cláusulas sin salir del CRM | Editor HTML en aprobación | ✅ Sprint C |
| 14 | Pre-validación → Legal | Comercial envía paquete; Legal aprueba | Aprobación legal + pre-envío | ✅ Sprint C |

---

## FASE 5 — Post-cierre (WOW #5)

| # | Paso | Qué pasa | Pantalla | Estado |
|---|------|----------|----------|--------|
| 15 | Handoff a CxC | Contrato firmado → ticket CxC | Panel handoff en aprobación | ✅ Sprint D |
| 16 | Cobranza en curso | Renta, holdover, morosidad | Renovaciones | ✅ |
| 17 | Pago → comisiones | Calcula % broker, ejecutivo, referido | Comisiones + ranking | ✅ Sprint D |
| 18 | Dashboard del broker | KPIs del cierre | `/parks/mi-desempeno` | ✅ Sprint D |

---

## Guión demo 18 minutos

| Min | Acción | WOW |
|-----|--------|-----|
| 0–2 | Dashboard ejecutivo | Vista 360° cartera |
| 2–4 | Crear lead + IA enriquece | "El CRM investigó solo" |
| 4–6 | Notificaciones + tareas al broker | "Nadie se le olvida nada" |
| 6–8 | IA recomienda naves en mapa + reservar | Matching visual |
| 8–10 | Enviar ficha con link → simular apertura | Notificación en vivo |
| 10–12 | Mover pipeline + subir documento | IA detecta error |
| 12–14 | Generar LOI editado | De datos a contrato |
| 14–16 | Aprobación legal (Catalina) | Flujo multi-área |
| 16–18 | Pago → comisión + ranking | Cierre del ciclo |

---

## Sprints de construcción

### Sprint A — "El broker vive en el CRM" ✅ en curso

- Centro de notificaciones (`/parks/notificaciones`)
- Tareas automáticas al crear lead (webhook `opportunity.created`)
- Enriquecimiento IA demo (mock + OpenAI opcional)
- API: `GET/PATCH /commercial/notifications`, `POST /commercial/enrich-prospect`

### Sprint B — "Propuesta que vende" ✅ completado 2026-06-25

| Entregable | Ruta / servicio |
| --- | --- |
| Matching IA de naves (top 3) | `POST /commercial/match-naves` + panel en Pipeline |
| Ficha técnica PDF + link público | `POST /commercial/ficha-tecnica`, `GET /commercial/ficha/:token` |
| Tracker de visualización | `POST /commercial/ficha/:token/view` → notificación broker |
| Registro de envío (email/WhatsApp/link) | `POST /commercial/ficha/:token/sent` |
| Guiones comerciales por industria | `POST /commercial/sales-script` + panel en Pipeline |

**Siguiente:** Sprint C (validación documental IA, generador contratos + editor).

### Sprint C — "Legal sin fricción" ✅ completado 2026-06-25

| Entregable | Ruta / servicio |
| --- | --- |
| Validación documental IA | `POST /legal/validate-documents` |
| Generador 6 tipos (incl. LOI) | `POST /legal/generate-contract` |
| Editor de borrador | `PUT /legal/contract-draft/:id` |
| Export PDF | `POST /legal/contract-draft/:id/pdf` |
| Pre-envío a Legal (Catalina) | `POST /legal/pre-send-legal` |

**Siguiente:** Flujo demo completo — listo para presentación cliente.

### Sprint D — Cierre y dinero ✅ completado 2026-06-25

| Entregable | Ruta / servicio |
| --- | --- |
| Handoff CxC | `POST /operations/cxc-handoff` |
| Pago → comisión automática | `POST /operations/register-payment` |
| Dashboard broker | `GET /operations/broker-performance` + `/parks/mi-desempeno` |

### Sprint D — "Cierre y dinero"

- Handoff CxC
- Dashboard "Mi desempeño" broker
- Integración pago → comisión automática

---

## Integración técnica (Sprint A)

| Componente | Ubicación |
|------------|-----------|
| Webhook lead nuevo | `parks-twenty-service/src/webhooks/handlers/oportunidad.handler.ts` |
| Onboarding + tareas | `parks-twenty-service/src/services/lead-onboarding.service.ts` |
| Store notificaciones | `parks-twenty-service/src/services/broker-notification.store.ts` |
| Enriquecimiento IA | `parks-twenty-service/src/services/prospect-enrichment.service.ts` |
| API comercial | `parks-twenty-service/src/api/commercial.router.ts` |
| UI notificaciones | `packages/twenty-front/.../notificaciones/` |
| Panel enriquecimiento | `packages/twenty-front/.../ParksProspectEnrichmentPanel.tsx` |

### Configuración local

```bash
# packages/twenty-front/.env
VITE_PARKS_SERVICE_URL=http://localhost:3002

# parks-twenty-service/.env (opcional para LLM real)
OPENAI_API_KEY=sk-...
PARKS_AI_MOCK=false
```

### Demo rápida

1. Arrancar `parks-twenty-service` en `:3002`
2. Crear oportunidad en etapa *Prospecto nuevo* (o disparar webhook)
3. Abrir `/parks/notificaciones` — ver tareas y alertas
4. Abrir deal en Pipeline — ver panel de enriquecimiento IA
