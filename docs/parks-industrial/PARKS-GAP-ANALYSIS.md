# Parks Industrial — Gap Analysis (seguimiento)

> **Última actualización:** Jul 2026  
> **Referencia:** `Parks_Industrial_Comercial_UserStories_Cursor.md` · `Parks_Industrial_Salesforce_ProyectoCompleto.md`

Documento de trazabilidad entre requerimientos de negocio y la implementación en Twenty (`/parks/*`).

---

## Cola CEM — ubicación y cobertura (US-COM-002)

| Requerimiento | Estado | Implementación |
| --- | --- | --- |
| CEM ve leads sin asignar en **dashboard** | ✅ | Sección **Cola CEM** en `/parks/dashboard` (`ParksCemQueueSection`) |
| Gestión completa de la cola | ✅ | Página `/parks/leads-cem` (`ParksLeadsCemPage`, variant `full`) |
| Asignación directa desde lista | ✅ | Selector LO + **Asignar** · `POST /commercial/leads/:id/assign` |
| Auditoría quién asignó y cuándo | ✅ | Campo `asignadoPor` + registro en servicio |
| Tarea de contacto 24h al asignar | ✅ | Backend `commercial-lead.service` |
| Pipeline enfocado en etapas (kanban) | ✅ | Panel completo **removido** del pipeline |
| Aviso en pipeline si hay pendientes | ✅ | `ParksUnassignedLeadsBanner` (solo si `count > 0`) |
| Menú **Leads CEM** | ✅ | `ParksNavigationSection` → `/parks/leads-cem` |
| Badge de conteo en nav **Leads CEM (N)** | ✅ | `secondaryLabel` con `useParksUnassignedLeads` |

### Flujo UX acordado

```
Nuevo lead → Cola CEM (Dashboard / Leads CEM) → Asignar LO → Pipeline kanban
```

**Pipeline** ya no es bandeja de triage; es seguimiento comercial por etapa.

---

## Dashboard Director Comercial (CEM) — cobertura completa

| Ítem gap analysis | Estado | Implementación |
| --- | --- | --- |
| Leads sin asignar | ✅ | `ParksCemQueueSection` |
| Pipeline del equipo por etapa y LO | ✅ | Tabla en `ParksCemDirectorDashboard` · `buildParksCemTeamPipelineRows` |
| Oportunidades en riesgo (+15 días) | ✅ | Widget en `ParksCemDirectorDashboard` · `buildParksCemAtRiskDeals` |
| Renovaciones críticas del equipo | ✅ | Widget en `ParksCemDirectorDashboard` · `buildParksCemCriticalRenovaciones` |
| Aprobaciones pendientes | ✅ | Widget en `ParksCemDirectorDashboard` · `buildParksCemPendingApprovals` |
| Conversión por canal de origen | ✅ | Gráfica barras · `buildParksCemCanalMetrics` |
| Comparativa desempeño por LO | ✅ | Gráfica barras · `buildParksCemLoPerformanceMetrics` |

---

## Archivos tocados (Jul 2026)

| Archivo | Rol |
| --- | --- |
| `components/pipeline/ParksUnassignedLeadsBanner.tsx` | Banner compacto en pipeline |
| `components/pipeline/ParksUnassignedLeadsPanel.tsx` | Cola (`compact` / `full`) |
| `components/dashboard/ParksCemQueueSection.tsx` | Sección CEM en dashboard |
| `components/dashboard/ParksCemDirectorDashboard.tsx` | Vista Director Comercial (widgets CEM) |
| `hooks/useParksCemDashboardMetrics.ts` | Métricas agregadas CEM |
| `utils/parksCemDashboardUtil.ts` | Builders de métricas CEM |
| `hooks/useParksUnassignedLeads.ts` | Carga compartida de cola |
| `components/pipeline/ParksPipelineBoard.tsx` | Usa banner en lugar del panel |
| `components/dashboard/ParksDashboardContent.tsx` | Integra sección CEM + vista director |
| `components/navigation/ParksNavigationSection.tsx` | Badge conteo Leads CEM |
| `pages/parks-industrial/ParksLeadsCemPage.tsx` | Cola completa |

---

## Estado general

**Parks Gap Analysis: 100% cubierto** para el alcance del dashboard Director Comercial (CEM) y cola de leads documentado en este seguimiento.
