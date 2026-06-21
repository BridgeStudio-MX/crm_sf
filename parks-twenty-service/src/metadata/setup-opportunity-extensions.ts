import {
  ensureFieldsOnObject,
  ensureRelationsOnObject,
  refreshObjectRegistry,
} from './metadata-setup-helpers';
import {
  OPPORTUNITY_FIELD_DEFINITIONS,
  OPPORTUNITY_OBJECT_NAME,
  OPPORTUNITY_RELATION_DEFINITIONS,
} from './parks-opportunity-extensions';

const LOG_PREFIX = '[setup:opportunity]';

export const setupOpportunityExtensions = async (): Promise<void> => {
  console.log(`${LOG_PREFIX} Extender Oportunidad — campos Parks Industrial`);

  const registry = await refreshObjectRegistry();
  const opportunityObject = registry.get(OPPORTUNITY_OBJECT_NAME);

  if (!opportunityObject) {
    throw new Error(
      `Objeto "${OPPORTUNITY_OBJECT_NAME}" no encontrado. ¿Twenty está inicializado?`,
    );
  }

  console.log(`${LOG_PREFIX} Object found: ${opportunityObject.labelSingular}`);

  const requiredTargets = ['nave', 'broker', 'inquilino'];

  for (const targetName of requiredTargets) {
    if (!registry.has(targetName)) {
      throw new Error(
        `Objeto "${targetName}" no encontrado. Ejecuta npm run setup:objects primero.`,
      );
    }
  }

  let updatedOpportunity = await ensureFieldsOnObject(
    opportunityObject,
    OPPORTUNITY_FIELD_DEFINITIONS,
    LOG_PREFIX,
  );

  registry.set(updatedOpportunity.nameSingular, updatedOpportunity);

  await ensureRelationsOnObject(
    OPPORTUNITY_OBJECT_NAME,
    OPPORTUNITY_RELATION_DEFINITIONS,
    registry,
    LOG_PREFIX,
  );

  console.log(
    `${LOG_PREFIX} Done — ${OPPORTUNITY_FIELD_DEFINITIONS.length} campos + ${OPPORTUNITY_RELATION_DEFINITIONS.length} relaciones`,
  );
};
