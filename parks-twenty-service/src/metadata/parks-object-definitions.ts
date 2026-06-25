export type SelectOptionDefinition = {
  label: string;
  value: string;
  color: string;
};

export type FieldDefinition = {
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT';
  isNullable?: boolean;
  options?: SelectOptionDefinition[];
};

export type RelationDefinition = {
  objectNameSingular: string;
  name: string;
  label: string;
  targetObjectNameSingular: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
  isNullable?: boolean;
};

export type ParksObjectDefinition = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  skipNameField?: boolean;
  labelIdentifierFieldName?: string;
  fields: FieldDefinition[];
};

export const buildSelectOptions = (
  labels: string[],
  colors: string[] = [
    'blue',
    'orange',
    'yellow',
    'green',
    'red',
    'purple',
    'gray',
  ],
): SelectOptionDefinition[] =>
  labels.map((label, index) => ({
    label,
    value: label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, ''),
    color: colors[index % colors.length] ?? 'blue',
  }));

export const PARKS_OBJECT_DEFINITIONS: ParksObjectDefinition[] = [
  {
    nameSingular: 'parque',
    namePlural: 'parques',
    labelSingular: 'Parque',
    labelPlural: 'Parques',
    icon: 'IconBuildingSkyscraper',
    skipNameField: true,
    labelIdentifierFieldName: 'nombre',
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'TEXT', isNullable: false },
      { name: 'ubicacion', label: 'Ubicación', type: 'TEXT', isNullable: false },
      { name: 'm2Totales', label: 'm² totales', type: 'NUMBER' },
      { name: 'm2Rentados', label: 'm² rentados', type: 'NUMBER' },
      { name: 'administrador', label: 'Administrador', type: 'TEXT' },
      {
        name: 'fotoEntradaUrl',
        label: 'Foto de entrada',
        type: 'TEXT',
      },
      {
        name: 'estatus',
        label: 'Estatus',
        type: 'SELECT',
        options: buildSelectOptions(['Activo', 'Inactivo']),
      },
    ],
  },
  {
    nameSingular: 'nave',
    namePlural: 'naves',
    labelSingular: 'Nave',
    labelPlural: 'Naves',
    icon: 'IconBuildingWarehouse',
    skipNameField: true,
    labelIdentifierFieldName: 'identificador',
    fields: [
      {
        name: 'identificador',
        label: 'Identificador',
        type: 'TEXT',
        isNullable: false,
      },
      { name: 'm2', label: 'm²', type: 'NUMBER', isNullable: false },
      { name: 'alturaLibreM', label: 'Altura libre (m)', type: 'NUMBER' },
      { name: 'andenes', label: 'Andenes', type: 'NUMBER' },
      { name: 'cargaPisoTon', label: 'Carga piso (ton)', type: 'NUMBER' },
      { name: 'potenciaKva', label: 'Potencia (kVA)', type: 'NUMBER' },
      { name: 'oficinasM2', label: 'Oficinas (m²)', type: 'NUMBER' },
      {
        name: 'estatus',
        label: 'Estatus',
        type: 'SELECT',
        options: buildSelectOptions([
          'Disponible',
          'En negociación',
          'Rentada',
          'En construcción',
        ]),
      },
      {
        name: 'esPropiedadFuno',
        label: 'Es propiedad FUNO',
        type: 'BOOLEAN',
      },
      { name: 'precioBaseUsd', label: 'Precio base USD/m²/mes', type: 'NUMBER' },
      { name: 'oracleNaveId', label: 'Oracle nave ID', type: 'TEXT' },
      {
        name: 'fotoInmuebleUrl',
        label: 'Foto del inmueble',
        type: 'TEXT',
      },
    ],
  },
  {
    nameSingular: 'inquilino',
    namePlural: 'inquilinos',
    labelSingular: 'Inquilino',
    labelPlural: 'Inquilinos',
    icon: 'IconBuilding',
    skipNameField: true,
    labelIdentifierFieldName: 'empresa',
    fields: [
      { name: 'empresa', label: 'Empresa', type: 'TEXT', isNullable: false },
      { name: 'rfc', label: 'RFC', type: 'TEXT' },
      {
        name: 'sector',
        label: 'Sector',
        type: 'SELECT',
        options: buildSelectOptions([
          'Manufactura',
          'Logística',
          'Distribución',
          'E-commerce',
          'Farmacéutica',
          'Automotriz',
          'Tecnología',
          'Otro',
        ]),
      },
      { name: 'contactoPrincipal', label: 'Contacto principal', type: 'TEXT' },
      { name: 'emailContacto', label: 'Email contacto', type: 'TEXT' },
      { name: 'telefono', label: 'Teléfono', type: 'TEXT' },
      {
        name: 'estatus',
        label: 'Estatus',
        type: 'SELECT',
        options: buildSelectOptions([
          'Prospecto',
          'Activo',
          'En renovación',
          'En holdover',
          'Inactivo',
        ]),
      },
      { name: 'repLegalNombre', label: 'Rep. legal nombre', type: 'TEXT' },
      { name: 'repLegalEmail', label: 'Rep. legal email', type: 'TEXT' },
      { name: 'oracleClienteId', label: 'Oracle cliente ID', type: 'TEXT' },
      { name: 'ultimoPagoFecha', label: 'Último pago fecha', type: 'DATE' },
      {
        name: 'pagosAlCorriente',
        label: 'Pagos al corriente',
        type: 'BOOLEAN',
      },
    ],
  },
  {
    nameSingular: 'broker',
    namePlural: 'brokers',
    labelSingular: 'Broker',
    labelPlural: 'Brokers',
    icon: 'IconUsers',
    skipNameField: true,
    labelIdentifierFieldName: 'empresa',
    fields: [
      { name: 'empresa', label: 'Empresa', type: 'TEXT', isNullable: false },
      { name: 'contacto', label: 'Contacto', type: 'TEXT' },
      { name: 'email', label: 'Email', type: 'TEXT' },
      { name: 'telefono', label: 'Teléfono', type: 'TEXT' },
      {
        name: 'firma',
        label: 'Firma',
        type: 'SELECT',
        options: buildSelectOptions([
          'Newmark',
          'CBRE',
          'JLL',
          'Cushman',
          'Independiente',
          'Otro',
        ]),
      },
      { name: 'operacionesCnt', label: 'Operaciones', type: 'NUMBER' },
    ],
  },
  {
    nameSingular: 'hojaDeAcuerdos',
    namePlural: 'hojasDeAcuerdos',
    labelSingular: 'Hoja de Acuerdos',
    labelPlural: 'Hojas de Acuerdos',
    icon: 'IconWritingSign',
    skipNameField: true,
    labelIdentifierFieldName: 'referencia',
    fields: [
      { name: 'referencia', label: 'Referencia', type: 'TEXT', isNullable: false },
      { name: 'fechaFirma', label: 'Fecha firma', type: 'DATE', isNullable: false },
      {
        name: 'tipoContrato',
        label: 'Tipo contrato',
        type: 'SELECT',
        isNullable: false,
        options: buildSelectOptions([
          'Arrendamiento nuevo',
          'Renovación',
          'Modificatorio',
          'Terminación anticipada',
          'Build-to-suit',
        ]),
      },
      { name: 'm2Acordados', label: 'm² acordados', type: 'NUMBER', isNullable: false },
      {
        name: 'precioUsdM2',
        label: 'Precio USD/m²',
        type: 'NUMBER',
        isNullable: false,
      },
      { name: 'plazoMeses', label: 'Plazo (meses)', type: 'NUMBER', isNullable: false },
      { name: 'fechaInicio', label: 'Fecha inicio', type: 'DATE' },
      { name: 'periodoGraciaMeses', label: 'Periodo gracia (meses)', type: 'NUMBER' },
      { name: 'depositoMeses', label: 'Depósito (meses)', type: 'NUMBER' },
      { name: 'escalacionAnualPct', label: 'Escalación anual %', type: 'NUMBER' },
      {
        name: 'condicionesEspeciales',
        label: 'Condiciones especiales',
        type: 'TEXT',
      },
      { name: 'brokerComisionPct', label: 'Broker comisión %', type: 'NUMBER' },
      {
        name: 'brokerComisionMonto',
        label: 'Broker comisión monto',
        type: 'NUMBER',
      },
      { name: 'ejecutivoAsignado', label: 'Ejecutivo asignado', type: 'TEXT' },
      { name: 'aprobacionRequerida', label: 'Aprobación requerida', type: 'BOOLEAN' },
      {
        name: 'aprobadoPor',
        label: 'Aprobado por',
        type: 'SELECT',
        options: buildSelectOptions([
          'Pendiente',
          'Director Comercial',
          'CEO',
        ]),
      },
    ],
  },
  {
    nameSingular: 'casoLegal',
    namePlural: 'casosLegales',
    labelSingular: 'Caso Legal',
    labelPlural: 'Casos Legales',
    icon: 'IconScale',
    skipNameField: true,
    labelIdentifierFieldName: 'referencia',
    fields: [
      { name: 'referencia', label: 'Referencia', type: 'TEXT', isNullable: false },
      {
        name: 'tipoDocumento',
        label: 'Tipo documento',
        type: 'SELECT',
        options: buildSelectOptions([
          'Contrato nuevo',
          'Convenio renovación',
          'Convenio aclaración',
          'Terminación anticipada',
          'Build-to-suit',
        ]),
      },
      { name: 'abogadoAsignado', label: 'Abogado asignado', type: 'TEXT' },
      {
        name: 'estatus',
        label: 'Estatus',
        type: 'SELECT',
        options: buildSelectOptions([
          'Nuevo',
          'Documentación incompleta',
          'En elaboración',
          'Primera versión enviada',
          'En negociación con cliente',
          'Versión final aceptada',
          'Cotejo pendiente',
          'Flujo de firmas',
          'Firmado — cerrado',
          'Cancelado',
        ]),
      },
      {
        name: 'semaforo',
        label: 'Semáforo',
        type: 'SELECT',
        options: buildSelectOptions([
          'Azul',
          'Naranja',
          'Amarillo',
          'Verde',
          'Rojo',
        ]),
      },
      {
        name: 'fechaHojaAcuerdos',
        label: 'Fecha hoja acuerdos',
        type: 'DATE',
        isNullable: false,
      },
      {
        name: 'slaDiasHabiles',
        label: 'SLA días hábiles',
        type: 'NUMBER',
        isNullable: false,
      },
      { name: 'slaFechaLimite', label: 'SLA fecha límite', type: 'DATE' },
      { name: 'diasTranscurridos', label: 'Días transcurridos', type: 'NUMBER' },
      {
        name: 'documentacionCompleta',
        label: 'Documentación completa',
        type: 'BOOLEAN',
      },
      { name: 'cotejoAprobado', label: 'Cotejo aprobado', type: 'BOOLEAN' },
      { name: 'esPropiedadFuno', label: 'Es propiedad FUNO', type: 'BOOLEAN' },
      { name: 'notasCatalina', label: 'Notas Catalina', type: 'TEXT' },
      { name: 'pdfBorradorUrl', label: 'PDF borrador URL', type: 'TEXT' },
    ],
  },
  {
    nameSingular: 'documentoChecklist',
    namePlural: 'documentosChecklist',
    labelSingular: 'Documento Checklist',
    labelPlural: 'Documentos Checklist',
    icon: 'IconChecklist',
    skipNameField: true,
    labelIdentifierFieldName: 'titulo',
    fields: [
      { name: 'titulo', label: 'Título', type: 'TEXT', isNullable: false },
      {
        name: 'tipoDocumento',
        label: 'Tipo documento',
        type: 'SELECT',
        options: buildSelectOptions([
          'Acta constitutiva',
          'Poder notarial',
          'Comprobante domicilio',
          'INE representante',
          'CSF',
          'Constancia obligaciones',
          'Estados financieros',
          'Info obligado solidario',
          'Garantía',
          'NDA/Convenio confidencialidad',
        ]),
      },
      { name: 'entregado', label: 'Entregado', type: 'BOOLEAN' },
      { name: 'fechaEntrega', label: 'Fecha entrega', type: 'DATE' },
      { name: 'observaciones', label: 'Observaciones', type: 'TEXT' },
    ],
  },
  {
    nameSingular: 'versionDocumento',
    namePlural: 'versionesDocumento',
    labelSingular: 'Versión de Documento',
    labelPlural: 'Versiones de Documento',
    icon: 'IconFileDiff',
    skipNameField: true,
    labelIdentifierFieldName: 'titulo',
    fields: [
      { name: 'titulo', label: 'Título', type: 'TEXT', isNullable: false },
      {
        name: 'numeroVersion',
        label: 'Número versión',
        type: 'NUMBER',
        isNullable: false,
      },
      { name: 'fechaEnvio', label: 'Fecha envío', type: 'DATE', isNullable: false },
      { name: 'enviadoPor', label: 'Enviado por', type: 'TEXT' },
      {
        name: 'dirigidoA',
        label: 'Dirigido a',
        type: 'SELECT',
        options: buildSelectOptions([
          'Cliente',
          'Broker',
          'FUNO/NEXT',
          'Subdirector Legal',
          'CEO',
        ]),
      },
      {
        name: 'respuestaCliente',
        label: 'Respuesta cliente',
        type: 'SELECT',
        options: buildSelectOptions([
          'Pendiente',
          'Aceptada',
          'Modificaciones solicitadas',
          'Rechazada',
        ]),
      },
      {
        name: 'cambiosSolicitados',
        label: 'Cambios solicitados',
        type: 'TEXT',
      },
      { name: 'esVersionFinal', label: 'Es versión final', type: 'BOOLEAN' },
      { name: 'pdfUrl', label: 'PDF URL', type: 'TEXT' },
    ],
  },
  {
    nameSingular: 'flujoFirmas',
    namePlural: 'flujosFirmas',
    labelSingular: 'Flujo de Firmas',
    labelPlural: 'Flujos de Firmas',
    icon: 'IconWriting',
    skipNameField: true,
    labelIdentifierFieldName: 'firmante',
    fields: [
      { name: 'orden', label: 'Orden', type: 'NUMBER', isNullable: false },
      { name: 'firmante', label: 'Firmante', type: 'TEXT', isNullable: false },
      {
        name: 'rol',
        label: 'Rol',
        type: 'SELECT',
        options: buildSelectOptions([
          'Cliente',
          'Subdirector Legal',
          'Director General',
          'Apoderado FUNO 1',
          'Apoderado FUNO 2',
          'Director Jurídico FUNO',
        ]),
      },
      {
        name: 'estatus',
        label: 'Estatus',
        type: 'SELECT',
        options: buildSelectOptions([
          'Pendiente',
          'Enviado',
          'Firmado',
          'Rechazado',
        ]),
      },
      { name: 'fechaEnvio', label: 'Fecha envío', type: 'DATE' },
      { name: 'fechaFirma', label: 'Fecha firma', type: 'DATE' },
      { name: 'esExterno', label: 'Es externo', type: 'BOOLEAN' },
    ],
  },
  {
    nameSingular: 'holdover',
    namePlural: 'holdovers',
    labelSingular: 'Holdover',
    labelPlural: 'Holdovers',
    icon: 'IconAlertTriangle',
    skipNameField: true,
    labelIdentifierFieldName: 'referencia',
    fields: [
      { name: 'referencia', label: 'Referencia', type: 'TEXT', isNullable: false },
      {
        name: 'fechaInicioHoldover',
        label: 'Fecha inicio holdover',
        type: 'DATE',
        isNullable: false,
      },
      {
        name: 'rentaBaseMensualUsd',
        label: 'Renta base mensual USD',
        type: 'NUMBER',
        isNullable: false,
      },
      {
        name: 'montoHoldoverMensual',
        label: 'Monto holdover mensual',
        type: 'NUMBER',
      },
      { name: 'facturasEmitidas', label: 'Facturas emitidas', type: 'NUMBER' },
      {
        name: 'corteServiciosAutorizado',
        label: 'Corte servicios autorizado',
        type: 'BOOLEAN',
      },
      { name: 'corteAutorizadoPor', label: 'Corte autorizado por', type: 'TEXT' },
      { name: 'fechaCorteServicios', label: 'Fecha corte servicios', type: 'DATE' },
      {
        name: 'condonacionAutorizada',
        label: 'Condonación autorizada',
        type: 'BOOLEAN',
      },
      {
        name: 'condonacionAutorizadaPor',
        label: 'Condonación autorizada por',
        type: 'TEXT',
      },
      { name: 'montoCondonado', label: 'Monto condonado', type: 'NUMBER' },
      {
        name: 'resolucion',
        label: 'Resolución',
        type: 'SELECT',
        options: buildSelectOptions([
          'Activo',
          'Renovado',
          'Condonado',
          'Corte aplicado',
        ]),
      },
      { name: 'oracleNotificado', label: 'Oracle notificado', type: 'BOOLEAN' },
    ],
  },
  {
    nameSingular: 'comision',
    namePlural: 'comisiones',
    labelSingular: 'Comisión',
    labelPlural: 'Comisiones',
    icon: 'IconCurrencyDollar',
    skipNameField: true,
    labelIdentifierFieldName: 'beneficiario',
    fields: [
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'SELECT',
        options: buildSelectOptions(['Interna ejecutivo', 'Broker externo']),
      },
      {
        name: 'beneficiario',
        label: 'Beneficiario',
        type: 'TEXT',
        isNullable: false,
      },
      { name: 'montoUsd', label: 'Monto USD', type: 'NUMBER', isNullable: false },
      { name: 'baseCalculo', label: 'Base cálculo', type: 'TEXT' },
      {
        name: 'estatus',
        label: 'Estatus',
        type: 'SELECT',
        options: buildSelectOptions(['Calculada', 'Aprobada', 'Pagada']),
      },
      { name: 'aplicaFuno', label: 'Aplica FUNO', type: 'BOOLEAN' },
    ],
  },
  {
    nameSingular: 'expedienteContrato',
    namePlural: 'expedientesContrato',
    labelSingular: 'Expediente de Contrato',
    labelPlural: 'Expedientes de Contrato',
    icon: 'IconFolder',
    skipNameField: true,
    labelIdentifierFieldName: 'numeroExpediente',
    fields: [
      { name: 'numeroExpediente', label: 'Número expediente', type: 'TEXT' },
      { name: 'fechaApertura', label: 'Fecha apertura', type: 'DATE' },
      {
        name: 'fechaVencimiento',
        label: 'Fecha vencimiento',
        type: 'DATE',
        isNullable: false,
      },
      { name: 'rentaMensualUsd', label: 'Renta mensual USD', type: 'NUMBER' },
      {
        name: 'estatus',
        label: 'Estatus',
        type: 'SELECT',
        options: buildSelectOptions(['Activo', 'Archivado FUNO', 'Cerrado']),
      },
      { name: 'notas', label: 'Notas', type: 'TEXT' },
      { name: 'oracleContratoId', label: 'Oracle contrato ID', type: 'TEXT' },
      { name: 'oracleSincronizado', label: 'Oracle sincronizado', type: 'BOOLEAN' },
    ],
  },
];

export const PARKS_RELATION_DEFINITIONS: RelationDefinition[] = [
  {
    objectNameSingular: 'nave',
    name: 'parque',
    label: 'Parque',
    targetObjectNameSingular: 'parque',
    targetFieldLabel: 'Naves',
    targetFieldIcon: 'IconBuildingWarehouse',
  },
  {
    objectNameSingular: 'hojaDeAcuerdos',
    name: 'nave',
    label: 'Nave',
    targetObjectNameSingular: 'nave',
    targetFieldLabel: 'Hojas de Acuerdos',
    targetFieldIcon: 'IconWritingSign',
  },
  {
    objectNameSingular: 'hojaDeAcuerdos',
    name: 'inquilino',
    label: 'Inquilino',
    targetObjectNameSingular: 'inquilino',
    targetFieldLabel: 'Hojas de Acuerdos',
    targetFieldIcon: 'IconWritingSign',
  },
  {
    objectNameSingular: 'hojaDeAcuerdos',
    name: 'broker',
    label: 'Broker',
    targetObjectNameSingular: 'broker',
    targetFieldLabel: 'Hojas de Acuerdos',
    targetFieldIcon: 'IconWritingSign',
    isNullable: true,
  },
  {
    objectNameSingular: 'casoLegal',
    name: 'hojaDeAcuerdos',
    label: 'Hoja de Acuerdos',
    targetObjectNameSingular: 'hojaDeAcuerdos',
    targetFieldLabel: 'Casos Legales',
    targetFieldIcon: 'IconScale',
  },
  {
    objectNameSingular: 'casoLegal',
    name: 'inquilino',
    label: 'Inquilino',
    targetObjectNameSingular: 'inquilino',
    targetFieldLabel: 'Casos Legales',
    targetFieldIcon: 'IconScale',
  },
  {
    objectNameSingular: 'casoLegal',
    name: 'nave',
    label: 'Nave',
    targetObjectNameSingular: 'nave',
    targetFieldLabel: 'Casos Legales',
    targetFieldIcon: 'IconScale',
  },
  {
    objectNameSingular: 'documentoChecklist',
    name: 'casoLegal',
    label: 'Caso Legal',
    targetObjectNameSingular: 'casoLegal',
    targetFieldLabel: 'Documentos Checklist',
    targetFieldIcon: 'IconChecklist',
  },
  {
    objectNameSingular: 'versionDocumento',
    name: 'casoLegal',
    label: 'Caso Legal',
    targetObjectNameSingular: 'casoLegal',
    targetFieldLabel: 'Versiones de Documento',
    targetFieldIcon: 'IconFileDiff',
  },
  {
    objectNameSingular: 'flujoFirmas',
    name: 'casoLegal',
    label: 'Caso Legal',
    targetObjectNameSingular: 'casoLegal',
    targetFieldLabel: 'Flujos de Firmas',
    targetFieldIcon: 'IconWriting',
  },
  {
    objectNameSingular: 'holdover',
    name: 'casoLegal',
    label: 'Caso Legal',
    targetObjectNameSingular: 'casoLegal',
    targetFieldLabel: 'Holdovers',
    targetFieldIcon: 'IconAlertTriangle',
  },
  {
    objectNameSingular: 'holdover',
    name: 'inquilino',
    label: 'Inquilino',
    targetObjectNameSingular: 'inquilino',
    targetFieldLabel: 'Holdovers',
    targetFieldIcon: 'IconAlertTriangle',
  },
  {
    objectNameSingular: 'holdover',
    name: 'nave',
    label: 'Nave',
    targetObjectNameSingular: 'nave',
    targetFieldLabel: 'Holdovers',
    targetFieldIcon: 'IconAlertTriangle',
  },
  {
    objectNameSingular: 'comision',
    name: 'hojaDeAcuerdos',
    label: 'Hoja de Acuerdos',
    targetObjectNameSingular: 'hojaDeAcuerdos',
    targetFieldLabel: 'Comisiones',
    targetFieldIcon: 'IconCurrencyDollar',
  },
  {
    objectNameSingular: 'comision',
    name: 'casoLegal',
    label: 'Caso Legal',
    targetObjectNameSingular: 'casoLegal',
    targetFieldLabel: 'Comisiones',
    targetFieldIcon: 'IconCurrencyDollar',
  },
  {
    objectNameSingular: 'expedienteContrato',
    name: 'casoLegal',
    label: 'Caso Legal',
    targetObjectNameSingular: 'casoLegal',
    targetFieldLabel: 'Expediente de Contrato',
    targetFieldIcon: 'IconFolder',
  },
  {
    objectNameSingular: 'expedienteContrato',
    name: 'inquilino',
    label: 'Inquilino',
    targetObjectNameSingular: 'inquilino',
    targetFieldLabel: 'Expedientes de Contrato',
    targetFieldIcon: 'IconFolder',
  },
  {
    objectNameSingular: 'expedienteContrato',
    name: 'nave',
    label: 'Nave',
    targetObjectNameSingular: 'nave',
    targetFieldLabel: 'Expedientes de Contrato',
    targetFieldIcon: 'IconFolder',
  },
];
