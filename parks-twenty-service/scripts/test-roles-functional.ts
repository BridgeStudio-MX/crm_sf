/**
 * Functional checks for Parks roles matrix (doc Roles_Permisos).
 * Run: npx tsx scripts/test-roles-functional.ts
 */
import assert from 'node:assert/strict';

import { PARKS_DEMO_USERS } from '../src/metadata/parks-demo-users.constants';
import { PARKS_ROLE_DEFINITIONS } from '../src/metadata/parks-role-definitions';
import { DEFAULT_COMITE_MEMBERS } from '../src/services/comite.store';

const LOG = '[test:roles]';

const REQUIRED_SYSTEM_CODES = [
  'CEO_Director_General',
  'Director_Comercial_CEM',
  'LO_AAA_Senior',
  'LO_Estandar',
  'Miembro_Comite',
  'Admin_Legal',
  'Abogado_Legal',
  'Director_Legal',
  'Subdirector_Legal',
  'Gerente_CxC',
  'Ejecutivo_CxC',
  'Contratos_Facturacion',
  'Admin_Sistema',
  'Admin_Parque',
] as const;

// Mirrors front PARKS_ROUTE_ACCESS_BY_KEY for critical limitantes
const ROLE = {
  CEO: 'Parks — CEO',
  CEM: 'Parks — Director Comercial',
  LO: 'Parks — Ejecutivo Comercial',
  LO_AAA: 'Parks — LO AAA Senior',
  LO_STD: 'Parks — LO Estándar',
  AdminLegal: 'Parks — Admin Legal',
  DirLegal: 'Parks — Director Legal',
  Miembro: 'Parks — Miembro del Comité',
  CxC: 'Parks — CxC',
  GerenteCxc: 'Parks — Gerente CxC',
  EjecutivoCxc: 'Parks — Ejecutivo CxC',
  Facturacion: 'Parks — Contratos y Facturación',
  AdminSistema: 'Parks — Admin Sistema',
  AdminParque: 'Parks — Admin Parque',
} as const;

type RouteKey =
  | 'asignacion'
  | 'comite'
  | 'cxc'
  | 'pipeline'
  | 'valorAgregado'
  | 'legalPipeline'
  | 'notificaciones'
  | 'stackingPlanIndex';

const ROUTE_ACCESS: Record<RouteKey, readonly string[]> = {
  asignacion: [ROLE.CEM, ROLE.AdminSistema],
  comite: [
    ROLE.CEM,
    ROLE.Miembro,
    ROLE.CEO,
    ROLE.LO,
    ROLE.LO_AAA,
    ROLE.LO_STD,
    ROLE.AdminSistema,
  ],
  cxc: [
    ROLE.CxC,
    ROLE.GerenteCxc,
    ROLE.EjecutivoCxc,
    ROLE.CEO,
    ROLE.CEM,
    ROLE.AdminSistema,
  ],
  pipeline: [ROLE.LO, ROLE.LO_AAA, ROLE.LO_STD, ROLE.CEM, ROLE.CEO, ROLE.AdminSistema],
  valorAgregado: [],
  legalPipeline: [
    'Parks — Admin Legal',
    'Parks — Director Legal',
    'Parks — Subdirector Legal',
    'Parks — Abogado asignado',
    ROLE.AdminSistema,
  ],
  notificaciones: Object.values(ROLE),
  stackingPlanIndex: [
    ROLE.LO,
    ROLE.LO_AAA,
    ROLE.LO_STD,
    ROLE.CEM,
    'Parks — Admin Legal',
    'Parks — Director Legal',
    'Parks — Subdirector Legal',
    'Parks — Abogado asignado',
    ROLE.AdminParque,
    ROLE.AdminSistema,
  ],
};

const EMAIL_TO_ROLE: Record<string, string> = Object.fromEntries(
  PARKS_DEMO_USERS.map((demoUser) => [demoUser.email, demoUser.roleLabel]),
);

const canAccess = (email: string, routeKey: RouteKey): boolean => {
  const roleLabel = EMAIL_TO_ROLE[email];
  assert.ok(roleLabel, `Unknown email ${email}`);
  return ROUTE_ACCESS[routeKey].includes(roleLabel);
};

const parksServiceUrl =
  process.env.PARKS_TWENTY_SERVICE_URL ?? 'http://127.0.0.1:3002';

const runLiveComiteChecks = async (): Promise<void> => {
  let healthOk = false;

  try {
    const health = await fetch(`${parksServiceUrl}/health`);
    healthOk = health.ok;
  } catch {
    console.warn(`${LOG} parks-twenty-service not reachable — skip live votes`);
    return;
  }

  if (!healthOk) {
    console.warn(`${LOG} health not ok — skip live votes`);
    return;
  }

  const listResponse = await fetch(`${parksServiceUrl}/comite`);
  assert.equal(listResponse.status, 200, 'GET /comite should work');
  const listPayload = (await listResponse.json()) as {
    comites: Array<{ id: string; estatus: string }>;
  };

  const abierto = listPayload.comites.find((comite) =>
    comite.estatus.includes('deliberación'),
  );

  if (!abierto) {
    console.warn(`${LOG} no open comité — skip vote functional checks`);
    return;
  }

  const detailResponse = await fetch(
    `${parksServiceUrl}/comite/${abierto.id}`,
  );
  const detail = (await detailResponse.json()) as {
    id: string;
    miembros: Array<{
      memberId: string;
      email: string;
      voto: string;
    }>;
  };

  const cfoSeat = detail.miembros.find(
    (member) => member.email === 'director.financiero@parksindustrial.com',
  );
  const cemSeat = detail.miembros.find(
    (member) => member.email === 'phil.schiler@apple.dev',
  );

  assert.ok(cfoSeat, 'CFO seat must use director.financiero@parksindustrial.com');
  assert.ok(cemSeat, 'CEM seat must use phil.schiler@apple.dev');
  assert.ok(
    !detail.miembros.some((member) => member.email === 'jony.ive@apple.dev'),
    'CEO must not hold a voting seat',
  );
  assert.ok(
    !detail.miembros.some(
      (member) => member.email === 'roberto.salinas@apple.dev',
    ),
    'Director Legal must not hold a voting seat',
  );

  // CEO cannot impersonate CEM seat
  const rejectedVote = await fetch(
    `${parksServiceUrl}/comite/${detail.id}/vote`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: cemSeat.memberId,
        voto: 'Se abstiene',
        viewerEmail: 'jony.ive@apple.dev',
      }),
    },
  );
  assert.equal(rejectedVote.status, 400, 'CEO impersonation vote must fail');

  console.log(`${LOG} ✓ LIVE seats + vote identity guard on ${detail.id}`);
};

const main = async (): Promise<void> => {
  console.log(`${LOG} validating role catalog…`);

  const systemCodes = new Set(
    PARKS_ROLE_DEFINITIONS.map((role) => role.systemCode).filter(Boolean),
  );

  for (const systemCode of REQUIRED_SYSTEM_CODES) {
    assert.ok(
      systemCodes.has(systemCode),
      `Missing role systemCode ${systemCode}`,
    );
  }

  assert.ok(
    PARKS_ROLE_DEFINITIONS.length >= 14,
    'Expected at least 14 role definitions (incl. aliases)',
  );

  console.log(`${LOG} ✓ role definitions cover 14 system codes`);

  const createdUsers = PARKS_DEMO_USERS.filter(
    (demoUser) => demoUser.provisionStatus === 'created',
  );
  const existingUsers = PARKS_DEMO_USERS.filter(
    (demoUser) => demoUser.provisionStatus === 'existing',
  );

  assert.equal(existingUsers.length, 8);
  assert.ok(createdUsers.length >= 12);

  for (const demoUser of existingUsers) {
    assert.equal(demoUser.password, 'tim@apple.dev');
  }

  for (const demoUser of createdUsers) {
    assert.match(demoUser.password, /^Parks2026!\d{2}$/);
  }

  console.log(
    `${LOG} ✓ demo users: ${existingUsers.length} existing + ${createdUsers.length} new`,
  );

  assert.equal(
    DEFAULT_COMITE_MEMBERS[0]?.email,
    'phil.schiler@apple.dev',
  );
  assert.equal(
    DEFAULT_COMITE_MEMBERS[1]?.email,
    'director.financiero@parksindustrial.com',
  );
  assert.equal(
    DEFAULT_COMITE_MEMBERS[2]?.email,
    'director.operaciones@parksindustrial.com',
  );

  console.log(`${LOG} ✓ default comité seats`);

  // Route limitantes (functional matrix)
  assert.equal(canAccess('jony.ive@apple.dev', 'asignacion'), false);
  assert.equal(canAccess('phil.schiler@apple.dev', 'asignacion'), true);

  assert.equal(canAccess('jony.ive@apple.dev', 'comite'), true);
  assert.equal(canAccess('roberto.salinas@apple.dev', 'comite'), false);
  assert.equal(
    canAccess('director.financiero@parksindustrial.com', 'comite'),
    true,
  );
  assert.equal(
    canAccess('director.financiero@parksindustrial.com', 'pipeline'),
    false,
  );

  assert.equal(canAccess('jane.austen@apple.dev', 'cxc'), false);
  assert.equal(canAccess('scott.forstall@apple.dev', 'cxc'), true);
  assert.equal(
    canAccess('claudia.rodriguez@parksindustrial.com', 'cxc'),
    true,
  );

  assert.equal(canAccess('tim@apple.dev', 'valorAgregado'), false);
  assert.equal(canAccess('phil.schiler@apple.dev', 'valorAgregado'), false);
  assert.equal(canAccess('jony.ive@apple.dev', 'valorAgregado'), false);
  assert.equal(canAccess('tim@apple.dev', 'pipeline'), true);
  assert.equal(canAccess('tim@apple.dev', 'comite'), true);

  assert.equal(
    canAccess('jesus.gazon@parksindustrial.com', 'pipeline'),
    false,
  );
  assert.equal(
    canAccess('jesus.gazon@parksindustrial.com', 'notificaciones'),
    true,
  );

  assert.equal(
    canAccess('admin.parque.gdl@parksindustrial.com', 'stackingPlanIndex'),
    true,
  );
  assert.equal(
    canAccess('admin.parque.gdl@parksindustrial.com', 'pipeline'),
    false,
  );

  assert.equal(
    canAccess('lilibeth.lopez@parksindustrial.com', 'asignacion'),
    true,
  );
  assert.equal(
    canAccess('lilibeth.lopez@parksindustrial.com', 'legalPipeline'),
    true,
  );

  console.log(`${LOG} ✓ route access matrix (limitantes clave)`);

  await runLiveComiteChecks();

  console.log(`${LOG} ALL PASSED`);
};

main().catch((error) => {
  console.error(`${LOG} FAILED`, error);
  process.exit(1);
});
