import { PARKS_ROLE_LABEL_PREFIX } from './parks-role-definitions';

export type ParksDemoRoleAssignment = {
  userEmail: string;
  roleLabel: string;
  persona: string;
};

// Dev workspace (@apple.dev) users mapped to Parks demo personas
export const PARKS_DEMO_ROLE_ASSIGNMENTS: ParksDemoRoleAssignment[] = [
  {
    userEmail: 'jane.austen@apple.dev',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
    persona: 'Catalina Moreno (Legal)',
  },
  {
    userEmail: 'phil.schiler@apple.dev',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
    persona: 'Héctor Montelongo (Comercial)',
  },
  {
    userEmail: 'jony.ive@apple.dev',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}CEO`,
    persona: 'Charlie Meta (Ejecutivo)',
  },
  {
    userEmail: 'scott.forstall@apple.dev',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}CxC`,
    persona: 'CxC / Cobranza',
  },
  {
    userEmail: 'tim@apple.dev',
    roleLabel: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
    persona: 'Broker demo principal',
  },
];
