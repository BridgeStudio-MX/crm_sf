import { metadataClient } from './metadata-client';
import {
  buildMetadataRegistry,
  resolveObjectId,
} from './metadata-registry.util';
import {
  PARKS_ROLE_DEFINITIONS,
  PARKS_ROLE_LABEL_PREFIX,
  type ParksRoleDefinition,
} from './parks-role-definitions';

const LOG_PREFIX = '[setup:roles]';

const findExistingRole = (
  existingRoles: { label: string }[],
  roleDefinition: ParksRoleDefinition,
) =>
  existingRoles.find((role) => role.label === roleDefinition.label);

const buildObjectPermissionsPayload = (
  roleDefinition: ParksRoleDefinition,
  objectRegistry: Awaited<
    ReturnType<typeof buildMetadataRegistry>
  >['objectRegistry'],
) => {
  if (!roleDefinition.objectPermissionsByObjectName) {
    return [];
  }

  return Object.entries(roleDefinition.objectPermissionsByObjectName)
    .map(([objectNameSingular, permission]) => {
      const objectRecord = objectRegistry.get(objectNameSingular);

      if (!objectRecord?.id) {
        console.warn(
          `${LOG_PREFIX}   ⚠ object not found for permissions: ${objectNameSingular}`,
        );
        return null;
      }

      return {
        objectMetadataId: objectRecord.id,
        canReadObjectRecords: permission.canReadObjectRecords,
        canUpdateObjectRecords: permission.canUpdateObjectRecords,
        canSoftDeleteObjectRecords:
          permission.canSoftDeleteObjectRecords ?? false,
        canDestroyObjectRecords: permission.canDestroyObjectRecords ?? false,
      };
    })
    .filter(
      (
        permission,
      ): permission is {
        objectMetadataId: string;
        canReadObjectRecords: boolean;
        canUpdateObjectRecords: boolean;
        canSoftDeleteObjectRecords: boolean;
        canDestroyObjectRecords: boolean;
      } => permission !== null,
    );
};

export const setupParksRoles = async (): Promise<void> => {
  console.log(`${LOG_PREFIX} Configuring Parks Industrial roles (Sección 6)...`);

  const registry = await buildMetadataRegistry();
  const existingRoles = await metadataClient.getRoles();

  for (const roleDefinition of PARKS_ROLE_DEFINITIONS) {
    const existingRole = findExistingRole(existingRoles, roleDefinition);

    if (existingRole) {
      console.log(`${LOG_PREFIX}   ✓ ${roleDefinition.label} (exists)`);
      continue;
    }

    const createdRole = await metadataClient.createRole({
      label: roleDefinition.label,
      description: roleDefinition.description,
      icon: roleDefinition.icon,
      canReadAllObjectRecords: roleDefinition.canReadAllObjectRecords ?? false,
      canUpdateAllObjectRecords:
        roleDefinition.canUpdateAllObjectRecords ?? false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
    });

    const objectPermissions = buildObjectPermissionsPayload(
      roleDefinition,
      registry.objectRegistry,
    );

    if (objectPermissions.length > 0) {
      await metadataClient.upsertObjectPermissions({
        roleId: createdRole.id,
        objectPermissions,
      });
    }

    console.log(
      `${LOG_PREFIX}   + ${roleDefinition.label} (${objectPermissions.length} object permissions)`,
    );
  }

  // Ensure opportunity object is registered for permission mapping
  resolveObjectId(registry, 'opportunity');

  console.log(
    `${LOG_PREFIX} Done — ${PARKS_ROLE_DEFINITIONS.length} roles (${PARKS_ROLE_LABEL_PREFIX}*)`,
  );
};
