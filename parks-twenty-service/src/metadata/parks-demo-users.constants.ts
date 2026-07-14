import { PARKS_ROLE_LABEL_PREFIX } from './parks-role-definitions';

export type ParksDemoUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleLabel: string;
  persona: string;
  /** existing = keep credentials; created = new Parks2026!NN password */
  provisionStatus: 'existing' | 'created';
};

// Seeded @apple.dev users — password must stay tim@apple.dev
export const PARKS_DEMO_USER_PASSWORD = 'tim@apple.dev';

// New @parksindustrial.com demo users — Parks2026! + sequential number
export const PARKS_NEW_DEMO_PASSWORD_PREFIX = 'Parks2026!';

export const PARKS_DEMO_USERS: ParksDemoUser[] = [
  // —— Existing personas (credentials unchanged) ——
  {
    email: 'jane.austen@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Jane',
    lastName: 'Austen',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
    persona: 'Catalina Moreno (Admin Legal) — alias apple.dev',
    provisionStatus: 'existing',
  },
  {
    email: 'roberto.salinas@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Roberto',
    lastName: 'Salinas',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Director Legal`,
    persona: 'Director Legal — alias apple.dev',
    provisionStatus: 'existing',
  },
  {
    email: 'patricia.nunez@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Patricia',
    lastName: 'Núñez',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Subdirector Legal`,
    persona: 'Subdirector Legal — alias apple.dev',
    provisionStatus: 'existing',
  },
  {
    email: 'jony.ive@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Charles',
    lastName: 'El-Mann Metta',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}CEO`,
    persona: 'Charlie Meta (CEO) — alias apple.dev',
    provisionStatus: 'existing',
  },
  {
    email: 'miguel.soto@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Miguel',
    lastName: 'Soto',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Abogado asignado`,
    persona: 'Abogado asignado — alias apple.dev',
    provisionStatus: 'existing',
  },
  {
    email: 'tim@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Tim',
    lastName: 'Apple',
    // Legacy LO label kept so existing workspace role assignments keep working
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
    persona: 'Leasing Officer (legacy label) — alias apple.dev',
    provisionStatus: 'existing',
  },
  {
    email: 'scott.forstall@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Scott',
    lastName: 'Forstall',
    // Legacy CxC label = Gerente CxC permissions
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}CxC`,
    persona: 'Gerente CxC (legacy CxC label) — alias apple.dev',
    provisionStatus: 'existing',
  },
  {
    email: 'phil.schiler@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Phil',
    lastName: 'Schiler',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
    persona: 'Héctor Montelongo (CEM) — alias apple.dev',
    provisionStatus: 'existing',
  },

  // —— New roles / users (Parks2026!NN) ——
  {
    email: 'israel.ramirez@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}01`,
    firstName: 'Israel',
    lastName: 'Ramírez',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}LO AAA Senior`,
    persona: 'Israel Ramírez (LO AAA Senior)',
    provisionStatus: 'created',
  },
  {
    email: 'uae@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}02`,
    firstName: 'UAE',
    lastName: 'LO',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}LO AAA Senior`,
    persona: 'UAE (LO AAA Senior)',
    provisionStatus: 'created',
  },
  {
    email: 'bruyel@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}03`,
    firstName: 'Bruyel',
    lastName: 'LO',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}LO Estándar`,
    persona: 'Bruyel (LO Estándar)',
    provisionStatus: 'created',
  },
  {
    email: 'director.financiero@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}04`,
    firstName: 'Laura',
    lastName: 'Fernández',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Miembro del Comité`,
    persona: 'Director Financiero / CFO (Miembro del Comité)',
    provisionStatus: 'created',
  },
  {
    email: 'director.operaciones@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}05`,
    firstName: 'Ricardo',
    lastName: 'Campos',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Miembro del Comité`,
    persona: 'Director de Operaciones (Miembro del Comité)',
    provisionStatus: 'created',
  },
  {
    email: 'claudia.rodriguez@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}06`,
    firstName: 'Claudia',
    lastName: 'Rodríguez',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Gerente CxC`,
    persona: 'Claudia Rodríguez (Gerente CxC)',
    provisionStatus: 'created',
  },
  {
    email: 'ejecutivo.cxc1@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}07`,
    firstName: 'Ejecutivo',
    lastName: 'CxC 1',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo CxC`,
    persona: 'Ejecutivo CxC 1',
    provisionStatus: 'created',
  },
  {
    email: 'ejecutivo.cxc2@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}08`,
    firstName: 'Ejecutivo',
    lastName: 'CxC 2',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo CxC`,
    persona: 'Ejecutivo CxC 2',
    provisionStatus: 'created',
  },
  {
    email: 'ejecutivo.cxc3@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}09`,
    firstName: 'Ejecutivo',
    lastName: 'CxC 3',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo CxC`,
    persona: 'Ejecutivo CxC 3',
    provisionStatus: 'created',
  },
  {
    email: 'jesus.gazon@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}10`,
    firstName: 'Jesús',
    lastName: 'Gazón',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Contratos y Facturación`,
    persona: 'Jesús Gazón (Contratos y Facturación)',
    provisionStatus: 'created',
  },
  {
    email: 'lilibeth.lopez@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}11`,
    firstName: 'Lilibeth',
    lastName: 'López',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Admin Sistema`,
    persona: 'Lilibeth López (Admin Sistema)',
    provisionStatus: 'created',
  },
  {
    email: 'admin.parque.gdl@parksindustrial.com',
    password: `${PARKS_NEW_DEMO_PASSWORD_PREFIX}12`,
    firstName: 'Admin',
    lastName: 'Parque GDL',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Admin Parque`,
    persona: 'Admin Parque Guadalajara',
    provisionStatus: 'created',
  },
];
