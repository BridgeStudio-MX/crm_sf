import {
  ensureFieldsOnObject,
  refreshObjectRegistry,
} from './metadata-setup-helpers';
import { metadataClient } from './metadata-client';
import {
  type PipelineDefinition,
  PARKS_PIPELINE_DEFINITIONS,
} from './parks-pipeline-definitions';
import { type SelectOptionDefinition } from './parks-object-definitions';

const LOG_PREFIX = '[setup:pipelines]';

const findFieldOnObject = (
  objectNameSingular: string,
  fieldName: string,
  registry: Awaited<ReturnType<typeof refreshObjectRegistry>>,
) => {
  const objectRecord = registry.get(objectNameSingular);
  const fieldRecord = objectRecord?.fieldsList?.find(
    (field) => field.name === fieldName,
  );

  if (!objectRecord || !fieldRecord) {
    return null;
  }

  return { objectRecord, fieldRecord };
};

const buildOptionsPayload = (options: SelectOptionDefinition[]) =>
  options.map((option, index) => ({
    ...option,
    position: index,
  }));

const ensureGroupByField = async (
  pipelineDefinition: PipelineDefinition,
  registry: Awaited<ReturnType<typeof refreshObjectRegistry>>,
): Promise<string> => {
  const existingField = findFieldOnObject(
    pipelineDefinition.objectNameSingular,
    pipelineDefinition.groupByFieldName,
    registry,
  );

  if (existingField && !pipelineDefinition.createFieldIfMissing) {
    if (
      pipelineDefinition.updateFieldOptions &&
      pipelineDefinition.options
    ) {
      console.log(
        `${LOG_PREFIX}   ↻ options ${pipelineDefinition.objectNameSingular}.${pipelineDefinition.groupByFieldName}`,
      );

      await metadataClient.updateField(existingField.fieldRecord.id, {
        label: pipelineDefinition.fieldLabel,
        options: buildOptionsPayload(pipelineDefinition.options),
        ...(pipelineDefinition.fieldDefaultValue
          ? { defaultValue: `'${pipelineDefinition.fieldDefaultValue}'` }
          : {}),
      });
    }

    return existingField.fieldRecord.id;
  }

  if (!existingField && pipelineDefinition.createFieldIfMissing) {
    const objectRecord = registry.get(pipelineDefinition.objectNameSingular);

    if (!objectRecord) {
      throw new Error(
        `Object not found: ${pipelineDefinition.objectNameSingular}`,
      );
    }

    if (!pipelineDefinition.options || !pipelineDefinition.fieldLabel) {
      throw new Error(
        `Pipeline ${pipelineDefinition.name} requires options and fieldLabel to create field`,
      );
    }

    console.log(
      `${LOG_PREFIX}   + field ${pipelineDefinition.objectNameSingular}.${pipelineDefinition.groupByFieldName}`,
    );

    const updatedObject = await ensureFieldsOnObject(
      objectRecord,
      [
        {
          name: pipelineDefinition.groupByFieldName,
          label: pipelineDefinition.fieldLabel,
          type: 'SELECT',
          options: pipelineDefinition.options,
        },
      ],
      LOG_PREFIX,
    );

    registry.set(updatedObject.nameSingular, updatedObject);

    const createdField = updatedObject.fieldsList?.find(
      (field) => field.name === pipelineDefinition.groupByFieldName,
    );

    if (!createdField) {
      throw new Error(
        `Failed to create field ${pipelineDefinition.groupByFieldName}`,
      );
    }

    if (pipelineDefinition.fieldDefaultValue) {
      await metadataClient.updateField(createdField.id, {
        defaultValue: `'${pipelineDefinition.fieldDefaultValue}'`,
      });
    }

    return createdField.id;
  }

  if (!existingField) {
    throw new Error(
      `Field ${pipelineDefinition.objectNameSingular}.${pipelineDefinition.groupByFieldName} not found`,
    );
  }

  return existingField.fieldRecord.id;
};

const ensureKanbanView = async (
  pipelineDefinition: PipelineDefinition,
  objectMetadataId: string,
  groupByFieldMetadataId: string,
): Promise<void> => {
  const existingViews = await metadataClient.getViews(objectMetadataId);
  const existingView = existingViews.find(
    (view) => view.name === pipelineDefinition.name,
  );

  if (existingView) {
    console.log(`${LOG_PREFIX}   ✓ view exists: ${pipelineDefinition.name}`);
    return;
  }

  console.log(`${LOG_PREFIX}   + view ${pipelineDefinition.name}`);

  await metadataClient.createView({
    name: pipelineDefinition.name,
    objectMetadataId,
    type: 'KANBAN',
    icon: pipelineDefinition.viewIcon,
    position: pipelineDefinition.viewPosition,
    mainGroupByFieldMetadataId: groupByFieldMetadataId,
    isCompact: false,
    shouldHideEmptyGroups: false,
  });
};

export const setupParksPipelines = async (): Promise<void> => {
  console.log(`${LOG_PREFIX} Parks Industrial — 4 pipelines`);

  const registry = await refreshObjectRegistry();

  for (const pipelineDefinition of PARKS_PIPELINE_DEFINITIONS) {
    console.log(`${LOG_PREFIX} Pipeline: ${pipelineDefinition.name}`);

    const objectRecord = registry.get(pipelineDefinition.objectNameSingular);

    if (!objectRecord) {
      throw new Error(
        `Object "${pipelineDefinition.objectNameSingular}" not found. Run npm run setup:objects first.`,
      );
    }

    const groupByFieldMetadataId = await ensureGroupByField(
      pipelineDefinition,
      registry,
    );

    await ensureKanbanView(
      pipelineDefinition,
      objectRecord.id,
      groupByFieldMetadataId,
    );
  }

  console.log(`${LOG_PREFIX} Done — ${PARKS_PIPELINE_DEFINITIONS.length} pipelines`);
};
