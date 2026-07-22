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
  /** Doc system code from Parks_Industrial_Roles_Permisos_Cursor.md */
  systemCode?: string;
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

const LO_OBJECT_PERMISSIONS = {
  opportunity: FULL_ACCESS,
  casoLegal: READ_ONLY,
  hojaDeAcuerdos: READ_ONLY,
  inquilino: READ_ONLY,
  nave: READ_ONLY,
  parque: READ_ONLY,
  broker: READ_ONLY,
} as const;

const CXC_OBJECT_PERMISSIONS = {
  expedienteContrato: READ_ONLY,
  holdover: READ_ONLY,
  inquilino: READ_ONLY,
  nave: READ_ONLY,
  casoLegal: READ_ONLY,
} as const;

export const PARKS_ROLE_DEFINITIONS: ParksRoleDefinition[] = [
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
    systemCode: 'Admin_Legal',
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
    systemCode: 'Director_Legal',
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
    systemCode: 'Subdirector_Legal',
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
    systemCode: 'CEO_Director_General',
    description:
      'Charles El Mann Metta — solo lectura + aprobaciones ejecutivas',
    icon: 'IconCrown',
    canReadAllObjectRecords: true,
    canUpdateAllObjectRecords: false,
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Abogado asignado`,
    systemCode: 'Abogado_Legal',
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
  // Legacy alias — same permissions as LO AAA / LO Estándar
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
    systemCode: 'LO_AAA_Senior',
    description:
      'Leasing Officer (legacy label) — oportunidades y lectura legal',
    icon: 'IconTarget',
    objectPermissionsByObjectName: { ...LO_OBJECT_PERMISSIONS },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}LO AAA Senior`,
    systemCode: 'LO_AAA_Senior',
    description:
      'LO AAA Senior — mismos permisos que LO Estándar; nivel_lo diferencia asignación',
    icon: 'IconTarget',
    objectPermissionsByObjectName: { ...LO_OBJECT_PERMISSIONS },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}LO Estándar`,
    systemCode: 'LO_Estandar',
    description:
      'LO Estándar — mismos permisos que LO AAA; nivel_lo diferencia asignación',
    icon: 'IconTarget',
    objectPermissionsByObjectName: { ...LO_OBJECT_PERMISSIONS },
  },
  // Legacy CxC alias kept for scott.forstall@apple.dev
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}CxC`,
    systemCode: 'Gerente_CxC',
    description: 'CxC (legacy) — alias de Gerente CxC',
    icon: 'IconReceipt',
    objectPermissionsByObjectName: { ...CXC_OBJECT_PERMISSIONS },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Gerente CxC`,
    systemCode: 'Gerente_CxC',
    description: 'Claudia Rodríguez — cartera CxC total + lectura legal',
    icon: 'IconReceipt',
    objectPermissionsByObjectName: { ...CXC_OBJECT_PERMISSIONS },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo CxC`,
    systemCode: 'Ejecutivo_CxC',
    description: 'Ejecutivo CxC — solo cuentas asignadas (lectura/gestión UI)',
    icon: 'IconReceipt2',
    objectPermissionsByObjectName: { ...CXC_OBJECT_PERMISSIONS },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
    systemCode: 'Director_Comercial_CEM',
    description: 'Director Comercial / CEM — CRUD oportunidades + comité',
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
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Miembro del Comité`,
    systemCode: 'Miembro_Comite',
    description:
      'CFO / Ops — solo módulo comité (voto). Sin acceso comercial/legal/CxC',
    icon: 'IconUsersGroup',
    objectPermissionsByObjectName: {
      hojaDeAcuerdos: READ_ONLY,
      opportunity: READ_ONLY,
      inquilino: READ_ONLY,
      nave: READ_ONLY,
    },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Contratos y Facturación`,
    systemCode: 'Contratos_Facturacion',
    description:
      'Jesús Gazón — notificaciones Oracle / confirmaciones (sin editar deals)',
    icon: 'IconFileInvoice',
    objectPermissionsByObjectName: {
      expedienteContrato: READ_ONLY,
      casoLegal: READ_ONLY,
      inquilino: READ_ONLY,
      nave: READ_ONLY,
      holdover: READ_ONLY,
    },
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Admin Sistema`,
    systemCode: 'Admin_Sistema',
    description: 'Lilibeth — configuración total (no uso operativo cotidiano)',
    icon: 'IconSettings',
    canReadAllObjectRecords: true,
    canUpdateAllObjectRecords: true,
  },
  {
    label: `${PARKS_ROLE_LABEL_PREFIX}Admin Parque`,
    systemCode: 'Admin_Parque',
    description: 'Admin de parque — inventario y contratos de su parque',
    icon: 'IconBuildingWarehouse',
    objectPermissionsByObjectName: {
      parque: READ_ONLY,
      nave: READ_ONLY,
      inquilino: READ_ONLY,
      expedienteContrato: READ_ONLY,
    },
  },
];
