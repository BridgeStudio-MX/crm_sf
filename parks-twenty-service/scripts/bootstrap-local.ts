import { spawn } from 'node:child_process';
import path from 'node:path';

import dotenv from 'dotenv';

dotenv.config();

// Applies the canonical Parks demo logins (@prk.com.mx) to the local Twenty DB.
// Source of truth: src/metadata/parks-demo-users.constants.ts

const STEPS = ['setup:demo-users', 'setup:assign-roles'] as const;

const runStep = (stepName: (typeof STEPS)[number]): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', stepName], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        TWENTY_API_URL: process.env.TWENTY_API_URL ?? 'http://localhost:3000',
        TWENTY_WORKSPACE_ORIGIN:
          process.env.TWENTY_WORKSPACE_ORIGIN ?? 'http://localhost:3001',
        TWENTY_DEV_EMAIL: process.env.TWENTY_DEV_EMAIL ?? 'tim@apple.dev',
        TWENTY_DEV_PASSWORD:
          process.env.TWENTY_DEV_PASSWORD ?? 'tim@apple.dev',
        TWENTY_BOOTSTRAP_EMAIL:
          process.env.TWENTY_BOOTSTRAP_EMAIL ?? 'tim@apple.dev',
        TWENTY_BOOTSTRAP_PASSWORD:
          process.env.TWENTY_BOOTSTRAP_PASSWORD ?? 'tim@apple.dev',
        PG_DATABASE_URL:
          process.env.PG_DATABASE_URL ??
          'postgres://postgres:postgres@localhost:5432/default',
      },
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`[bootstrap:local] ${stepName} exited with code ${code}`));
    });
  });

const main = async (): Promise<void> => {
  console.log(
    '[bootstrap:local] Syncing demo users from parks-demo-users.constants.ts',
  );
  console.log('[bootstrap:local] Target: http://localhost:3000');

  for (const stepName of STEPS) {
    console.log(`\n[bootstrap:local] === ${stepName} ===`);
    await runStep(stepName);
  }

  console.log('\n[bootstrap:local] Done.');
  console.log(
    '[bootstrap:local] Logins: docs/parks-industrial/USUARIOS_DEMO.md',
  );
  console.log('[bootstrap:local] Password for all: parksindustrial2026!');
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[bootstrap:local] Failed:', message);
  process.exit(1);
});
