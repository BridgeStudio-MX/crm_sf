import { folioBackfillService } from '../src/services/folio-backfill.service';

const main = async () => {
  console.log('[backfill-folios] Asignando folio a opportunities sin PI-YYYY-######…');

  const result = await folioBackfillService.backfillMissingOpportunityFolios();

  console.log(
    `[backfill-folios] Actualizadas: ${result.updated} · Ya tenían folio: ${result.skipped}`,
  );

  if (result.folios.length > 0) {
    console.log('[backfill-folios] Folios nuevos:', result.folios.join(', '));
  }
};

main().catch((error) => {
  console.error('[backfill-folios] Failed', error);
  process.exit(1);
});
