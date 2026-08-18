import { type ParksNavigationItemKey } from '@/parks-industrial/constants/parks-navigation.constants';

// Short copy for the nav (i) tips — what each Parks module does in the demo.
export const PARKS_NAVIGATION_ITEM_HELP: Record<
  ParksNavigationItemKey,
  string
> = {
  dashboard:
    'Centro de mando del CEO y dirección: KPIs del día, vista de consejo, alertas y acceso rápido a pendientes.',
  dashboardComercial:
    'Tablero comercial con ocupación, pipeline, ingresos y riesgos de vencimiento para priorizar al equipo.',
  stackingPlan:
    'Todos los parques: naves disponibles y leads del pipeline en cada uno. Entra a un parque para ver el plano de ocupación.',
  pipeline:
    'Embudo de deals comerciales (lead → cotización → hoja → legal). Aquí vive el trabajo diario del LO y el Director Comercial.',
  leadsCem:
    'Bandeja de leads nuevos sin asignar para que el Director Comercial los asigne a un LO.',
  prospectos:
    'Lista de prospectos / cuentas potenciales en seguimiento comercial.',
  notificaciones:
    'Centro de alertas y tareas: firmas, handoffs, comités y avisos operativos con acceso directo a la acción.',
  misPendientes:
    'Bandeja de decisiones que requieren tu OK: aprobaciones, condonaciones, firmas o firmas Director Comercial según tu rol.',
  contratos:
    'Expedientes legales activos: elaboración, checklist, versiones, cotejo IA y flujo de firmas.',
  legalPipeline:
    'Kanban del pipeline legal: estatus de cada caso desde recepción comercial hasta cierre.',
  legalDashboard:
    'Indicadores legales: carga por abogado, semáforos SLA y reporte quincenal.',
  cxc: 'Dashboard de Cuentas por Cobrar: cartera, forecast, anomalías y riesgo de cobranza.',
  cxcCartera:
    'Pipeline Legal → Cobranza: del contrato firmado al seguimiento de pagos, expediente y calendario.',
  comite:
    'Comité de Autorización: tres votos (Aprueba / Rechaza / Abstiene) sobre condiciones comerciales antes de Legal. Incluye flags IA y bitácora.',
  asignacion:
    'Asignación inteligente de leads a LOs con scoring IA / reglas y regeneración de escenarios demo.',
  loCampo:
    'Modo campo del Leasing Officer: agenda del día, tours en vivo y notas de visita.',
  renovaciones:
    'Alertas de renovación a 12 / 6 / 3 / 1 mes para priorizar vacancia y retención.',
  reservas:
    'Reservas de naves / espacios en proceso previo a la firma del contrato.',
  comisiones:
    'Motor de comisiones a brokers: matriz de tasas, autorización y liquidación.',
  brokers:
    'Directorio de brokers y empresas broker (Top 10 vs no Top 10) vinculados a deals y comisiones.',
  miDesempeno:
    'Tablero personal del LO: pipeline propio, conversión y comisiones pendientes.',
  mapa: 'Mapa de inventario: ubicación de parques y naves con estado comercial.',
};
