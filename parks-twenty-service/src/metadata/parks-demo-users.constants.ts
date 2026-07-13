import { PARKS_ROLE_LABEL_PREFIX } from './parks-role-definitions';

export type ParksDemoUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleLabel: string;
  persona: string;
};

// One dev user per Parks role — password matches other @apple.dev seeds
export const PARKS_DEMO_USER_PASSWORD = 'tim@apple.dev';

export const PARKS_DEMO_USERS: ParksDemoUser[] = [
  {
    email: 'jane.austen@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Jane',
    lastName: 'Austen',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
    persona: 'Catalina Moreno (Admin Legal)',
  },
  {
    email: 'roberto.salinas@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Roberto',
    lastName: 'Salinas',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Director Legal`,
    persona: 'Director Legal',
  },
  {
    email: 'patricia.nunez@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Patricia',
    lastName: 'Núñez',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Subdirector Legal`,
    persona: 'Subdirector Legal',
  },
  {
    email: 'jony.ive@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Jony',
    lastName: 'Ive',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}CEO`,
    persona: 'Charlie Meta (CEO)',
  },
  {
    email: 'miguel.soto@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Miguel',
    lastName: 'Soto',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Abogado asignado`,
    persona: 'Miguel Soto (Abogado)',
  },
  {
    email: 'tim@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Tim',
    lastName: 'Apple',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
    persona: 'Leasing Officer (LO)',
  },
  {
    email: 'scott.forstall@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Scott',
    lastName: 'Forstall',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}CxC`,
    persona: 'CxC / Cobranza',
  },
  {
    email: 'phil.schiler@apple.dev',
    password: PARKS_DEMO_USER_PASSWORD,
    firstName: 'Phil',
    lastName: 'Schiler',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
    persona: 'Héctor Montelongo (CEM)',
  },
];
