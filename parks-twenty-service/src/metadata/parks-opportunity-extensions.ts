import {
  buildSelectOptions,
  type FieldDefinition,
  type RelationDefinition,
} from './parks-object-definitions';

export const OPPORTUNITY_OBJECT_NAME = 'opportunity';

export const OPPORTUNITY_FIELD_DEFINITIONS: FieldDefinition[] = [
  // Folio/ticket único que viaja comercial → legal → ops → comisiones
  {
    name: 'folio',
    label: 'Folio',
    type: 'TEXT',
  },
  {
    name: 'tipoOperacion',
    label: 'Tipo operación',
    type: 'SELECT',
    options: buildSelectOptions([
      'Arrendamiento nuevo',
      'Renovación',
      'Build-to-suit',
      'Terminación anticipada',
    ]),
  },
  { name: 'm2Requeridos', label: 'm² requeridos', type: 'NUMBER' },
  {
    name: 'condicionesEspeciales',
    label: 'Condiciones especiales',
    type: 'BOOLEAN',
  },
  {
    name: 'aprobacionRequerida',
    label: 'Aprobación requerida',
    type: 'BOOLEAN',
  },
  {
    name: 'canalOrigen',
    label: 'Canal origen',
    type: 'SELECT',
    options: buildSelectOptions([
      'Recomendación',
      'Call Center',
      'CEM',
      'LinkedIn',
      'Página web',
      'Broker',
      'Evento',
      'Otro',
      // Legacy values kept for existing records
      'Directo',
      'Digital',
      'Referido',
    ]),
  },
  {
    name: 'ubicacionDeseada',
    label: 'Ubicación deseada',
    type: 'SELECT',
    options: buildSelectOptions([
      'Guadalajara',
      'Monterrey',
      'CDMX',
      'Bajío',
      'Norte',
      'Sur',
      'Otro',
    ]),
  },
  {
    name: 'giroEmpresa',
    label: 'Giro empresa',
    type: 'SELECT',
    options: buildSelectOptions([
      'Manufactura',
      'Logística',
      'Distribución',
      'E-commerce',
      'Farmacéutica',
      'Automotriz',
      'Otro',
    ]),
  },
  // Asignación inteligente — país de origen del prospecto
  {
    name: 'paisOrigen',
    label: 'País de origen',
    type: 'TEXT',
  },
  {
    name: 'recomendadoPor',
    label: 'Recomendado por',
    type: 'TEXT',
  },
  { name: 'plazoContratoMeses', label: 'Plazo contrato (meses)', type: 'NUMBER' },
  {
    name: 'presupuestoMensualUsd',
    label: 'Presupuesto mensual USD',
    type: 'NUMBER',
  },
  // Primer contacto — el LO agenda/registra la primera llamada, videollamada
  // o reunión antes de poder avanzar a agendar la visita a nave.
  {
    name: 'primerContactoTipo',
    label: 'Primer contacto — tipo',
    type: 'SELECT',
    options: buildSelectOptions([
      'Llamada',
      'Videollamada',
      'Reunión presencial',
    ]),
  },
  { name: 'primerContactoFecha', label: 'Primer contacto — fecha', type: 'DATE' },
  { name: 'primerContactoHora', label: 'Primer contacto — hora', type: 'TEXT' },
  {
    name: 'primerContactoRealizado',
    label: 'Primer contacto — realizado',
    type: 'BOOLEAN',
  },
  { name: 'primerContactoNotas', label: 'Primer contacto — notas', type: 'TEXT' },
  { name: 'tourFecha', label: 'Tour — fecha', type: 'DATE' },
  { name: 'tourHora', label: 'Tour — hora', type: 'TEXT' },
  { name: 'tourParque', label: 'Tour — parque', type: 'TEXT' },
  { name: 'tourNavesMostradas', label: 'Tour — naves mostradas', type: 'TEXT' },
  { name: 'tourAsistentes', label: 'Tour — asistentes', type: 'TEXT' },
  { name: 'tourFeedback', label: 'Tour — feedback', type: 'TEXT' },
  { name: 'tourProximosPasos', label: 'Tour — próximos pasos', type: 'TEXT' },
  {
    name: 'fichaEnviadaPorCorreo',
    label: 'Ficha enviada por correo',
    type: 'BOOLEAN',
  },
  { name: 'precioPorM2Usd', label: 'Precio por m² USD', type: 'NUMBER' },
  { name: 'm2Ofertados', label: 'm² ofertados', type: 'NUMBER' },
  {
    name: 'rentaMensualCalculada',
    label: 'Renta mensual calculada',
    type: 'NUMBER',
  },
  { name: 'periodoGraciaMeses', label: 'Periodo gracia (meses)', type: 'NUMBER' },
  { name: 'depositoGarantiaMeses', label: 'Depósito garantía (meses)', type: 'NUMBER' },
  {
    name: 'rentasAdelantadasMeses',
    label: 'Rentas adelantadas (meses)',
    type: 'NUMBER',
  },
  {
    name: 'escalacionAnual',
    label: 'Escalación anual',
    type: 'SELECT',
    options: buildSelectOptions(['INPC', 'Porcentaje fijo']),
  },
  {
    name: 'porcentajeEscalacion',
    label: 'Porcentaje escalación',
    type: 'NUMBER',
  },
  { name: 'cotizacionEnviadaEn', label: 'Cotización enviada en', type: 'DATE' },
  {
    name: 'monedaCotizacion',
    label: 'Moneda cotización',
    type: 'SELECT',
    options: buildSelectOptions(['MXN', 'USD']),
  },
  {
    name: 'costosAledanosJson',
    label: 'Costos aledaños (JSON)',
    type: 'TEXT',
  },
  {
    name: 'cotizacionHistorialJson',
    label: 'Historial cotizaciones (JSON)',
    type: 'TEXT',
  },
  {
    name: 'motivoPerdida',
    label: 'Motivo pérdida',
    type: 'SELECT',
    options: buildSelectOptions([
      'Competencia',
      'Pospuesto',
      'Sin disponibilidad',
      'No calificado',
      'Otro',
    ]),
  },
  {
    name: 'competidor',
    label: 'Competidor',
    type: 'SELECT',
    options: buildSelectOptions([
      'Prologis',
      'Vesta',
      'Finsa',
      'Vynmsa',
      'American Industries',
      'Otro',
    ]),
  },
  { name: 'fechaReactivacion', label: 'Fecha reactivación', type: 'DATE' },
  { name: 'razonPerdidaDetalle', label: 'Razón pérdida detalle', type: 'TEXT' },
  { name: 'motivoSinNave', label: 'Motivo sin nave', type: 'TEXT' },
  { name: 'alturaRequerida', label: 'Altura requerida (m)', type: 'NUMBER' },
  { name: 'andenesRequeridos', label: 'Andenes requeridos', type: 'NUMBER' },
  {
    name: 'potenciaRequerida',
    label: 'Potencia requerida (kVA)',
    type: 'NUMBER',
  },
  {
    name: 'cargaPisoRequerida',
    label: 'Carga piso requerida',
    type: 'NUMBER',
  },
  {
    name: 'especificacionesTecnicas',
    label: 'Especificaciones técnicas',
    type: 'TEXT',
  },
  {
    name: 'fechaEstimadaEntregaObra',
    label: 'Fecha estimada entrega obra',
    type: 'DATE',
  },
  {
    name: 'nivelAprobacion',
    label: 'Nivel aprobación',
    type: 'SELECT',
    options: buildSelectOptions(['CEM', 'CEO']),
  },
  {
    name: 'estatusAprobacion',
    label: 'Estatus aprobación',
    type: 'SELECT',
    options: buildSelectOptions(['Pendiente', 'Aprobada', 'Rechazada']),
  },
  {
    name: 'comentarioAprobacion',
    label: 'Comentario aprobación',
    type: 'TEXT',
  },
  { name: 'asignadoPor', label: 'Asignado por', type: 'TEXT' },
  { name: 'asignadoEn', label: 'Asignado en', type: 'DATE' },
  {
    name: 'leasingOfficerAsignado',
    label: 'Leasing Officer asignado',
    type: 'TEXT',
  },
  {
    name: 'esquemaComision',
    label: 'Esquema comisión',
    type: 'SELECT',
    options: buildSelectOptions([
      'Recursos propios',
      'Broker top 10',
      'Broker no top 10',
    ]),
  },
  // Valor agregado F4 / F6 / F7 — only additive analytics fields
  { name: 'fechaCierreReal', label: 'Fecha cierre real', type: 'DATE' },
  {
    name: 'costoBrokerComision',
    label: 'Costo broker comisión',
    type: 'NUMBER',
  },
  {
    name: 'matchNavesSugeridas',
    label: 'Match naves sugeridas',
    type: 'TEXT',
  },
  {
    name: 'fechaPrimeraActividad',
    label: 'Fecha primera actividad',
    type: 'DATE',
  },
  {
    name: 'tiempoPrimeraRespuestaHoras',
    label: 'Tiempo primera respuesta (horas)',
    type: 'NUMBER',
  },
];

export const OPPORTUNITY_RELATION_DEFINITIONS: RelationDefinition[] = [
  {
    objectNameSingular: OPPORTUNITY_OBJECT_NAME,
    name: 'naveVinculada',
    label: 'Nave vinculada',
    targetObjectNameSingular: 'nave',
    targetFieldLabel: 'Oportunidades',
    targetFieldIcon: 'IconTargetArrow',
  },
  {
    objectNameSingular: OPPORTUNITY_OBJECT_NAME,
    name: 'brokerVinculado',
    label: 'Broker vinculado',
    targetObjectNameSingular: 'broker',
    targetFieldLabel: 'Oportunidades',
    targetFieldIcon: 'IconTargetArrow',
    isNullable: true,
  },
  {
    objectNameSingular: OPPORTUNITY_OBJECT_NAME,
    name: 'inquilinoVinculado',
    label: 'Inquilino vinculado',
    targetObjectNameSingular: 'inquilino',
    targetFieldLabel: 'Oportunidades',
    targetFieldIcon: 'IconTargetArrow',
  },
];
