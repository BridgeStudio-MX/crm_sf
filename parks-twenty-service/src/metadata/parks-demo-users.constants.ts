import { PARKS_ROLE_LABEL_PREFIX } from './parks-role-definitions';

export type ParksDemoUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleLabel: string;
  persona: string;
  provisionStatus: 'existing' | 'created';
  legacyEmails?: string[];
};

export const PARKS_DEMO_LOGIN_DOMAIN = 'prk.com.mx';
export const PARKS_DEMO_USER_PASSWORD = 'parksindustrial2026!';
export const TWENTY_BOOTSTRAP_EMAIL = 'tim@apple.dev';
export const TWENTY_BOOTSTRAP_PASSWORD = 'tim@apple.dev';

export const PARKS_DEMO_EMAIL = {
  ceo: `ceo@${PARKS_DEMO_LOGIN_DOMAIN}`,
  directorComercial: `directorcomercial@${PARKS_DEMO_LOGIN_DOMAIN}`,
  loAaaIsrael: `leasingofficeraaa@${PARKS_DEMO_LOGIN_DOMAIN}`,
  loAaaUae: `leasingofficeraaa2@${PARKS_DEMO_LOGIN_DOMAIN}`,
  loEstandar: `leasingofficer@${PARKS_DEMO_LOGIN_DOMAIN}`,
  ejecutivoComercial: `ejecutivocomercial@${PARKS_DEMO_LOGIN_DOMAIN}`,
  adminLegal: `adminlegal@${PARKS_DEMO_LOGIN_DOMAIN}`,
  directorLegal: `directorlegal@${PARKS_DEMO_LOGIN_DOMAIN}`,
  subdirectorLegal: `subdirectorlegal@${PARKS_DEMO_LOGIN_DOMAIN}`,
  abogadoAsignado: `abogado@${PARKS_DEMO_LOGIN_DOMAIN}`,
  cfo: `cfo@${PARKS_DEMO_LOGIN_DOMAIN}`,
  directorOperaciones: `directoroperaciones@${PARKS_DEMO_LOGIN_DOMAIN}`,
  gerenteCxc: `gerentecxc@${PARKS_DEMO_LOGIN_DOMAIN}`,
  ejecutivoCxc1: `ejecutivocxc@${PARKS_DEMO_LOGIN_DOMAIN}`,
  ejecutivoCxc2: `ejecutivocxc2@${PARKS_DEMO_LOGIN_DOMAIN}`,
  ejecutivoCxc3: `ejecutivocxc3@${PARKS_DEMO_LOGIN_DOMAIN}`,
  contratosFacturacion: `contratos@${PARKS_DEMO_LOGIN_DOMAIN}`,
  adminSistema: `adminsistema@${PARKS_DEMO_LOGIN_DOMAIN}`,
  adminParque: `adminparque@${PARKS_DEMO_LOGIN_DOMAIN}`,
} as const;

export const PARKS_DEMO_EMAIL_ALIASES: Record<string, string> = {
  'jony.ive@apple.dev': PARKS_DEMO_EMAIL.ceo,
  'charles.elmann@parksindustrial.com': PARKS_DEMO_EMAIL.ceo,
  'phil.schiler@apple.dev': PARKS_DEMO_EMAIL.directorComercial,
  'hector.montelongo@parksindustrial.com': PARKS_DEMO_EMAIL.directorComercial,
  'israel.ramirez@parksindustrial.com': PARKS_DEMO_EMAIL.loAaaIsrael,
  'uae@parksindustrial.com': PARKS_DEMO_EMAIL.loAaaUae,
  'bruyel@parksindustrial.com': PARKS_DEMO_EMAIL.loEstandar,
  'jane.austen@apple.dev': PARKS_DEMO_EMAIL.adminLegal,
  'catalina.moreno@parksindustrial.com': PARKS_DEMO_EMAIL.adminLegal,
  'roberto.salinas@apple.dev': PARKS_DEMO_EMAIL.directorLegal,
  'roberto.salinas@parksindustrial.com': PARKS_DEMO_EMAIL.directorLegal,
  'patricia.nunez@apple.dev': PARKS_DEMO_EMAIL.subdirectorLegal,
  'patricia.nunez@parksindustrial.com': PARKS_DEMO_EMAIL.subdirectorLegal,
  'miguel.soto@apple.dev': PARKS_DEMO_EMAIL.abogadoAsignado,
  'miguel.soto@parksindustrial.com': PARKS_DEMO_EMAIL.abogadoAsignado,
  'laura.fernandez@parksindustrial.com': PARKS_DEMO_EMAIL.cfo,
  'director.financiero@parksindustrial.com': PARKS_DEMO_EMAIL.cfo,
  'ricardo.campos@parksindustrial.com': PARKS_DEMO_EMAIL.directorOperaciones,
  'director.operaciones@parksindustrial.com':
    PARKS_DEMO_EMAIL.directorOperaciones,
  'scott.forstall@apple.dev': PARKS_DEMO_EMAIL.gerenteCxc,
  'claudia.rodriguez@parksindustrial.com': PARKS_DEMO_EMAIL.gerenteCxc,
  'ejecutivo.cxc1@parksindustrial.com': PARKS_DEMO_EMAIL.ejecutivoCxc1,
  'ejecutivo.cxc2@parksindustrial.com': PARKS_DEMO_EMAIL.ejecutivoCxc2,
  'ejecutivo.cxc3@parksindustrial.com': PARKS_DEMO_EMAIL.ejecutivoCxc3,
  'jesus.gazon@parksindustrial.com': PARKS_DEMO_EMAIL.contratosFacturacion,
  'lilibeth.lopez@parksindustrial.com': PARKS_DEMO_EMAIL.adminSistema,
  'admin.parque.gdl@parksindustrial.com': PARKS_DEMO_EMAIL.adminParque,
};

export const resolveParksDemoCanonicalEmail = (email: string): string => {
  const normalizedEmail = email.trim().toLowerCase();

  return PARKS_DEMO_EMAIL_ALIASES[normalizedEmail] ?? normalizedEmail;
};

const parksDemoUser = ({
  email,
  firstName,
  lastName,
  roleLabel,
  persona,
  legacyEmails = [],
}: {
  email: string;
  firstName: string;
  lastName: string;
  roleLabel: string;
  persona: string;
  legacyEmails?: string[];
}): ParksDemoUser => ({
  email,
  password: PARKS_DEMO_USER_PASSWORD,
  firstName,
  lastName,
  roleLabel,
  persona,
  provisionStatus: 'created',
  legacyEmails,
});

export const PARKS_DEMO_USERS: ParksDemoUser[] = [
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.ceo,
    firstName: 'CEO',
    lastName: 'Parks',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}CEO`,
    persona: 'CEO',
    legacyEmails: [
      'charles.elmann@parksindustrial.com',
      'jony.ive@apple.dev',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.directorComercial,
    firstName: 'Director',
    lastName: 'Comercial',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
    persona: 'Director Comercial',
    legacyEmails: [
      'hector.montelongo@parksindustrial.com',
      'phil.schiler@apple.dev',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.loAaaIsrael,
    firstName: 'Leasing Officer',
    lastName: 'AAA',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}LO AAA Senior`,
    persona: 'Leasing Officer AAA',
    legacyEmails: ['israel.ramirez@parksindustrial.com'],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.loAaaUae,
    firstName: 'Leasing Officer',
    lastName: 'AAA 2',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}LO AAA Senior`,
    persona: 'Leasing Officer AAA 2',
    legacyEmails: ['uae@parksindustrial.com'],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.loEstandar,
    firstName: 'Leasing Officer',
    lastName: 'Estándar',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}LO Estándar`,
    persona: 'Leasing Officer',
    legacyEmails: ['bruyel@parksindustrial.com'],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.ejecutivoComercial,
    firstName: 'Ejecutivo',
    lastName: 'Comercial',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
    persona: 'Ejecutivo Comercial',
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.adminLegal,
    firstName: 'Admin',
    lastName: 'Legal',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
    persona: 'Admin Legal',
    legacyEmails: [
      'catalina.moreno@parksindustrial.com',
      'jane.austen@apple.dev',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.directorLegal,
    firstName: 'Director',
    lastName: 'Legal',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Director Legal`,
    persona: 'Director Legal',
    legacyEmails: [
      'roberto.salinas@parksindustrial.com',
      'roberto.salinas@apple.dev',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.subdirectorLegal,
    firstName: 'Subdirector',
    lastName: 'Legal',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Subdirector Legal`,
    persona: 'Subdirector Legal',
    legacyEmails: [
      'patricia.nunez@parksindustrial.com',
      'patricia.nunez@apple.dev',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.abogadoAsignado,
    firstName: 'Abogado',
    lastName: 'Asignado',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Abogado asignado`,
    persona: 'Abogado asignado',
    legacyEmails: [
      'miguel.soto@parksindustrial.com',
      'miguel.soto@apple.dev',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.cfo,
    firstName: 'CFO',
    lastName: 'Comité',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Miembro del Comité`,
    persona: 'CFO / Director Financiero',
    legacyEmails: [
      'laura.fernandez@parksindustrial.com',
      'director.financiero@parksindustrial.com',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.directorOperaciones,
    firstName: 'Director',
    lastName: 'Operaciones',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Miembro del Comité`,
    persona: 'Director de Operaciones',
    legacyEmails: [
      'ricardo.campos@parksindustrial.com',
      'director.operaciones@parksindustrial.com',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.gerenteCxc,
    firstName: 'Gerente',
    lastName: 'CxC',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Gerente CxC`,
    persona: 'Gerente CxC',
    legacyEmails: [
      'claudia.rodriguez@parksindustrial.com',
      'scott.forstall@apple.dev',
    ],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.ejecutivoCxc1,
    firstName: 'Ejecutivo',
    lastName: 'CxC',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo CxC`,
    persona: 'Ejecutivo CxC',
    legacyEmails: ['ejecutivo.cxc1@parksindustrial.com'],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.ejecutivoCxc2,
    firstName: 'Ejecutivo',
    lastName: 'CxC 2',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo CxC`,
    persona: 'Ejecutivo CxC 2',
    legacyEmails: ['ejecutivo.cxc2@parksindustrial.com'],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.ejecutivoCxc3,
    firstName: 'Ejecutivo',
    lastName: 'CxC 3',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo CxC`,
    persona: 'Ejecutivo CxC 3',
    legacyEmails: ['ejecutivo.cxc3@parksindustrial.com'],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.contratosFacturacion,
    firstName: 'Contratos',
    lastName: 'Facturación',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Contratos y Facturación`,
    persona: 'Contratos y Facturación',
    legacyEmails: ['jesus.gazon@parksindustrial.com'],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.adminSistema,
    firstName: 'Admin',
    lastName: 'Sistema',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Admin Sistema`,
    persona: 'Admin Sistema',
    legacyEmails: ['lilibeth.lopez@parksindustrial.com'],
  }),
  parksDemoUser({
    email: PARKS_DEMO_EMAIL.adminParque,
    firstName: 'Admin',
    lastName: 'Parque',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Admin Parque`,
    persona: 'Admin Parque',
    legacyEmails: ['admin.parque.gdl@parksindustrial.com'],
  }),
];
