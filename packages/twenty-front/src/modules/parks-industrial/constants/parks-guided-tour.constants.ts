import { type ParksNavigationItemKey } from '@/parks-industrial/constants/parks-navigation.constants';
import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';

export const PARKS_GUIDED_TOUR_WELCOME_TARGET = 'welcome';
export const PARKS_GUIDED_TOUR_NAV_TARGET_PREFIX = 'nav-';

export const PARKS_GUIDED_TOUR_NAV_SECTION_ID = 'ParksIndustrial';

export type ParksGuidedTourItemCopy = {
  title: string;
  body: string;
};

export type ParksGuidedTourRoleIntro = {
  title: string;
  body: string;
};

export const PARKS_GUIDED_TOUR_ITEM_COPY: Record<
  ParksNavigationItemKey,
  ParksGuidedTourItemCopy
> = {
  dashboard: {
    title: 'Dashboard',
    body: 'Tu centro de mando. Aquí ves KPIs del día, alertas y el pulso del portafolio. Entra cuando quieras una foto ejecutiva antes de bajar al detalle.',
  },
  dashboardComercial: {
    title: 'Dashboard comercial',
    body: 'Ocupación, pipeline, ingreso y vencimientos. Sirve para priorizar al equipo: qué deals empujar y dónde hay riesgo de vacancia.',
  },
  stackingPlan: {
    title: 'Parques',
    body: 'Inventario por parque: naves disponibles y leads ligados a cada uno. Entra a un parque para ver el stacking plan (plano de ocupación).',
  },
  pipeline: {
    title: 'Pipeline',
    body: 'El trabajo diario del deal: lead → tour → cotización → hoja → Legal. Abre una tarjeta para ver el flujo, naves y siguientes pasos.',
  },
  leadsCem: {
    title: 'Leads Director Comercial',
    body: 'Bandeja de leads nuevos sin dueño. Desde aquí el Director Comercial los asigna a un Leasing Officer para que salgan a campo.',
  },
  prospectos: {
    title: 'Prospectos',
    body: 'Cuentas en seguimiento que aún no son un deal activo. Úsalo para no perder contactos calientes entre un lead y el pipeline.',
  },
  notificaciones: {
    title: 'Notificaciones',
    body: 'Alertas accionables: firmas, handoffs, comité, CxC. Si algo te espera, casi siempre aparece primero aquí.',
  },
  misPendientes: {
    title: 'Mis pendientes',
    body: 'Decisiones que requieren tu OK: aprobaciones, condonaciones o firmas. Si tu rol autoriza, este es el inbox de “yo tengo que decidir”.',
  },
  contratos: {
    title: 'Contratos',
    body: 'Expediente legal del deal: checklist, versiones, cotejo IA y firmas. Legal trabaja el caso; comercial y CxC lo consultan post-cierre.',
  },
  legalPipeline: {
    title: 'Pipeline legal',
    body: 'Kanban del área legal. Cada columna es un estatus (asignado, elaboración, negociación, cotejo). Aquí el abogado mueve el caso.',
  },
  legalDashboard: {
    title: 'Dashboard legal',
    body: 'Carga por abogado, semáforos SLA y reporte quincenal. Vista de dirección legal — no sustituye el trabajo en el pipeline.',
  },
  cxc: {
    title: 'CxC',
    body: 'Cuentas por cobrar: cartera, forecast y riesgo. Entra después de un contrato firmado para ver cómo se cobra ese inquilino.',
  },
  cxcCartera: {
    title: 'Cartera CxC',
    body: 'Del contrato firmado al seguimiento de pagos: expediente, calendario y tickets. Es el día a día de cobranza.',
  },
  comite: {
    title: 'Comité',
    body: 'Autorización de condiciones especiales (descuento, plazo, m² grandes). El trío vota; el CEO entra si hay empate. LO puede consultar.',
  },
  asignacion: {
    title: 'Asignación',
    body: 'Motor para repartir leads a LOs con scoring. Solo Dirección Comercial (y Admin Sistema) asignan desde aquí.',
  },
  loCampo: {
    title: 'Campo LO',
    body: 'Modo visita: agenda del día, naves del tour, guión y notas. Pensado para usarse en sitio, no en el escritorio.',
  },
  renovaciones: {
    title: 'Renovaciones',
    body: 'Alertas a 12 / 6 / 3 / 1 mes. Prioriza retención y vacancia antes de que el contrato se venza.',
  },
  reservas: {
    title: 'Reservas',
    body: 'Naves apartadas mientras se cierra el deal. Evita ofrecer dos veces el mismo espacio.',
  },
  comisiones: {
    title: 'Comisiones',
    body: 'Tasas, autorización y liquidación a brokers. Dirección Comercial revisa; no es un módulo de campo.',
  },
  brokers: {
    title: 'Brokers',
    body: 'Directorio de brokers y empresas (Top 10 y resto). Se usa al asignar un deal y al calcular comisión.',
  },
  miDesempeno: {
    title: 'Mi desempeño',
    body: 'Tu tablero personal: pipeline propio, conversión y comisiones. Solo aplica a Leasing Officers.',
  },
  mapa: {
    title: 'Mapa de inventario',
    body: 'Parques y naves en el mapa, con estatus comercial. Sirve para ubicar producto y armar una visita.',
  },
};

export const PARKS_GUIDED_TOUR_ROLE_INTRO: Partial<
  Record<string, ParksGuidedTourRoleIntro>
> = {
  [ParksRoleLabel.CEO]: {
    title: 'Tu vista de CEO',
    body: 'Este demo es el centro de mando: tablero, pendientes, parques, pipeline, comité y cobranza. No asignas LOs — eso es del Director Comercial. Recorremos cada módulo que ves a la izquierda.',
  },
  [ParksRoleLabel.DirectorComercial]: {
    title: 'Tu operación comercial',
    body: 'Desde aquí corres el equipo: asignar leads, pipeline, comité, parques, brokers y comisiones. El menú izquierdo es tu mapa de trabajo. Te mostramos cada herramienta.',
  },
  [ParksRoleLabel.EjecutivoComercial]: {
    title: 'Tu escritorio comercial',
    body: 'Pipeline, parques, campo y tu desempeño. Tomas el lead asignado y lo llevas hasta hoja de acuerdos. Legal y CxC los verás en lectura cuando el deal avance.',
  },
  [ParksRoleLabel.LoAaaSenior]: {
    title: 'Tu escritorio de Leasing Officer AAA',
    body: 'Pipeline, stacking, mapa, campo y desempeño. Los deals AAA viven aquí: tour, cotización y hoja. El Director Comercial te asigna; tú ejecutas.',
  },
  [ParksRoleLabel.LoEstandar]: {
    title: 'Tu escritorio de Leasing Officer',
    body: 'Pipeline, parques, mapa y modo campo. Calificas, visitas, cotizas y generas la hoja. Si un deal escala a comité, lo consultas — no votas.',
  },
  [ParksRoleLabel.AdminLegal]: {
    title: 'Tu mesa de Legal (admin)',
    body: 'Dashboard legal, pipeline, contratos y cotejo. Recibes el deal de comercial, asignas abogado y cierras el expediente. CxC no es tu módulo.',
  },
  [ParksRoleLabel.DirectorLegal]: {
    title: 'Tu vista de Director Legal',
    body: 'Indicadores del equipo, pipeline y contratos. Supervisas carga y SLA; no votas en comité comercial. El detalle del caso vive en Contratos.',
  },
  [ParksRoleLabel.SubdirectorLegal]: {
    title: 'Tu vista de Subdirector Legal',
    body: 'Pipeline, contratos y firmas internas. Entras cuando el caso necesita un OK de Legal antes de cotejo o firma final.',
  },
  [ParksRoleLabel.AbogadoAsignado]: {
    title: 'Tu mesa de abogado',
    body: 'Pipeline legal y contratos: elaboración, versiones y negociación con el cliente. Catalina (Admin Legal) te asigna el caso; tú lo mueves de columna.',
  },
  [ParksRoleLabel.MiembroComite]: {
    title: 'Tu asiento en Comité',
    body: 'Votas condiciones comerciales (Aprueba / Rechaza / Abstiene) junto con Dirección Comercial y el otro miembro. El CEO solo entra si hay empate.',
  },
  [ParksRoleLabel.GerenteCxc]: {
    title: 'Tu mesa de CxC',
    body: 'Cartera, forecast y el handoff cuando Legal cierra el contrato. Comercial lo ves en consulta; el día a día es cobranza.',
  },
  [ParksRoleLabel.CxC]: {
    title: 'Tu mesa de CxC',
    body: 'Cartera y seguimiento de pagos. Entras cuando el contrato ya está firmado. El pipeline comercial no es tu herramienta principal.',
  },
  [ParksRoleLabel.EjecutivoCxc]: {
    title: 'Tu cartera de ejecutivo CxC',
    body: 'Tickets, calendario y expediente de cobranza. Tomas lo que el gerente prioriza y das seguimiento al inquilino.',
  },
  [ParksRoleLabel.ContratosFacturacion]: {
    title: 'Contratos y facturación',
    body: 'Puente entre el contrato cerrado y la facturación / CxC. Consultas expedientes y notificaciones; no armas el deal comercial.',
  },
  [ParksRoleLabel.AdminSistema]: {
    title: 'Acceso de Admin Sistema',
    body: 'En este demo ves todas las herramientas Parks. El recorrido es largo a propósito: es el mapa completo de lo que cada área usa.',
  },
  [ParksRoleLabel.AdminParque]: {
    title: 'Tu vista de Admin Parque',
    body: 'Mapa, stacking y consulta de contratos del parque. No corres pipeline ni comité: tu foco es inventario y ocupación en sitio.',
  },
};

export const PARKS_GUIDED_TOUR_DEFAULT_INTRO: ParksGuidedTourRoleIntro = {
  title: 'Tu espacio Parks',
  body: 'Te recorremos las herramientas que tu rol puede usar en este demo. El menú izquierdo es el mapa: cada punto explica qué hace y cuándo entrar.',
};
