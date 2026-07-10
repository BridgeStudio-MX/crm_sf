# Flujo comercial Parks Industrial — Demo WOW

> **Versión:** 2.0 · Jul 2026  
> **Alcance:** User stories comerciales A–C + E–F hasta Hoja de Acuerdos (antes de Legal)  
> **Sprint activo:** Flujo comercial US acoplado · handoff Legal desactivado por defecto

---

## Principio rector

El flujo comercial correcto (esta entrega) es:

**capturar → asignar (CEM) → calificar → match naves → tour → cotización → negociación/aprobación → Hoja de Acuerdos firmada**

**STOP** antes de Legal. `PARKS_LEGAL_HANDOFF_ENABLED=false` evita crear `casoLegal` al llegar a Hoja.

---

## Flujo maestro comercial (hasta Hoja)

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────┐
│  CAPTURA    │ →  │ CALIFICACIÓN │ →  │  PROPUESTA  │ →  │   HOJA     │
│  + CEM      │    │  + MATCHING  │    │  + TOUR     │    │  ACUERDOS  │
└─────────────┘    └──────────────┘    └─────────────┘    └────────────┘
                                                              │
                                                              ▼
                                                         STOP (Legal off)
```

---

## FASE 1 — Captura e inteligencia

| # | Paso | Pantalla / API | Estado |
|---|------|----------------|--------|
| 1 | Crear lead (campos US-001) | Pipeline → Nuevo lead · `POST /commercial/leads` | ✅ |
| 2 | CEM ve leads sin asignar | Banner en Pipeline → `/parks/leads-cem` · cola en Dashboard · `GET /commercial/leads/unassigned` | ✅ |
| 3 | CEM asigna LO + audit + tarea 24h | `POST /commercial/leads/:id/assign` | ✅ |
| 4 | IA enriquece + scoring + nurture | Paneles existentes | ✅ |
| 5 | Gates a Calificado | m² + ubicación + giro + plazo + presupuesto | ✅ |

---

## FASE 2 — Tour y cotización

| # | Paso | Pantalla / API | Estado |
|---|------|----------------|--------|
| 6 | Match naves (m², zona, altura, andenes) | Propuesta + `POST /commercial/match-naves` | ✅ |
| 7 | Registrar tour + tarea 48h | Panel flujo comercial · decisores asistentes · `POST /commercial/tour` | ✅ |
| 8 | Cotización formal (renta = m²×precio) + 5 días hábiles | `POST /commercial/quotations/:id/send` | ✅ |
| 8b | Ficha técnica (marketing) | Panel propuesta | ✅ |

---

## FASE 3 — Negociación, broker, pérdida

| # | Paso | Estado |
|---|------|--------|
| 9 | Aprobación CEM/CEO condiciones especiales | ✅ |
| 10 | Broker Top 10 / No top 10 → esquema comisión | ✅ |
| 11 | Pérdida con motivo + reactivación / competidor | ✅ |
| 12 | Nave Disponible → match oportunidades perdidas | ✅ webhook nave |

---

## FASE 4 — Hoja de Acuerdos (corte Legal)

| # | Paso | Estado |
|---|------|--------|
| 13 | Generar Hoja desde oportunidad | ✅ `POST /commercial/hoja-acuerdos` |
| 14 | Firma CEM + cliente | ✅ `POST /commercial/hoja-acuerdos/:id/sign` |
| 15 | Handoff Legal | ⬜ Desactivado (`PARKS_LEGAL_HANDOFF_ENABLED=false`) |

---

## Extras

| Feature | Ruta / nota |
|---------|-------------|
| Build-to-suit campos | Modal nuevo lead + opportunity fields |
| Cuenta 360 | `/parks/inquilinos/:inquilinoId` — contratos + decisores §4.8 |
| Stage gates kanban | `POST /commercial/stage-gate` |

---

## Guión demo comercial (12 min)

| Min | Acción |
|-----|--------|
| 0–2 | Nuevo lead LogiMex + notificación CEM |
| 2–4 | CEM asigna a Alejandro García |
| 4–6 | Calificar → match naves → registrar tour |
| 6–8 | Enviar cotización → solicitar aprobación |
| 8–10 | Generar Hoja → firmar CEM+cliente (sin caso legal) |
| 10–12 | Marcar otra opp como Pospuesto con fecha reactivación |

---

## Activar handoff Legal (entrega posterior)

```bash
# parks-twenty-service/.env
PARKS_LEGAL_HANDOFF_ENABLED=true
```

---

*Actualizado Jul 2026 — acoplamiento User Stories Comerciales Bridge Studio + documento maestro Salesforce (`docs/parks-industrial/Parks_Industrial_Salesforce_ProyectoCompleto.md`)*
