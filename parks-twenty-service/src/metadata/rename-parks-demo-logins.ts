import { createRequire } from 'node:module';
import { join } from 'node:path';

import {
  PARKS_DEMO_USER_PASSWORD,
  PARKS_DEMO_USERS,
  type ParksDemoUser,
} from './parks-demo-users.constants';

const LOG_PREFIX = '[setup:demo-users]';
const WORKSPACE_SCHEMA_PATTERN = /^workspace_[a-z0-9]+$/;

type PgClient = {
  connect: () => Promise<void>;
  end: () => Promise<void>;
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>> }>;
};

type PgClientConstructor = new (config: { connectionString: string }) => PgClient;

type BcryptModule = {
  hash: (value: string, saltRounds: number) => Promise<string>;
};

const requireFromRepo = createRequire(join(__dirname, '../../../package.json'));

const resolveDatabaseUrl = (): string | null =>
  process.env.PG_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5432/default';

const loadPgClient = (): PgClientConstructor =>
  requireFromRepo('pg').Client as PgClientConstructor;

const loadBcrypt = (): BcryptModule => requireFromRepo('bcrypt') as BcryptModule;

const fetchExistingEmails = async (client: PgClient): Promise<Set<string>> => {
  const result = await client.query(
    `SELECT email FROM core."user" WHERE "deletedAt" IS NULL`,
  );

  return new Set(
    result.rows.map((row) => String(row.email).trim().toLowerCase()),
  );
};

const fetchWorkspaceSchemas = async (client: PgClient): Promise<string[]> => {
  const result = await client.query(
    `SELECT nspname FROM pg_namespace WHERE nspname LIKE 'workspace_%'`,
  );

  return result.rows
    .map((row) => String(row.nspname))
    .filter((schemaName) => WORKSPACE_SCHEMA_PATTERN.test(schemaName));
};

const resolveSourceEmail = ({
  demoUser,
  existingEmails,
}: {
  demoUser: ParksDemoUser;
  existingEmails: Set<string>;
}): string | null => {
  const candidates = [
    demoUser.email,
    ...(demoUser.legacyEmails ?? []),
  ].map((email) => email.toLowerCase());

  return candidates.find((email) => existingEmails.has(email)) ?? null;
};

const updateWorkspaceMembers = async ({
  client,
  schemaNames,
  sourceEmail,
  demoUser,
}: {
  client: PgClient;
  schemaNames: string[];
  sourceEmail: string;
  demoUser: ParksDemoUser;
}): Promise<void> => {
  for (const schemaName of schemaNames) {
    await client.query(
      `UPDATE "${schemaName}"."workspaceMember"
       SET "userEmail" = $1,
           "nameFirstName" = $2,
           "nameLastName" = $3,
           "updatedAt" = now()
       WHERE lower("userEmail") = $4
         AND "deletedAt" IS NULL`,
      [
        demoUser.email,
        demoUser.firstName,
        demoUser.lastName,
        sourceEmail,
      ],
    );
  }
};

export const renameParksDemoLogins = async (): Promise<number> => {
  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    console.warn(`${LOG_PREFIX}   ⚠ PG_DATABASE_URL missing — skip login rename`);
    return 0;
  }

  const Client = loadPgClient();
  const bcrypt = loadBcrypt();
  const client = new Client({ connectionString: databaseUrl });

  await client.connect();

  try {
    const passwordHash = await bcrypt.hash(PARKS_DEMO_USER_PASSWORD, 10);
    const existingEmails = await fetchExistingEmails(client);
    const schemaNames = await fetchWorkspaceSchemas(client);
    let updatedCount = 0;

    for (const demoUser of PARKS_DEMO_USERS) {
      const sourceEmail = resolveSourceEmail({ demoUser, existingEmails });

      if (!sourceEmail) {
        continue;
      }

      const targetEmail = demoUser.email.toLowerCase();

      if (sourceEmail !== targetEmail && existingEmails.has(targetEmail)) {
        console.warn(
          `${LOG_PREFIX}   ⚠ skip rename ${sourceEmail} → ${targetEmail} (target already exists)`,
        );
        continue;
      }

      await client.query(
        `UPDATE core."user"
         SET email = $1,
             "firstName" = $2,
             "lastName" = $3,
             "passwordHash" = $4,
             "updatedAt" = now()
         WHERE lower(email) = $5
           AND "deletedAt" IS NULL`,
        [
          demoUser.email,
          demoUser.firstName,
          demoUser.lastName,
          passwordHash,
          sourceEmail,
        ],
      );

      await updateWorkspaceMembers({
        client,
        schemaNames,
        sourceEmail,
        demoUser,
      });

      existingEmails.delete(sourceEmail);
      existingEmails.add(targetEmail);
      updatedCount += 1;

      if (sourceEmail === targetEmail) {
        console.log(`${LOG_PREFIX}   ✓ refreshed ${demoUser.email}`);
      } else {
        console.log(
          `${LOG_PREFIX}   ✓ renamed ${sourceEmail} → ${demoUser.email}`,
        );
      }
    }

    return updatedCount;
  } finally {
    await client.end();
  }
};
