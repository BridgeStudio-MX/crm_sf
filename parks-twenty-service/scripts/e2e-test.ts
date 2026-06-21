import { e2eVerificationService } from '../src/e2e/e2e-verification.service';

const main = async (): Promise<void> => {
  const force = process.env.FORCE_E2E_RERUN === 'true';

  console.log('[e2e:test] Parks Industrial — verificación end-to-end (Paso 13)');
  console.log('[e2e:test] Blueprint: comercial→legal, checklist→PDF, firmas→cierre');

  const results = await e2eVerificationService.run({ force });

  const failedSteps = results.filter((result) => !result.passed);
  const passedCount = results.length - failedSteps.length;

  console.log('');
  console.log(
    `[e2e:test] Resultado: ${passedCount}/${results.length} pasos OK`,
  );

  if (failedSteps.length > 0) {
    console.error('[e2e:test] Pasos fallidos:');
    for (const failedStep of failedSteps) {
      console.error(`  - ${failedStep.step}: ${failedStep.detail}`);
    }
    process.exit(1);
  }

  console.log('[e2e:test] ✅ Verificación E2E completa');
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[e2e:test] Failed:', message);
  process.exit(1);
});
