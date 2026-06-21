import {
  type FieldDefinition,
  type RelationDefinition,
} from './parks-object-definitions';
import {
  type MetadataObjectRecord,
  metadataClient,
} from './metadata-client';

export const buildFieldInput = (
  objectMetadataId: string,
  fieldDefinition: FieldDefinition,
): Record<string, unknown> => {
  const fieldInput: Record<string, unknown> = {
    objectMetadataId,
    name: fieldDefinition.name,
    label: fieldDefinition.label,
    type: fieldDefinition.type,
    isLabelSyncedWithName: false,
    isNullable: fieldDefinition.isNullable ?? true,
  };

  if (fieldDefinition.type === 'SELECT' && fieldDefinition.options) {
    fieldInput.options = fieldDefinition.options.map((option, index) => ({
      ...option,
      position: index,
    }));
  }

  return fieldInput;
};

export const refreshObjectRegistry = async (): Promise<
  Map<string, MetadataObjectRecord>
> => {
  const objects = await metadataClient.listObjects();
  const registry = new Map<string, MetadataObjectRecord>();

  for (const objectRecord of objects) {
    registry.set(objectRecord.nameSingular, objectRecord);
  }

  return registry;
};

export const ensureFieldsOnObject = async (
  objectRecord: MetadataObjectRecord,
  fieldDefinitions: FieldDefinition[],
  logPrefix: string,
): Promise<MetadataObjectRecord> => {
  const existingFieldNames = new Set(
    (objectRecord.fieldsList ?? []).map((field) => field.name),
  );

  for (const fieldDefinition of fieldDefinitions) {
    if (existingFieldNames.has(fieldDefinition.name)) {
      continue;
    }

    console.log(
      `${logPrefix}   + field ${objectRecord.nameSingular}.${fieldDefinition.name}`,
    );

    await metadataClient.createField(
      buildFieldInput(objectRecord.id, fieldDefinition),
    );
  }

  const refreshedObjects = await metadataClient.listObjects();
  const refreshedObject = refreshedObjects.find(
    (objectItem) => objectItem.id === objectRecord.id,
  );

  if (!refreshedObject) {
    throw new Error(`Object not found after field creation: ${objectRecord.id}`);
  }

  return refreshedObject;
};

export const ensureRelationsOnObject = async (
  sourceObjectNameSingular: string,
  relationDefinitions: RelationDefinition[],
  registry: Map<string, MetadataObjectRecord>,
  logPrefix: string,
): Promise<void> => {
  const sourceObject = registry.get(sourceObjectNameSingular);

  if (!sourceObject) {
    throw new Error(`Source object not found: ${sourceObjectNameSingular}`);
  }

  const existingFieldNames = new Set(
    (sourceObject.fieldsList ?? []).map((field) => field.name),
  );

  for (const relationDefinition of relationDefinitions) {
    const targetObject = registry.get(
      relationDefinition.targetObjectNameSingular,
    );

    if (!targetObject) {
      throw new Error(
        `Missing target object for relation ${sourceObjectNameSingular}.${relationDefinition.name}`,
      );
    }

    if (existingFieldNames.has(relationDefinition.name)) {
      continue;
    }

    console.log(
      `${logPrefix}   + relation ${sourceObjectNameSingular}.${relationDefinition.name} → ${relationDefinition.targetObjectNameSingular}`,
    );

    await metadataClient.createField({
      objectMetadataId: sourceObject.id,
      name: relationDefinition.name,
      label: relationDefinition.label,
      type: 'RELATION',
      isLabelSyncedWithName: false,
      isNullable: relationDefinition.isNullable ?? true,
      relationCreationPayload: {
        targetObjectMetadataId: targetObject.id,
        targetFieldLabel: relationDefinition.targetFieldLabel,
        targetFieldIcon: relationDefinition.targetFieldIcon,
        type: 'MANY_TO_ONE',
      },
    });
  }
};
