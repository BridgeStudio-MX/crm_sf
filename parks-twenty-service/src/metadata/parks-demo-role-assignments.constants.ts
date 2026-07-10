import { PARKS_DEMO_USERS } from './parks-demo-users.constants';

export type ParksDemoRoleAssignment = {
  userEmail: string;
  roleLabel: string;
  persona: string;
};

export const PARKS_DEMO_ROLE_ASSIGNMENTS: ParksDemoRoleAssignment[] =
  PARKS_DEMO_USERS.map((demoUser) => ({
    userEmail: demoUser.email,
    roleLabel: demoUser.roleLabel,
    persona: demoUser.persona,
  }));
