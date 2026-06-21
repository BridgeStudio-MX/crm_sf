import {
  type FieldDefinition,
  PARKS_OBJECT_DEFINITIONS,
  PARKS_RELATION_DEFINITIONS,
  type ParksObjectDefinition,
} from './parks-object-definitions';
import {
  type MetadataObjectRecord,
  metadataClient,
} from './metadata-client';

const buildFieldInput = (
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

const refreshObjectRegistry = async (): Promise<
  Map<string, MetadataObjectRecord>
> => {
  const objects = await metadataClient.listObjects();
  const registry = new Map<string, MetadataObjectRecord>();

  for (const objectRecord of objects) {
    registry.set(objectRecord.nameSingular, objectRecord);
  }

  return registry;
};

const ensureObject = async (
  objectDefinition: ParksObjectDefinition,
  registry: Map<string, MetadataObjectRecord>,
): Promise<MetadataObjectRecord> => {
  const existingObject = registry.get(objectDefinition.nameSingular);

  if (existingObject) {
    console.log(`[setup:objects] Object exists: ${objectDefinition.nameSingular}`);
    return existingObject;
  }

  console.log(`[setup:objects] Creating object: ${objectDefinition.nameSingular}`);

  const createdObject = await metadataClient.createObject({
    nameSingular: objectDefinition.nameSingular,
    namePlural: objectDefinition.namePlural,
    labelSingular: objectDefinition.labelSingular,
    labelPlural: objectDefinition.labelPlural,
    icon: objectDefinition.icon,
    skipNameField: objectDefinition.skipNameField ?? false,
    description: `Parks Industrial — ${objectDefinition.labelSingular}`,
  });

  registry.set(createdObject.nameSingular, createdObject);
  return createdObject;
};

const ensureFieldsForObject = async (
  objectDefinition: ParksObjectDefinition,
  objectRecord: MetadataObjectRecord,
): Promise<MetadataObjectRecord> => {
  const existingFieldNames = new Set(
    (objectRecord.fieldsList ?? []).map((field) => field.name),
  );

  for (const fieldDefinition of objectDefinition.fields) {
    if (existingFieldNames.has(fieldDefinition.name)) {
      continue;
    }

    console.log(
      `[setup:objects]   + field ${objectDefinition.nameSingular}.${fieldDefinition.name}`,
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

const ensureLabelIdentifier = async (
  objectDefinition: ParksObjectDefinition,
  objectRecord: MetadataObjectRecord,
): Promise<void> => {
  if (!objectDefinition.labelIdentifierFieldName) {
    return;
  }

  const labelField = objectRecord.fieldsList?.find(
    (field) => field.name === objectDefinition.labelIdentifierFieldName,
  );

  if (!labelField) {
    throw new Error(
      `Label identifier field not found: ${objectDefinition.nameSingular}.${objectDefinition.labelIdentifierFieldName}`,
    );
  }

  if (objectRecord.labelIdentifierFieldMetadataId === labelField.id) {
    return;
  }

  console.log(
    `[setup:objects]   → label identifier ${objectDefinition.nameSingular}.${labelField.name}`,
  );

  await metadataClient.updateObjectLabelIdentifier(
    objectRecord.id,
    labelField.id,
  );
};

const ensureRelations = async (
  registry: Map<string, MetadataObjectRecord>,
): Promise<void> => {
  for (const relationDefinition of PARKS_RELATION_DEFINITIONS) {
    const sourceObject = registry.get(relationDefinition.objectNameSingular);
    const targetObject = registry.get(
      relationDefinition.targetObjectNameSingular,
    );

    if (!sourceObject || !targetObject) {
      throw new Error(
        `Missing object for relation ${relationDefinition.objectNameSingular}.${relationDefinition.name}`,
      );
    }

    const existingFieldNames = new Set(
      (sourceObject.fieldsList ?? []).map((field) => field.name),
    );

    if (existingFieldNames.has(relationDefinition.name)) {
      continue;
    }

    console.log(
      `[setup:objects]   + relation ${relationDefinition.objectNameSingular}.${relationDefinition.name} → ${relationDefinition.targetObjectNameSingular}`,
    );

    await metadataClient.createField({
      objectMetadataId: sourceObject.id,
      name: relationDefinition.name,
      label: relationDefinition.label,
      type: 'RELATION',
      isLabelSyncedWithName: false,
      isNullable: relationDefinition.isNullable ?? false,
      relationCreationPayload: {
        targetObjectMetadataId: targetObject.id,
        targetFieldLabel: relationDefinition.targetFieldLabel,
        targetFieldIcon: relationDefinition.targetFieldIcon,
        type: 'MANY_TO_ONE',
      },
    });
  }
};

export const setupParksObjects = async (): Promise<void> => {
  console.log('[setup:objects] Parks Industrial — Metadata API setup');
  console.log(
    '[setup:objects] Nota: nombres API en camelCase (Twenty no admite snake_case)',
  );

  let registry = await refreshObjectRegistry();

  for (const objectDefinition of PARKS_OBJECT_DEFINITIONS) {
    let objectRecord = await ensureObject(objectDefinition, registry);
    objectRecord = await ensureFieldsForObject(objectDefinition, objectRecord);
    registry.set(objectRecord.nameSingular, objectRecord);
    await ensureLabelIdentifier(objectDefinition, objectRecord);
  }

  registry = await refreshObjectRegistry();
  await ensureRelations(registry);

  console.log('[setup:objects] Done — 12 custom objects configured');
};
