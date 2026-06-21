# Pendientes — Edgard (Parks Industrial)

> **Última actualización:** 2026-06-20  
> **Estado del blueprint:** Pasos 1–13 ✅ · Roles + Dashboards ✅  
> **Referencia:** [PROGRESS.md](./PROGRESS.md) · [Blueprint](./parks-industrial-twenty-blueprint.md)

---

## Resumen ejecutivo

El **código del blueprint está completo**. Lo que falta es configuración manual en Twenty, validación con el cliente, confirmaciones de negocio y despliegue a remoto/producción.

---

## 1. Pendientes inmediatos (antes de demo con Parks)

### 1.1 Asignar roles a usuarios reales

Los 8 roles ya existen en Twenty (prefijo `Parks —`). Falta **asignarlos a personas** en la UI:

| Usuario sugerido | Rol |
| --- | --- |
| Catalina Moreno | `Parks — Admin Legal` |
| Director Legal | `Parks — Director Legal` |
| Subdirector Legal | `Parks — Subdirector Legal` |
| Charlie Meta (CEO) | `Parks — CEO` |
| Abogados del equipo | `Parks — Abogado asignado` |
| Ejecutivos comerciales | `Parks — Ejecutivo Comercial` |
| CxC / cobranza | `Parks — CxC` |
| Héctor / Director Comercial | `Parks — Director Comercial` |

**Dónde:** Twenty → **Settings** → **Roles** → seleccionar rol → asignar miembros del workspace.

**Re-crear roles si hiciera falta:**

```bash
cd parks-twenty-service
npm run setup:roles
```

(Idempotente — omite roles que ya existen.)

---

### 1.2 Ensayo de demo (guion 10 min)

Seguir la **Sección 13** del blueprint. Orden sugerido:

1. **Pipeline Legal** — Casos legales → vista Kanban por `estatus` / semáforo  
   Verificar los 6 casos `DEMO-*` (LogiMex 🟠, Manufactura 🔵, Retail 🟡, Holdover 🔴, Terminación 🟠, FUNO 🟢).

2. **Dashboard Legal** — `Parks Industrial — Dashboard Legal`  
   Pie de semáforos, KPI holdovers, carga por abogado, tablas SLA/docs/expedientes.

3. **Dashboard Ejecutivo** — `Parks Industrial — Dashboard Ejecutivo`  
   Funnel oportunidades, comisiones, m² rentados, indicador Oracle mock.

4. **PDF LogiMex** — Abrir caso `DEMO-CASO-LOGIMEX` → campo `pdfBorradorUrl` o archivo en  
   `parks-twenty-service/output/pdfs/`.

5. **Handoff comercial→legal** (opcional en vivo) — Oportunidad a etapa *Hoja de Acuerdos firmada* → webhook crea `CasoLegal`.

---

### 1.3 Webhooks en local (opcional)

Para que Twenty **dispare eventos** al microservicio (no solo el script E2E):

1. Microservicio corriendo:

   ```bash
   cd parks-twenty-service
   npm run dev
   # → http://localhost:3002
   ```

2. En Twenty (workspace settings / variables de entorno del servidor): desactivar  
   `OUTBOUND_HTTP_SAFE_MODE_ENABLED` para permitir delivery a `localhost`.

3. Webhook ya configurado apunta a:

   ```
   http://localhost:3002/webhooks/twenty
   ```

   Re-sincronizar si cambió la URL:

   ```bash
   npm run setup:webhooks
   ```

---

### 1.4 Housekeeping del fork

- [ ] Actualizar `README_BS.md` (traducciones y menú ya hechos)
- [ ] Revisar ítems restantes del menú lateral para CRM interno Parks
- [ ] **Git push** — hay commit local sin subir a remoto

---

## 2. Pendientes de negocio (Parks / Bridge — no es código)

| Tema | Responsable | Estado | Acción |
| --- | --- | --- | --- |
| Texto legal real en plantillas `.hbs` | Catalina Moreno | ⬜ | Fase 4 del proyecto real; hoy son borradores |
| `%` comisión ejecutivo | Dirección Parks | ⬜ | Confirmar `COMISION_EJECUTIVO_PCT` (hoy `0.03`) |
| SLA pausa por docs incompletos | Parks Industrial | ⬜ | Definir `SLA_PAUSA_POR_DOCS` en `.env` |
| Endpoints Oracle ERP | TI Parks + Javier | ⬜ | Documentar antes de `ORACLE_MOCK=false` |
| Cláusulas estándar en PDF | Catalina | ⬜ | Reemplazar placeholders en `src/templates/*.hbs` |

---

## 3. Post-demo / producción

| Tema | Notas |
| --- | --- |
| Oracle real | `ORACLE_MOCK=false` + endpoints reales (Javier / Bridge) |
| Deploy producción | Imagen GHCR — ver `deploy/README.md` |
| API Key producción | `TWENTY_API_KEY` en `parks-twenty-service/.env` |
| Webhooks producción | URL pública del microservicio (no `localhost`) |
| Puerto microservicio | Dev confirmado `:3002` — definir en prod |

---

## 4. Fuera de scope (no implementar)

- Firma digital (DocuSign, S-Sign)
- Portal para brokers externos
- Marketing / Account Engagement
- Oracle real en la demo (`ORACLE_MOCK=true`)

---

## 5. Mejoras técnicas opcionales (no bloquean demo)

- [ ] **RLS abogado asignado** — filtrar casos por `abogadoAsignado` (hoy solo permisos a nivel objeto)
- [ ] **Filtros en vistas de dashboard** — SLA > 70%, `documentacionCompleta = false`, expedientes < 90 días (vistas creadas como TABLE sin filtro fino)
- [ ] **Botón UI “Ver PDF”** en ficha de `CasoLegal` (hoy: campo `pdfBorradorUrl` o carpeta `output/pdfs/`)
- [ ] **Asignación de roles por script** — automatizar si Twenty expone API de workspace members

---

## 6. Cómo probar lo hecho en esta sesión

### 6.1 Prerrequisitos

```bash
# Infra (Postgres + Redis) — idempotente
bash packages/twenty-utils/setup-dev-env.sh --docker

# Stack Twenty (desde raíz del monorepo)
yarn start
# UI → http://localhost:3001
# API → http://localhost:3000

# Microservicio Parks (otra terminal)
cd parks-twenty-service
cp .env.example .env   # si no existe
npm run dev
# → http://localhost:3002/health
```

**Login UI:** Continue with Email → `tim@apple.dev` / `tim@apple.dev`

---

### 6.2 Paso 12 — Seed demo

```bash
cd parks-twenty-service
npm run seed:demo
# Re-ejecutar forzando:
FORCE_DEMO_SEED=true npm run seed:demo
```

**Verificar en UI:**

- **Parques** — 2 (`DEMO-PARQUE-*`)
- **Naves** — 8 (1 FUNO: `NVA-MTY-001`)
- **Casos legales** — 6 con prefijo `DEMO-CASO-*`
- **Oportunidades** — 5 `DEMO-Opp — *`
- **Holdover** — 1 activo
- **Expedientes** — varios (incl. 2 próximos a vencer ~75/88 días)

---

### 6.3 Paso 13 — E2E automatizado

```bash
cd parks-twenty-service
npm run e2e:test
# Re-ejecutar flujo completo:
FORCE_E2E_RERUN=true npm run e2e:test
```

**Esperado:** `11/11 pasos OK` — handoff, checklist, PDF, SLA, firmas, comisiones, Oracle mock, KPIs.

---

### 6.4 Pasos 6b y 7b — Roles y dashboards

```bash
cd parks-twenty-service
npm run setup:roles
npm run setup:dashboards
```

**Verificar roles:** Settings → Roles → buscar `Parks —` (8 roles).

**Verificar dashboards en UI:**

| Dashboard | URL directa (logueado) |
| --- | --- |
| Legal | http://localhost:3001/object/dashboard/780fbec2-f4b0-41dd-8c5e-9da6e0d4d730 |
| Ejecutivo | http://localhost:3001/object/dashboard/993ab2d5-ded0-4453-877a-2b1763bbdbdc |

O: menú lateral → **Dashboards** / **Tableros**.

---

### 6.5 Suite de tests del microservicio

```bash
cd parks-twenty-service
npm run build
npm run health
npm run services:test
npm run webhook:test
npm run crons:test
npm run pdf:test
npm run oracle:test
npm run e2e:test
```

---

### 6.6 PDF borrador (LogiMex)

```bash
cd parks-twenty-service
npm run pdf:test
# O contra caso real del seed:
npx tsx -e "
import { pdfService } from './src/services/pdf.service';
import { twentyClient } from './src/services/twenty.client';
(async () => {
  const res = await twentyClient.query(\`
    query { casosLegales(filter: { referencia: { eq: \"DEMO-CASO-LOGIMEX\" } }, first: 1) {
      edges { node { id } }
    }}
  \`);
  const id = res.casosLegales.edges[0]?.node?.id;
  console.log(await pdfService.generateForCasoLegal(id, 1));
})().catch(console.error);
"
```

Archivos generados en: `parks-twenty-service/output/pdfs/`

---

### 6.7 Pipelines Kanban (validación visual)

| Objeto | Campo agrupación | Dónde en UI |
| --- | --- | --- |
| `opportunity` | `stage` | Oportunidades |
| `casoLegal` | `estatus` | Casos legales |
| `opportunity` | `etapaRenovacion` | Oportunidades (renovaciones) |
| `holdover` | `etapaPipeline` | Holdovers |

---

### 6.8 Checklist rápido post-sesión

- [ ] `npm run seed:demo` sin errores
- [ ] `npm run e2e:test` → 11/11
- [ ] `npm run setup:roles` → 8 roles `Parks —`
- [ ] `npm run setup:dashboards` → 2 dashboards visibles en UI
- [ ] 6 casos DEMO visibles en Kanban Legal con semáforos correctos
- [ ] PDF LogiMex generado en `output/pdfs/`
- [ ] `http://localhost:3002/health` → `status: ok`
- [ ] Roles asignados a usuarios reales (manual)
- [ ] Ensayo de demo 10 min con guion Sección 13

---

## 7. Comandos de setup completo (entorno nuevo)

Ejecutar en orden si levantas un entorno desde cero:

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker
yarn start   # raíz monorepo

cd parks-twenty-service
npm install
npm run setup:objects
npm run setup:opportunity
npm run setup:pipelines
npm run setup:roles
npm run setup:dashboards
npm run setup:webhooks
npm run seed:demo
npm run dev
```

---

## 8. Archivos clave de esta sesión

| Qué | Dónde |
| --- | --- |
| Seed demo | `parks-twenty-service/src/seed/demo-seed.service.ts` |
| E2E | `parks-twenty-service/src/e2e/e2e-verification.service.ts` |
| Roles | `parks-twenty-service/src/metadata/parks-role-definitions.ts` |
| Dashboards | `parks-twenty-service/src/metadata/parks-dashboard-definitions.ts` |
| PDF fix (parque + SELECT) | `parks-twenty-service/src/services/pdf.service.ts` |
| Blocknote tasks/notes | `parks-twenty-service/src/utils/blocknote.util.ts` |
| Progreso global | `docs/parks-industrial/PROGRESS.md` |

---

*Actualizar este archivo cuando cierres pendientes o antes de la demo con Parks.*
