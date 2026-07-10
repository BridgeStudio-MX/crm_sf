# Checklist de validación — Flujo comercial Parks Industrial

> **Versión:** 1.0 · Jul 2026  
> **Referencia:** [FLUJO-COMERCIAL-DEMO.md](./FLUJO-COMERCIAL-DEMO.md)  
> **Alcance:** Fases 1–4 (captura → Hoja de Acuerdos) · **STOP** antes de Legal

---

## Prerrequisitos

| # | Requisito | ✓ |
|---|-----------|---|
| P1 | Frontend en `http://localhost:3001` (o tu URL de dev) | [ ] |
| P2 | Twenty API en `http://localhost:3000` | [ ] |
| P3 | `parks-twenty-service` en `http://localhost:3002` | [ ] |
| P4 | `PARKS_LEGAL_HANDOFF_ENABLED=false` en `.env` del microservicio | [ ] |
| P5 | Auth OK: `curl http://localhost:3002/commercial/leads/unassigned` → `200` | [ ] |
| P6 | (Recomendado) `TWENTY_API_KEY` configurada para evitar token expirado | [ ] |

**Health rápido**

```bash
curl -s http://localhost:3002/commercial/leads/unassigned | head -c 200
```

---

## FASE 1 — Captura + CEM (pasos 1–5)

### 1. Crear lead

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Pipeline → **Nuevo lead** | Modal abre | [ ] |
| Completar: empresa, contacto, **canal** (ej. Página web), m², ubicación, giro, plazo, presupuesto | Campos obligatorios validados | [ ] |
| Guardar | Lead creado sin error | [ ] |
| Revisar banner **leads sin asignar** en Pipeline (si hay pendientes) | Enlace a cola CEM | [ ] |
| Revisar cola en **Dashboard** o `/parks/leads-cem` | Lead visible con asignación | [ ] |
| Revisar kanban columna **Lead recibido** | Deal visible | [ ] |

**Pass:** lead en cola CEM (Dashboard o `/parks/leads-cem`) y en kanban (Lead recibido).

---

### 2. Cola CEM

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| En Pipeline: banner compacto (solo si hay pendientes) | Texto + enlace **Ir a cola CEM** | [ ] |
| En Dashboard: sección **Cola CEM** | Hasta 3 leads + botón Asignar | [ ] |
| Enlace **Ver más (N)** o **Abrir cola completa** | Visible cuando hay más de 3 | [ ] |
| Clic en enlace → `/parks/leads-cem` | Navega a página Leads CEM | [ ] |
| En `/parks/leads-cem` | Cola completa | [ ] |
| Por lead: badge **canal** | Página web, LinkedIn, Call Center, etc. | [ ] |
| Por lead: ubicación, m², antigüedad | Meta visible cuando hay datos | [ ] |
| Menú lateral **Leads CEM** | Acceso directo a la misma página | [ ] |

**Pass:** banner en Pipeline (si aplica) + gestión en Dashboard y `/parks/leads-cem`.

---

### 3. Asignar LO

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Elegir LO (ej. Alejandro García) → **Asignar** | Sin error | [ ] |
| Lead desaparece de la lista | Inmediato, **sin refresh** de pantalla | [ ] |
| No aparece “Cargando…” de pantalla completa | UI estable | [ ] |
| (Opcional) Tarea de contacto ~24h en Twenty | Tarea/nota creada | [ ] |

**Pass:** asignación local sin recargar la página.

---

### 4. IA (si aplica)

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Abrir deal → paneles IA / scoring | Panel visible | [ ] |
| Enriquecimiento o score | Datos mostrados (si `OPENAI_API_KEY` o mock activo) | [ ] |

**Pass:** enriquecimiento o score presente (o N/A si IA desactivada).

---

### 5. Gate a Calificado

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Deal con m² + ubicación + giro + plazo + presupuesto | Arrastrar a **Calificado** → **pasa** | [ ] |
| Deal sin alguno de esos campos | Gate **bloquea** con mensaje claro | [ ] |

**Pass:** gate permite solo cuando calificación completa.

---

## FASE 2 — Match, tour, cotización (pasos 6–8)

### 6. Match naves

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Abrir deal → sección propuesta / matching | Sección visible | [ ] |
| **Actualizar** matching | Naves con score y razones | [ ] |
| Seleccionar nave candidata | Selección activa | [ ] |
| (Opcional) **Generar ficha y link** | Link/PDF generado (paso 8b) | [ ] |

**Pass:** matching operativo con score y razones.

---

### 7. Tour

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Panel flujo comercial: fecha, feedback, próximos pasos | Campos editables | [ ] |
| Panel **Decisores del cliente**: roles §4.8 (2–5 personas) | Agregar/editar/eliminar decisores | [ ] |
| Marcar decisores que **asistieron al tour** | Checkboxes + sync a `tourAsistentes` | [ ] |
| **Guardar tour** | Mensaje tour registrado / tarea +48h | [ ] |

**Pass:** tour persistido con asistentes del cliente identificados.

---

### 8. Cotización

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| **Preview renta** | Monto calculado (m² × precio) | [ ] |
| **Enviar cotización** | Confirmación de envío | [ ] |
| Seguimiento ~5 días hábiles | Mensaje o tarea programada | [ ] |

**Pass:** cotización formal enviada.

---

## FASE 3 — Aprobación, broker, pérdida (pasos 9–12)

### 9. Aprobación

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| **Solicitar aprobación** | Solicitud registrada | [ ] |
| **Aprobar (CEM)** | Estatus aprobación = concedida | [ ] |

**Pass:** flujo CEM/CEO condiciones especiales OK.

---

### 10. Broker (si deal vía broker)

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Registro broker: Top 10 / No top 10 | Clasificación visible | [ ] |
| Esquema comisión | Refleja clasificación | [ ] |

**Pass:** esquema alineado a clasificación broker.

---

### 11. Pérdida (usar **otra** oportunidad, no el happy path)

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Motivo **Pospuesto** + fecha reactivación | Campos completos | [ ] |
| **Registrar pérdida** | Opp marcada perdida | [ ] |
| Pipeline activo | Deal ya no en flujo activo | [ ] |

**Pass:** pérdida registrada con motivo y fecha.

---

### 12. Reactivación por nave (avanzado)

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Nave pasa a **Disponible** (webhook/estatus) | Evento disparado | [ ] |
| Match/alerta sobre opps perdidas compatibles | Notificación o match (si webhook cableado) | [ ] |

**Pass:** reactivación automática operativa (o N/A si webhook no configurado).

---

## FASE 4 — Hoja (pasos 13–15) — STOP Legal

### 13–14. Hoja de Acuerdos

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Deal happy path → **Generar Hoja** | Hoja creada (borrador) | [ ] |
| **Firmar CEM + cliente** | Hoja firmada | [ ] |
| Mensaje tipo “lista para Legal (handoff off)” | Visible en UI | [ ] |

**Pass:** Hoja generada y firmada.

---

### 15. Handoff Legal

| Acción | Resultado esperado | ✓ |
|--------|-------------------|---|
| Verificar que **no** se creó `casoLegal` nuevo | Sin registro legal nuevo | [ ] |
| Con `PARKS_LEGAL_HANDOFF_ENABLED=false` | Sin handoff automático | [ ] |

**Pass:** corte comercial respetado — STOP antes de Legal.

---

## Extras

| Feature | Cómo validar | ✓ |
|---------|--------------|---|
| Cuenta 360 | `/parks/inquilinos/:inquilinoId` — contratos + **decisores** + contacto | [ ] |
| Decisores §4.8 | Modal deal → panel Decisores del cliente (roles doc. maestro) | [ ] |
| Build-to-suit (BTS) | Campos BTS en Nuevo lead / opportunity | [ ] |
| Stage gates kanban | Arrastrar a etapa sin requisitos → debe bloquear | [ ] |

---

## Guión demo 12 min — checklist

| Min | Acción | ✓ |
|-----|--------|---|
| 0–2 | Nuevo lead LogiMex | [ ] |
| 2–4 | CEM asigna a Alejandro García (sin reload) | [ ] |
| 4–6 | Calificar → match naves → registrar tour | [ ] |
| 6–8 | Cotización → solicitar aprobación → aprobar CEM | [ ] |
| 8–10 | Generar Hoja → firmar CEM + cliente (sin caso legal) | [ ] |
| 10–12 | Otra opp → Pospuesto + fecha reactivación | [ ] |

---

## Validación backend (API) — pass/fail

Base URL: `http://localhost:3002/commercial`

Sustituye `{OPP_ID}` por el UUID de la oportunidad.

### Fase 1

```bash
# 1 — Cola sin asignar (debe incluir leads en LEAD_RECIBIDO sin asignadoPor)
curl -s http://localhost:3002/commercial/leads/unassigned

# 3 — Asignar LO
curl -s -X POST "http://localhost:3002/commercial/leads/{OPP_ID}/assign" \
  -H "Content-Type: application/json" \
  -d '{"leasingOfficerName":"Alejandro García","assignedBy":"Héctor Montelongo (CEM)"}'

# 5 — Stage gate (debe fallar si faltan campos)
curl -s -X POST http://localhost:3002/commercial/stage-gate \
  -H "Content-Type: application/json" \
  -d '{"targetStage":"CALIFICADO","opportunity":{"m2Requeridos":1200}}'
```

| Endpoint | Pass | Fail |
|----------|------|------|
| `GET /leads/unassigned` → `200` + array `leads` | [ ] | [ ] |
| `POST /leads/:id/assign` → `200` | [ ] | [ ] |
| `POST /stage-gate` sin campos → error claro | [ ] | [ ] |
| `POST /stage-gate` completo → `ok: true` | [ ] | [ ] |

### Fase 2

```bash
# 6 — Match naves
curl -s -X POST http://localhost:3002/commercial/match-naves \
  -H "Content-Type: application/json" \
  -d '{"m2Requeridos":1200,"ubicacionDeseada":"Monterrey"}'

# 7 — Tour
curl -s -X POST http://localhost:3002/commercial/tour \
  -H "Content-Type: application/json" \
  -d '{"opportunityId":"{OPP_ID}","tourFecha":"2026-07-15","tourFeedback":"Demo","tourProximosPasos":"Cotizar"}'

# 8 — Preview + envío cotización
curl -s -X POST http://localhost:3002/commercial/quotations/preview \
  -H "Content-Type: application/json" \
  -d '{"m2Ofertados":1200,"precioPorM2Usd":8.5}'

curl -s -X POST "http://localhost:3002/commercial/quotations/{OPP_ID}/send" \
  -H "Content-Type: application/json" \
  -d '{"m2Ofertados":1200,"precioPorM2Usd":8.5}'
```

| Endpoint | Pass | Fail |
|----------|------|------|
| `POST /match-naves` → matches con score | [ ] | [ ] |
| `POST /tour` → `200` | [ ] | [ ] |
| `POST /quotations/preview` → renta calculada | [ ] | [ ] |
| `POST /quotations/:id/send` → `200` | [ ] | [ ] |

### Fase 3

```bash
# 9 — Aprobación
curl -s -X POST http://localhost:3002/commercial/approvals/request \
  -H "Content-Type: application/json" \
  -d '{"opportunityId":"{OPP_ID}","motivo":"Descuento demo"}'

curl -s -X POST http://localhost:3002/commercial/approvals/resolve \
  -H "Content-Type: application/json" \
  -d '{"opportunityId":"{OPP_ID}","decision":"Aprobada","comentario":"Demo"}'

# 11 — Pérdida
curl -s -X POST http://localhost:3002/commercial/lost \
  -H "Content-Type: application/json" \
  -d '{"opportunityId":"{OPP_ID}","motivoPerdida":"Pospuesto","fechaReactivacion":"2026-09-01"}'
```

| Endpoint | Pass | Fail |
|----------|------|------|
| `POST /approvals/request` → `200` | [ ] | [ ] |
| `POST /approvals/resolve` → aprobada | [ ] | [ ] |
| `POST /lost` → opp perdida | [ ] | [ ] |

### Fase 4

```bash
# 13–14 — Hoja
curl -s -X POST http://localhost:3002/commercial/hoja-acuerdos \
  -H "Content-Type: application/json" \
  -d '{"opportunityId":"{OPP_ID}"}'

# Usar hojaId de la respuesta anterior
curl -s -X POST "http://localhost:3002/commercial/hoja-acuerdos/{HOJA_ID}/sign" \
  -H "Content-Type: application/json" \
  -d '{"firmaCem":true,"firmaCliente":true}'
```

| Endpoint | Pass | Fail |
|----------|------|------|
| `POST /hoja-acuerdos` → `hojaId` | [ ] | [ ] |
| `POST /hoja-acuerdos/:id/sign` → firmada | [ ] | [ ] |
| No se crea `casoLegal` (verificar en Twenty) | [ ] | [ ] |

---

## Resumen final

| Fase | Descripción | UI ✓ | API ✓ |
|------|-------------|------|-------|
| 1 | Captura + CEM | [ ] | [ ] |
| 2 | Match + tour + cotización | [ ] | [ ] |
| 3 | Aprobación + broker + pérdida | [ ] | [ ] |
| 4 | Hoja (STOP Legal) | [ ] | [ ] |
| Extras | 360, BTS, gates | [ ] | — |

**Validación 100%:** todas las casillas UI y API marcadas en verde para el happy path + pérdida en opp secundaria.

---

*Actualizado Jul 2026 — checklist acoplado a [FLUJO-COMERCIAL-DEMO.md](./FLUJO-COMERCIAL-DEMO.md)*
