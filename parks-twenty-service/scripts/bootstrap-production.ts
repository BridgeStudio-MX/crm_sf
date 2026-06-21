import { spawn } from 'node:child_process';
import path from 'node:path';

import dotenv from 'dotenv';

dotenv.config();

const STEPS = [
  'setup:objects',
  'setup:opportunity',
  'setup:pipelines',
  'setup:roles',
  'setup:dashboards',
  'setup:webhooks',
  'seed:demo',
] as const;

const runStep = (stepName: (typeof STEPS)[number]): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', stepName], {
      cwd: path.join(__dirname, '..'),
      env: process.env,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`[bootstrap] ${stepName} exited with code ${code}`));
    });
  });

const main = async (): Promise<void> => {
  const apiUrl = process.env.TWENTY_API_URL ?? 'http://localhost:3000';
  const hasApiKey = Boolean(process.env.TWENTY_API_KEY);

  console.log(`[bootstrap] Target: ${apiUrl}`);
  console.log(
    `[bootstrap] Auth: ${hasApiKey ? 'TWENTY_API_KEY' : 'dev login (TWENTY_DEV_EMAIL)'}`,
  );

  if (!hasApiKey && apiUrl.includes('bridgehub.mx')) {
    console.error(
      '[bootstrap] TWENTY_API_KEY is missing — required for production.',
    );
    console.error(
      '[bootstrap] Add the secret in GitHub (Settings → Secrets → Actions) and re-run the workflow.',
    );
    process.exit(1);
  }

  if (process.env.RESET_DEMO_SEED !== 'false') {
    process.env.RESET_DEMO_SEED = 'true';
  }

  for (const stepName of STEPS) {
    console.log(`\n[bootstrap] === ${stepName} ===`);
    await runStep(stepName);
  }

  console.log('\n[bootstrap] Done — metadata + DEMO seed applied.');
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[bootstrap] Failed:', message);
  process.exit(1);
});
