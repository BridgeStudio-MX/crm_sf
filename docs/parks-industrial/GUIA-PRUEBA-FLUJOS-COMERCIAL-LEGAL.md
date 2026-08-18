# Guía de prueba — Flujo comercial y legal

> **Versión:** 1.0 · Jul 2026  
> **Para quién:** QA, demo con cliente, Edgard / Bridge Studio  
> **Referencias:** [FLUJO-COMERCIAL-CHECKLIST.md](./FLUJO-COMERCIAL-CHECKLIST.md) · [Parks_Industrial_Legal_UserStories_Cursor.md](./Parks_Industrial_Legal_UserStories_Cursor.md)

Esta guía indica **qué usuario abrir**, **en qué pantalla** y **qué validar** para recorrer el flujo comercial completo y el flujo legal completo en local.

---

## 1. Prerrequisitos

### Servicios en marcha

| Servicio | URL | Comando típico |
|----------|-----|----------------|
| UI Twenty | http://localhost:3001 | `yarn start` (desde raíz del repo) |
| API Twenty | http://localhost:3000 | (incluido en `yarn start`) |
| Parks microservicio | http://localhost:3002 | `cd parks-twenty-service && npm run dev` |

Infra (Postgres + Redis) y migraciones — una sola vez o tras reset:

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker
```

### Health check rápido

```bash
curl -s http://localhost:3000/healthz
curl -s http://localhost:3002/health
curl -s http://localhost:3002/commercial/leads/unassigned | head -c 120
```

### Seed demo (datos LogiMex, casos legales, holdovers)

```bash
cd parks-twenty-service
npm run seed:demo          # crea oportunidades, hojas, 6 casos legales demo
npm run setup:demo-users   # crea usuarios Parks por rol (opcional pero recomendado)
```

### Login en la UI

1. Abre http://localhost:3001  
2. **Continue with Email**  
3. Correo del puesto (ej. `directorcomercial@prk.com.mx`) / contraseña **`parksindustrial2026!`**

> Lista completa: `docs/parks-industrial/USUARIOS_DEMO.md`. `tim@apple.dev` / `tim@apple.dev` es solo el admin técnico de Twenty en local.

### Handoff comercial → legal

Por defecto el microservicio crea `casoLegal` al firmar la Hoja de Acuerdos:

```bash
# parks-twenty-service/.env
PARKS_LEGAL_HANDOFF_ENABLED=true   # default actual
```

Si quieres probar **solo comercial** sin crear caso legal, pon `false` y reinicia el microservicio.

---

## 2. Usuarios demo — credenciales y roles

Login en http://localhost:3001 → **Continue with Email**

Crear usuarios y asignar roles Parks:

```bash
cd parks-twenty-service
npm run setup:demo-users
```

> Lista completa y misma contraseña para todos: `docs/parks-industrial/USUARIOS_DEMO.md`.

| Puesto | Rol Parks | Correo | Contraseña | Usar en el flujo |
|-------------------|-----------|--------|------------|------------------|
| **Director Comercial** | Parks — Director Comercial | `directorcomercial@prk.com.mx` | `parksindustrial2026!` | Cola CEM, asignar LO, aprobar condiciones, firmar Hoja (lado Parks) |
| **Leasing Officer AAA** | Parks — LO AAA Senior | `leasingofficeraaa@prk.com.mx` | `parksindustrial2026!` | Lead asignado, tour, cotización, negociación, generar Hoja |
| **Admin Legal** | Parks — Admin Legal | `adminlegal@prk.com.mx` | `parksindustrial2026!` | Dashboard legal, asignar abogado, checklist, cotejo, pipeline legal |
| **Director Legal** | Parks — Director Legal | `directorlegal@prk.com.mx` | `parksindustrial2026!` | Dashboard legal (vista ejecutiva), métricas equipo |
| **Subdirector Legal** | Parks — Subdirector Legal | `subdirectorlegal@prk.com.mx` | `parksindustrial2026!` | Flujo de firmas internas (paso 2 del flujo firmas) |
| **Abogado asignado** | Parks — Abogado asignado | `abogado@prk.com.mx` | `parksindustrial2026!` | Elaboración, versiones, negociación con cliente |
| **CEO** | Parks — CEO | `ceo@prk.com.mx` | `parksindustrial2026!` | Aprobación condonación holdover, firma final en flujo interno |
| **Gerente CxC** | Parks — Gerente CxC | `gerentecxc@prk.com.mx` | `parksindustrial2026!` | Solo lectura post-cierre; handoff CxC tras contrato firmado |

**Nota:** Todos los logins Parks usan `parksindustrial2026!`. `tim@apple.dev` / `tim@apple.dev` es solo el admin técnico de Twenty en local.

### Permisos por rol (activo)

Tras `npm run setup:demo-users`, cada usuario **solo ve el menú y rutas de su rol**:

| Rol | Ve principalmente | No ve |
|-----|-------------------|-------|
| **Ejecutivo Comercial (LO)** | Pipeline, Prospectos, Mi desempeño, Notificaciones | Leads CEM, Legal pipeline, Comisiones |
| **Director Comercial (CEM)** | Pipeline, Leads CEM, Comisiones, Dashboard | Legal pipeline (edición) |
| **Admin / Director Legal** | Contratos, Pipeline legal, Dashboard legal | Pipeline comercial, Leads CEM |
| **Abogado asignado** | Pipeline legal, Contratos **asignados a él** | Dashboard legal (reporte), Leads CEM |
| **CEO** | Dashboard, Dashboard legal (lectura), Renovaciones | Pipeline comercial, edición legal |
| **CxC** | Contratos (lectura), Renovaciones, Notificaciones | Pipeline comercial/legal |

> **Importante:** Cierra sesión y vuelve a entrar con cada usuario después de `setup:demo-users` para que Twenty cargue el rol. Si un usuario no tiene rol Parks asignado pero es admin del workspace (`canAccessFullAdminPanel`), verá todo (modo dev).

### Cómo probar con varios usuarios

**Opción A — Demo rápida (1 ventana):**  
Quédate en `tim@apple.dev` y recorre todo. Funciona para validar funcionalidad.

**Opción B — Demo realista (recomendada para cliente):**  
Abre **ventanas de incógnito** o perfiles de Chrome distintos:

| Ventana | Usuario | Qué hace |
|---------|---------|----------|
| 1 | `directorcomercial@prk.com.mx` | CEM: cola, asignación, aprobaciones, firma Hoja |
| 2 | `leasingofficeraaa@prk.com.mx` | LO: calificar, tour, cotización, Hoja |
| 3 | `adminlegal@prk.com.mx` | Legal admin: casos, cotejo, dashboard |
| 4 | `abogado@prk.com.mx` | Abogado: versiones y elaboración |
| 5 | `ceo@prk.com.mx` | CEO: condonación holdover (si aplica) |

---

## 3. Mapa de rutas Parks

| Módulo | Ruta | Quién la usa |
|--------|------|--------------|
| Dashboard ejecutivo | `/parks/dashboard` | CEM, CEO |
| Pipeline comercial | `/parks/pipeline` | LO, CEM |
| Leads CEM | `/parks/leads-cem` | **Héctor (CEM)** |
| Prospectos / demanda | `/parks/prospectos` | LO, CEM |
| Contratos (lista legal) | `/parks/contratos` | Catalina, abogado |
| **Aprobación / workflow legal** | `/parks/contratos/:casoLegalId/aprobacion` | Catalina, abogado |
| **Pipeline legal (kanban)** | `/parks/legal-pipeline` | Catalina, Director Legal |
| **Dashboard legal** | `/parks/legal-dashboard` | Catalina, Director Legal |
| Renovaciones + holdovers | `/parks/renovaciones` | Comercial + Legal |
| Cuenta 360 inquilino | `/parks/inquilinos/:inquilinoId` | LO, CEM |
| Comisiones | `/parks/comisiones` | CEM, broker |
| Notificaciones | `/parks/notificaciones` | Todos |

---

## 4. Flujo comercial — paso a paso

### Diagrama

```
CAPTURA → CEM asigna LO → CALIFICADO → MATCH/TOUR → COTIZACIÓN
    → APROBACIÓN CEM → HOJA DE ACUERDOS → FIRMA → (handoff Legal)
```

### Fase 1 — Captura y asignación (US-COM-001 / 002)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| 1.1 | LO (`leasingofficeraaa@prk.com.mx`) o CEM | `/parks/pipeline` → **Nuevo lead** | Crear lead: empresa, canal, m², ubicación, giro, plazo, presupuesto | Deal en columna **Lead recibido** |
| 1.2 | **CEM** (`directorcomercial@prk.com.mx`) | `/parks/leads-cem` o banner en Pipeline | Ver cola sin asignar | Lead visible con canal y meta |
| 1.3 | **CEM** | `/parks/leads-cem` | Asignar a LO (ej. Alejandro García / Tim) | Lead sale de cola sin reload |
| 1.4 | LO | `/parks/pipeline` | Abrir deal → paneles IA/scoring (opcional) | Score o enriquecimiento visible |
| 1.5 | LO | Kanban | Arrastrar a **Calificado** (con campos completos) | Pasa; si faltan campos, gate bloquea |

### Fase 2 — Propuesta (US-COM-003 / 004)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| 2.1 | LO | Deal → pestaña **Propuesta** | Actualizar matching naves | Lista con score y razones |
| 2.2 | LO | Panel **Decisores del cliente** | Agregar 2–5 decisores + marcar asistentes al tour | Persisten en deal |
| 2.3 | LO | Panel flujo comercial | Registrar tour (fecha, feedback) | Mensaje OK + tarea 48h |
| 2.4 | LO | Propuesta | Preview renta → **Enviar cotización** | Confirmación envío |
| 2.5 | LO | Composer (opcional) | Generar brochure / ficha | PDF o HTML generado |

### Fase 3 — Negociación y cierre comercial (US-COM-005 / 006)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| 3.1 | LO | Deal | **Solicitar aprobación** (condiciones especiales) | Solicitud registrada |
| 3.2 | **CEM** | Mismo deal | **Aprobar (CEM)** | Estatus aprobación concedida |
| 3.3 | LO | Deal con broker (opcional) | Clasificar broker Top 10 / No top 10 | Esquema comisión coherente |
| 3.4 | LO (otra opp) | Pipeline | Pérdida **Pospuesto** + fecha reactivación | Deal fuera del pipeline activo |

### Fase 4 — Hoja de Acuerdos → Legal (US-COM-007)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| 4.1 | LO | Deal → **Hoja de Acuerdos** | **Generar Hoja** | Borrador creado |
| 4.2 | **CEM** + LO | Mismo panel | **Firmar CEM + firmar cliente** | Hoja en estatus firmada |
| 4.3 | Sistema | — | Handoff (`PARKS_LEGAL_HANDOFF_ENABLED=true`) | Se crea **casoLegal** + notificación Legal |
| 4.4 | Catalina | `/parks/contratos` | Ver nuevo caso | Aparece referencia tipo `…LOGIMEX…` o la empresa del deal |

**Validar handoff:** tras firmar, en `/parks/contratos` debe existir un caso nuevo vinculado a la Hoja. Si no aparece, revisa `.env` del microservicio y logs de `parks-twenty-service`.

### Guión comercial express (~12 min)

| Min | Usuario | Acción |
|-----|---------|--------|
| 0–2 | LO | Nuevo lead “LogiMex Demo” |
| 2–4 | CEM | Asignar LO en `/parks/leads-cem` |
| 4–6 | LO | Calificar → match → tour + decisores |
| 6–8 | LO | Cotización → solicitar aprobación |
| 8–9 | CEM | Aprobar condiciones |
| 9–11 | LO + CEM | Generar Hoja → firmar ambas partes |
| 11–12 | Catalina | Confirmar caso legal en `/parks/contratos` |

---

## 5. Flujo legal — paso a paso

### Diagrama

```
HOJA FIRMADA → Caso legal + SLA → Asignar abogado → Checklist docs
    → Elaboración → Versiones → Cotejo → Firmas → Cerrado + expediente
```

### Casos demo pre-sembrados (tras `npm run seed:demo`)

Úsalos para probar sin repetir todo el comercial:

| Referencia | Empresa | Estatus | Para probar |
|------------|---------|---------|-------------|
| `DEMO-CASO-LOGIMEX` | LogiMex | En elaboración | Happy path abogado + versiones |
| `DEMO-CASO-MFG-GDL` | Manufactura | Primera versión enviada | Seguimiento versiones |
| `DEMO-CASO-RETAIL` | Retail | Documentación incompleta | Checklist + SLA pausado |
| `DEMO-CASO-HOLDOVER` | Holdover | En negociación | SLA vencido + holdover |
| `DEMO-CASO-TERMINACION` | Terminación | En negociación | Terminación anticipada |
| `DEMO-CASO-FUNO` | FUNO | Firmado — cerrado | Flujo FUNO completo (referencia) |

Abrir cualquier caso: `/parks/contratos` → clic en referencia → `/parks/contratos/{id}/aprobacion`

### Fase L1 — Entrada y asignación (US-LEG-001)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| L1.1 | **Catalina** | `/parks/legal-dashboard` | Ver KPIs + casos activos | Semáforos, SLA, pausados |
| L1.2 | Catalina | `/parks/legal-dashboard` | Revisar **carga por abogado** (métricas) | Tabla workload |
| L1.3 | Catalina | Caso → panel **Asignación abogado** | Elegir Abogado 1/2/3 → Asignar | Estatus → **Asignado**; notificación mock |
| L1.4 | Abogado | `/parks/legal-pipeline` | Ver caso en columna correcta | Kanban por estatus |

### Fase L2 — Documentación (US-LEG-002 / 004)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| L2.1 | Abogado | `/parks/contratos/{id}/aprobacion` | Revisar resumen (inquilino, nave, Hoja) | Datos comerciales visibles |
| L2.2 | Catalina | Panel **Checklist** | Generar checklist → marcar documentos entregados | `Documentación completa` cuando todos ✓ |
| L2.3 | Catalina | Panel **Validación documentos** (OCR/LLM) | Validar uploads simulados | Semáforo verde/amarillo/rojo |
| L2.4 | Catalina | Panel **SLA** | Ver días hábiles; si Retail demo, ver SLA pausado | Badge “SLA pausado” en docs incompletos |
| L2.5 | Catalina | (API) Pausa manual SLA | Motivo de pausa | Notificación a Comercial |

**Caso recomendado docs incompletos:** `DEMO-CASO-RETAIL`

### Fase L3 — Elaboración y versiones (US-LEG-003)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| L3.1 | Abogado | Panel **Editor contrato** | Generar borrador PDF | HTML/PDF en panel |
| L3.2 | Abogado | Panel **Versiones** | Registrar V1 → cliente | Estatus → Primera versión enviada |
| L3.3 | Abogado | Versiones | Registrar respuesta / V2 / versión final | Negociación o versión final aceptada |

**Caso recomendado:** `DEMO-CASO-MFG-GDL` o `DEMO-CASO-LOGIMEX`

### Fase L4 — Cotejo y firmas (US-LEG-005 / 006)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| L4.1 | **Catalina** | Panel **Cotejo y firmas** | Aprobar cotejo (versiones coinciden) | Inicia flujo firmas |
| L4.2 | Catalina | Mismo panel | O rechazar con **discrepancia** | Estatus → En espera firma del cliente |
| L4.3 | Catalina / Subdirector | Flujo firmas | **Registrar firma** por paso (fecha manual) | Avanza al siguiente firmante |
| L4.4 | Sistema | — | Última firma | Caso → **Firmado — cerrado**; tickets CxC/Comercial |

**Caso FUNO:** `DEMO-CASO-FUNO` muestra flujo cerrado con propiedad FUNO (pasos extra apoderados).

### Fase L5 — Dashboard, reportes, holdover (US-LEG-007–011)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| L5.1 | Director Legal | `/parks/legal-dashboard` | Filtrar por abogado / SLA vencido | Lista filtrada |
| L5.2 | Catalina | Dashboard | **Generar reporte quincenal** | CSV en pantalla |
| L5.3 | Comercial/Legal | `/parks/renovaciones` → tab Holdovers | Ver holdovers activos | Montos acumulados |
| L5.4 | Legal | Renovaciones / API | Solicitar **condonación** holdover | Estatus pendiente CEO |
| L5.5 | **CEO** (`ceo@prk.com.mx`) | Notificaciones / API resolve | Aprobar o rechazar condonación | CxC notificado |

### Fase L6 — Acta de restitución (US-LEG-012)

| Paso | Usuario | Pantalla | Acción | Resultado esperado |
|------|---------|----------|--------|-------------------|
| L6.1 | Catalina | Caso terminación → panel **Acta restitución** | Crear acta (salida, estado nave, depósito) | Montos calculados |
| L6.2 | CEM | Aprobar comercial (API) | — | Notificación CxC |
| L6.3 | Catalina | Finalizar acta | — | Nave → Disponible |

**Caso recomendado:** `DEMO-CASO-TERMINACION`

### Guión legal express (~15 min, usando seed)

| Min | Usuario | Acción |
|-----|---------|--------|
| 0–3 | Catalina | `/parks/legal-dashboard` + `/parks/legal-pipeline` overview |
| 3–5 | Catalina | Abrir `DEMO-CASO-RETAIL` → checklist incompleto → completar → SLA reanuda |
| 5–8 | Abogado | Abrir `DEMO-CASO-LOGIMEX` → generar borrador → registrar versión |
| 8–11 | Catalina | `DEMO-CASO-MFG-GDL` → aprobar cotejo → registrar firmas paso a paso |
| 11–13 | Director Legal | Métricas abogado + reporte quincenal |
| 13–15 | CEO + Legal | Holdover en `/parks/renovaciones` → condonación (opcional) |

---

## 6. Flujo end-to-end comercial + legal (~25 min)

Ideal para demo integrada con **3 ventanas de incógnito**:

| Orden | Usuario | Hito |
|-------|---------|------|
| 1 | `leasingofficeraaa@prk.com.mx` | Crear lead → calificar → tour → cotización |
| 2 | `directorcomercial@prk.com.mx` | Asignar LO → aprobar → firmar Hoja (CEM) |
| 3 | `leasingofficeraaa@prk.com.mx` | Firmar Hoja (cliente) |
| 4 | `adminlegal@prk.com.mx` | Ver caso nuevo en `/parks/contratos` → asignar abogado |
| 5 | `abogado@prk.com.mx` | Checklist OK → versión V1 → versión final |
| 6 | `adminlegal@prk.com.mx` | Cotejo OK → firmas → caso cerrado |
| 7 | `gerentecxc@prk.com.mx` | Ver notificaciones/tickets CxC (post-cierre) |

---

## 7. APIs útiles (sin UI)

Base: `http://localhost:3002`

### Comercial

```bash
# Cola CEM
curl -s http://localhost:3002/commercial/leads/unassigned

# Asignar LO
curl -s -X POST "http://localhost:3002/commercial/leads/{OPP_ID}/assign" \
  -H "Content-Type: application/json" \
  -d '{"leasingOfficerName":"Alejandro García","assignedBy":"Héctor Montelongo (CEM)"}'
```

### Legal

```bash
# Dashboard legal
curl -s "http://localhost:3002/legal/dashboard"

# Workload abogados
curl -s http://localhost:3002/legal/workload

# Workflow de un caso
curl -s http://localhost:3002/legal/workflow/{CASO_LEGAL_ID}

# Reporte quincenal
curl -s http://localhost:3002/legal/report/quincenal
```

Ver más endpoints en [FLUJO-COMERCIAL-CHECKLIST.md](./FLUJO-COMERCIAL-CHECKLIST.md) (sección API).

---

## 8. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| “Incapaz de alcanzar el Back-end” | API Twenty aún no levantó | Esperar ~30s tras `yarn start`; hard refresh en `:3001` |
| Parks panels en error | Microservicio `:3002` caído | `cd parks-twenty-service && npm run dev` |
| No hay casos legales | Seed no corrido | `npm run seed:demo` |
| Handoff no crea caso | `PARKS_LEGAL_HANDOFF_ENABLED=false` | Poner `true` en `.env` y reiniciar |
| Usuario Parks sin permisos | Roles no asignados | `npm run setup:demo-users` o usar `tim@apple.dev` |
| Kanban legal vacío | Sin metadata / sin casos | `npm run setup:objects` + seed demo |

---

## 9. Documentos relacionados

| Documento | Contenido |
|-----------|-----------|
| [FLUJO-COMERCIAL-CHECKLIST.md](./FLUJO-COMERCIAL-CHECKLIST.md) | Checklist detallado con casillas ✓ |
| [FLUJO-COMERCIAL-DEMO.md](./FLUJO-COMERCIAL-DEMO.md) | Visión del flujo comercial y guión 12 min |
| [Parks_Industrial_Comercial_UserStories_Cursor.md](./Parks_Industrial_Comercial_UserStories_Cursor.md) | US-COM completas |
| [Parks_Industrial_Legal_UserStories_Cursor.md](./Parks_Industrial_Legal_UserStories_Cursor.md) | US-LEG-001…012 |
| [PENDIENTES.md](./PENDIENTES.md) | Estado de implementación |

---

*Actualizado Jul 2026 — Parks Industrial / Twenty CRM*
