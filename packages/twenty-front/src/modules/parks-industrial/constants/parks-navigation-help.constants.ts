import { type ParksNavigationItemKey } from '@/parks-industrial/constants/parks-navigation.constants';

// Short copy for the nav (i) tips — what each Parks module does in the demo.
export const PARKS_NAVIGATION_ITEM_HELP: Record<
  ParksNavigationItemKey,
  string
> = {
  dashboard:
    'Centro de mando: para el CEO, pulso por áreas; para el CFO, forecast y cobranza. Entra cuando quieras una foto antes de bajar al detalle.',
  dashboardComercial:
    'Tablero comercial con ocupación, pipeline, ingresos y riesgos de vencimiento para priorizar al equipo.',
  dashboardMarketing:
    'Tablero de marketing: campañas, leads por canal, fit score IA, CPL y conversión a tours.',
  campanas:
    'Campañas de demanda industrial: presupuesto, gasto, leads, calificación y tours por canal.',
  secuencias:
    'Correos de nutrición por canal. Hoy solo lectura; la edición llega en una siguiente versión.',
  stackingPlan:
    'Inventario por niveles: parque → pipeline o naves → pipeline de cada nave. Incluye naves en construcción para pre-renta antes de la entrega.',
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
    'Sesión o consulta de autorización comercial. Los deals entran por monto, descuento o tipo de cliente.',
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
