export type ParksObjectPermissionDefinition = {
  canReadObjectRecords: boolean;
  canUpdateObjectRecords: boolean;
  canSoftDeleteObjectRecords?: boolean;
  canDestroyObjectRecords?: boolean;
};

export type ParksRoleDefinition = {
  label: string;
  description: string;
  icon?: string;
  canReadAllObjectRecords?: boolean;
  canUpdateAllObjectRecords?: boolean;
  objectPermissionsByObjectName?: Record<
    string,
    ParksObjectPermissionDefinition
  >;
};

export const PARKS_ROLE_LABEL_PREFIX = 'Parks — ';

export const PARKS_CUSTOM_OBJECT_NAMES = [
  'parque',
  'nave',
  'inquilino',
  'broker',
  'hojaDeAcuerdos',
  'casoLegal',
  'documentoChecklist',
  'versionDocumento',
  'flujoFirmas',
  'holdover',
  'comision',
  'expedienteContrato',
] as const;

const FULL_ACCESS: ParksObjectPermissionDefinition = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

const READ_ONLY: ParksObjectPermissionDefinition = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

const READ_UPDATE: ParksObjectPermissionDefinition = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

const buildFullAccessForObjects = (
  objectNames: readonly string[],
): Record<string, ParksObjectPermissionDefinition> =>
  Object.fromEntries(objectNames.map((objectName) => [objectName, FULL_ACCESS]));

const buildReadOnlyForObjects = (
  objectNames: readonly string[],
): Record<string, ParksObjectPermissionDefinition> =>
  Object.fromEntries(objectNames.map((objectName) => [objectName, READ_ONLY]));

const LEGAL_OBJECT_NAMES = [
  'casoLegal',
  'documentoChecklist',
  'versionDocumento',
  'flujoFirmas',
  'hojaDeAcuerdos',
  'expedienteContrato',
  'holdover',
  'comision',
] as const;

const INFRA_OBJECT_NAMES = [
  'parque',
  'nave',
  'inquilino',
  'broker',
] as const;

export const PARKS_ROLE_DEFINITIONS: ParksRoleDefinition[] = [
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
    description: 'Catalina Moreno — CRUD completo en objetos legales Parks',
    icon: 'IconGavel',
    objectPermissionsByObjectName: {
      ...buildFullAccessForObjects(LEGAL_OBJECT_NAMES),
      ...buildReadOnlyForObjects(INFRA_OBJECT_NAMES),
      opportunity: READ_ONLY,
    },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Director Legal`,
    description: 'Director Legal — CRUD completo en objetos legales',
    icon: 'IconScale',
    objectPermissionsByObjectName: {
      ...buildFullAccessForObjects(LEGAL_OBJECT_NAMES),
      ...buildReadOnlyForObjects(INFRA_OBJECT_NAMES),
      opportunity: READ_ONLY,
    },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Subdirector Legal`,
    description: 'Subdirector Legal — CRUD completo en objetos legales',
    icon: 'IconBriefcase',
    objectPermissionsByObjectName: {
      ...buildFullAccessForObjects(LEGAL_OBJECT_NAMES),
      ...buildReadOnlyForObjects(INFRA_OBJECT_NAMES),
      opportunity: READ_ONLY,
    },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}CEO`,
    description: 'Charlie Meta — solo lectura + aprobaciones ejecutivas',
    icon: 'IconCrown',
    canReadAllObjectRecords: true,
    canUpdateAllObjectRecords: false,
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Abogado asignado`,
    description: 'Abogado — lectura y actualización de casos asignados',
    icon: 'IconUserEdit',
    objectPermissionsByObjectName: {
      casoLegal: READ_UPDATE,
      documentoChecklist: READ_UPDATE,
      versionDocumento: READ_UPDATE,
      flujoFirmas: READ_ONLY,
      hojaDeAcuerdos: READ_ONLY,
      inquilino: READ_ONLY,
      nave: READ_ONLY,
      parque: READ_ONLY,
    },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
    description: 'Ejecutivo — oportunidades y lectura de casos legales',
    icon: 'IconTarget',
    objectPermissionsByObjectName: {
      opportunity: FULL_ACCESS,
      casoLegal: READ_ONLY,
      hojaDeAcuerdos: READ_ONLY,
      inquilino: READ_ONLY,
      nave: READ_ONLY,
      parque: READ_ONLY,
      broker: READ_ONLY,
    },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}CxC`,
    description: 'Cuentas por cobrar — expedientes y holdovers (lectura)',
    icon: 'IconReceipt',
    objectPermissionsByObjectName: {
      expedienteContrato: READ_ONLY,
      holdover: READ_ONLY,
      inquilino: READ_ONLY,
      nave: READ_ONLY,
      casoLegal: READ_ONLY,
    },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
    description: 'Director Comercial — CRUD oportunidades + lectura legal',
    icon: 'IconChartBar',
    objectPermissionsByObjectName: {
      opportunity: FULL_ACCESS,
      casoLegal: READ_ONLY,
      hojaDeAcuerdos: READ_ONLY,
      expedienteContrato: READ_ONLY,
      holdover: READ_ONLY,
      inquilino: READ_ONLY,
      nave: READ_ONLY,
      parque: READ_ONLY,
      broker: READ_ONLY,
      comision: READ_ONLY,
    },
  },
];
