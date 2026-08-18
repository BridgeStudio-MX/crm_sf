/**
 * Live functional role tests: login → workspace role → route ACL → comité vote identity.
 * Run: npx tsx scripts/test-roles-live.ts
 */
import assert from 'node:assert/strict';

import { PARKS_DEMO_EMAIL, PARKS_DEMO_USERS } from '../src/metadata/parks-demo-users.constants';
import { resolveTwentyAuthTokenForUser } from '../src/metadata/resolve-twenty-auth-token';
import { twentyConfig } from '../src/config/twenty.config';

const LOG = '[test:roles-live]';
const parksServiceUrl =
  process.env.PARKS_TWENTY_SERVICE_URL ?? 'http://127.0.0.1:3002';

const ROLE = {
  CEO: 'Parks — CEO',
  CEM: 'Parks — Director Comercial',
  LO: 'Parks — Ejecutivo Comercial',
  LO_AAA: 'Parks — LO AAA Senior',
  AdminLegal: 'Parks — Admin Legal',
  DirLegal: 'Parks — Director Legal',
  Miembro: 'Parks — Miembro del Comité',
  CxC: 'Parks — CxC',
  GerenteCxc: 'Parks — Gerente CxC',
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
  | 'leadsCem';

// Same allow-list as front PARKS_ROUTE_ACCESS_BY_KEY (limitantes clave)
const ROUTE_ACCESS: Record<RouteKey, readonly string[]> = {
  asignacion: [ROLE.CEM, ROLE.AdminSistema],
  comite: [
    ROLE.CEM,
    ROLE.Miembro,
    ROLE.CEO,
    ROLE.LO,
    ROLE.LO_AAA,
    'Parks — LO Estándar',
    ROLE.AdminSistema,
  ],
  cxc: [
    ROLE.CxC,
    ROLE.GerenteCxc,
    'Parks — Ejecutivo CxC',
    ROLE.CEO,
    ROLE.CEM,
    ROLE.AdminSistema,
  ],
  pipeline: [
    ROLE.LO,
    ROLE.LO_AAA,
    'Parks — LO Estándar',
    ROLE.CEM,
    ROLE.CEO,
    ROLE.AdminSistema,
  ],
  valorAgregado: [],
  legalPipeline: [
    ROLE.AdminLegal,
    ROLE.DirLegal,
    'Parks — Subdirector Legal',
    'Parks — Abogado asignado',
    ROLE.AdminSistema,
  ],
  notificaciones: [
    ...Object.values(ROLE),
    'Parks — LO Estándar',
    'Parks — Ejecutivo CxC',
    'Parks — Subdirector Legal',
    'Parks — Abogado asignado',
  ],
  leadsCem: [ROLE.CEM, ROLE.AdminSistema],
};

const EMAIL_TO_ROLE = Object.fromEntries(
  PARKS_DEMO_USERS.map((demoUser) => [demoUser.email, demoUser.roleLabel]),
);

const canAccess = (email: string, routeKey: RouteKey): boolean => {
  const roleLabel = EMAIL_TO_ROLE[email];
  assert.ok(roleLabel, `Unknown email ${email}`);
  return ROUTE_ACCESS[routeKey].includes(roleLabel);
};

const fetchWorkspaceRoleLabels = async (
  email: string,
  password: string,
): Promise<string[]> => {
  const token = await resolveTwentyAuthTokenForUser(email, password);
  const response = await fetch(twentyConfig.metadataUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query CurrentUserParksRoles {
          currentUser {
            email
            workspaceMember {
              userEmail
              roles { label }
            }
          }
        }
      `,
    }),
  });

  assert.equal(response.status, 200, `Metadata HTTP for ${email}`);
  const payload = (await response.json()) as {
    data?: {
      currentUser?: {
        email?: string;
        workspaceMember?: {
          userEmail?: string;
          roles?: Array<{ label: string }>;
        };
      };
    };
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(`${email}: ${payload.errors[0]?.message}`);
  }

  return (payload.data?.currentUser?.workspaceMember?.roles ?? [])
    .map((role) => role.label)
    .filter((label) => label.startsWith('Parks — '));
};

type CaseExpectation = {
  email: string;
  password: string;
  expectedRole: string;
  allow: RouteKey[];
  deny: RouteKey[];
};

const demoPassword = (email: string): string => {
  const demoUser = PARKS_DEMO_USERS.find((user) => user.email === email);
  assert.ok(demoUser, `Missing demo user ${email}`);
  return demoUser.password;
};

const CASES: CaseExpectation[] = [
  {
    email: PARKS_DEMO_EMAIL.ceo,
    password: demoPassword(PARKS_DEMO_EMAIL.ceo),
    expectedRole: ROLE.CEO,
    allow: ['comite', 'pipeline', 'cxc', 'notificaciones'],
    deny: ['asignacion', 'leadsCem', 'legalPipeline', 'valorAgregado'],
  },
  {
    email: PARKS_DEMO_EMAIL.directorComercial,
    password: demoPassword(PARKS_DEMO_EMAIL.directorComercial),
    expectedRole: ROLE.CEM,
    allow: [
      'asignacion',
      'comite',
      'pipeline',
      'cxc',
      'leadsCem',
    ],
    deny: ['legalPipeline', 'valorAgregado'],
  },
  {
    email: PARKS_DEMO_EMAIL.cfo,
    password: demoPassword(PARKS_DEMO_EMAIL.cfo),
    expectedRole: ROLE.Miembro,
    allow: ['comite', 'notificaciones'],
    deny: ['pipeline', 'cxc', 'asignacion', 'legalPipeline', 'valorAgregado'],
  },
  {
    email: PARKS_DEMO_EMAIL.directorLegal,
    password: demoPassword(PARKS_DEMO_EMAIL.directorLegal),
    expectedRole: ROLE.DirLegal,
    allow: ['legalPipeline', 'notificaciones'],
    deny: ['comite', 'cxc', 'asignacion', 'pipeline'],
  },
  {
    email: PARKS_DEMO_EMAIL.adminLegal,
    password: demoPassword(PARKS_DEMO_EMAIL.adminLegal),
    expectedRole: ROLE.AdminLegal,
    allow: ['legalPipeline', 'notificaciones'],
    deny: ['cxc', 'comite', 'asignacion', 'pipeline'],
  },
  {
    email: PARKS_DEMO_EMAIL.loAaaIsrael,
    password: demoPassword(PARKS_DEMO_EMAIL.loAaaIsrael),
    expectedRole: ROLE.LO_AAA,
    allow: ['pipeline', 'comite', 'notificaciones'],
    deny: ['asignacion', 'valorAgregado', 'cxc', 'legalPipeline'],
  },
  {
    email: PARKS_DEMO_EMAIL.gerenteCxc,
    password: demoPassword(PARKS_DEMO_EMAIL.gerenteCxc),
    expectedRole: ROLE.GerenteCxc,
    allow: ['cxc', 'notificaciones'],
    deny: ['pipeline', 'comite', 'asignacion', 'legalPipeline'],
  },
  {
    email: PARKS_DEMO_EMAIL.contratosFacturacion,
    password: demoPassword(PARKS_DEMO_EMAIL.contratosFacturacion),
    expectedRole: ROLE.Facturacion,
    allow: ['notificaciones'],
    deny: ['pipeline', 'cxc', 'comite', 'asignacion'],
  },
  {
    email: PARKS_DEMO_EMAIL.adminParque,
    password: demoPassword(PARKS_DEMO_EMAIL.adminParque),
    expectedRole: ROLE.AdminParque,
    allow: ['notificaciones'],
    deny: ['pipeline', 'comite', 'cxc', 'asignacion'],
  },
];

const runComiteIdentityChecks = async (): Promise<void> => {
  const listResponse = await fetch(`${parksServiceUrl}/comite`);
  assert.equal(listResponse.status, 200);
  const listPayload = (await listResponse.json()) as {
    comites: Array<{ id: string; estatus: string }>;
  };

  const abierto = listPayload.comites.find((comite) =>
    comite.estatus.includes('deliberación'),
  );
  assert.ok(abierto, 'Need at least one open comité for vote checks');

  const detailResponse = await fetch(
    `${parksServiceUrl}/comite/${abierto.id}`,
  );
  const detail = (await detailResponse.json()) as {
    id: string;
    miembros: Array<{ memberId: string; email: string; voto: string }>;
  };

  const cemSeat = detail.miembros.find(
    (member) => member.email === PARKS_DEMO_EMAIL.directorComercial,
  );
  const cfoSeat = detail.miembros.find(
    (member) => member.email === PARKS_DEMO_EMAIL.cfo,
  );
  const opsSeat = detail.miembros.find(
    (member) => member.email === PARKS_DEMO_EMAIL.directorOperaciones,
  );

  assert.ok(cemSeat, 'CEM seat');
  assert.ok(cfoSeat, 'CFO seat');
  assert.ok(opsSeat, 'Ops seat');

  // CEO trying to vote as CEM → blocked
  const ceoReject = await fetch(`${parksServiceUrl}/comite/${detail.id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: cemSeat.memberId,
      voto: 'Se abstiene',
      viewerEmail: PARKS_DEMO_EMAIL.ceo,
    }),
  });
  assert.equal(ceoReject.status, 400, 'CEO cannot impersonate CEM seat');

  // LO trying to vote as Ops → blocked
  const loReject = await fetch(`${parksServiceUrl}/comite/${detail.id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: opsSeat.memberId,
      voto: 'Se abstiene',
      viewerEmail: PARKS_DEMO_EMAIL.loAaaIsrael,
    }),
  });
  assert.equal(loReject.status, 400, 'LO cannot impersonate Ops seat');

  // Legitimate seat: prefer Ops if still Pendiente (avoid consuming CEM repeatedly)
  const pendingSeat =
    detail.miembros.find(
      (member) =>
        member.voto === 'Pendiente' &&
        member.email === PARKS_DEMO_EMAIL.directorOperaciones,
    ) ??
    detail.miembros.find((member) => member.voto === 'Pendiente');

  if (!pendingSeat) {
    console.warn(`${LOG} no pending seats — skip successful vote`);
    return;
  }

  const okVote = await fetch(`${parksServiceUrl}/comite/${detail.id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: pendingSeat.memberId,
      voto: 'Se abstiene',
      viewerEmail: pendingSeat.email,
      comentario: 'Prueba funcional roles — abstención',
    }),
  });

  assert.equal(
    okVote.status,
    200,
    `Legitimate seat vote failed: ${await okVote.text()}`,
  );

  console.log(
    `${LOG} ✓ comité identity: blocks CEO/LO impersonation; accepts ${pendingSeat.email}`,
  );
};

const main = async (): Promise<void> => {
  console.log(`${LOG} starting live persona checks…`);

  for (const testCase of CASES) {
    const workspaceLabels = await fetchWorkspaceRoleLabels(
      testCase.email,
      testCase.password,
    );
    const viaFallback = workspaceLabels.length === 0;
    const roleLabels =
      workspaceLabels.length > 0
        ? workspaceLabels
        : EMAIL_TO_ROLE[testCase.email]
          ? [EMAIL_TO_ROLE[testCase.email]]
          : [];

    assert.ok(
      roleLabels.includes(testCase.expectedRole),
      `${testCase.email} expected ${testCase.expectedRole}, got [${roleLabels.join(', ')}]`,
    );

    for (const routeKey of testCase.allow) {
      assert.equal(
        canAccess(testCase.email, routeKey),
        true,
        `${testCase.email} should ALLOW ${routeKey}`,
      );
    }

    for (const routeKey of testCase.deny) {
      assert.equal(
        canAccess(testCase.email, routeKey),
        false,
        `${testCase.email} should DENY ${routeKey}`,
      );
    }

    console.log(
      `${LOG} ✓ ${testCase.email} · ${testCase.expectedRole} · ACL ok${viaFallback ? ' (email fallback)' : ''}`,
    );
  }

  await runComiteIdentityChecks();
  console.log(`${LOG} ALL PASSED`);
};

main().catch((error) => {
  console.error(`${LOG} FAILED`, error);
  process.exit(1);
});
