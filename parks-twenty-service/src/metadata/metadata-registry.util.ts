import {
  type MetadataObjectRecord,
  metadataClient,
} from './metadata-client';

export type MetadataRegistry = {
  objectRegistry: Map<string, MetadataObjectRecord>;
  fieldRegistry: Map<string, Map<string, string>>;
};

export const buildMetadataRegistry = async (): Promise<MetadataRegistry> => {
  const objects = await metadataClient.listObjects();
  const objectRegistry = new Map<string, MetadataObjectRecord>();
  const fieldRegistry = new Map<string, Map<string, string>>();

  for (const objectRecord of objects) {
    objectRegistry.set(objectRecord.nameSingular, objectRecord);

    const fieldMap = new Map<string, string>();

    for (const fieldRecord of objectRecord.fieldsList ?? []) {
      fieldMap.set(fieldRecord.name, fieldRecord.id);
    }

    fieldRegistry.set(objectRecord.nameSingular, fieldMap);
  }

  return { objectRegistry, fieldRegistry };
};

export const resolveObjectId = (
  registry: MetadataRegistry,
  objectNameSingular: string,
): string => {
  const objectRecord = registry.objectRegistry.get(objectNameSingular);

  if (!objectRecord?.id) {
    throw new Error(`Object metadata not found: ${objectNameSingular}`);
  }

  return objectRecord.id;
};

export const resolveFieldId = (
  registry: MetadataRegistry,
  objectNameSingular: string,
  fieldName: string,
): string => {
  const fieldId = registry.fieldRegistry
    .get(objectNameSingular)
    ?.get(fieldName);

  if (!fieldId) {
    throw new Error(
      `Field metadata not found: ${objectNameSingular}.${fieldName}`,
    );
  }

  return fieldId;
};
