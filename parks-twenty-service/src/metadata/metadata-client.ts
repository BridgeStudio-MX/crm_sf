import { GraphQLClient } from 'graphql-request';

import { twentyConfig } from '../config/twenty.config';
import {
  getTwentyRateLimitRetryWaitMs,
  isTwentyRateLimitError,
  resetTwentyRequestThrottle,
  waitForTwentyRequestSlot,
} from '../utils/twenty-request-throttle.util';
import { resolveTwentyAuthToken } from './resolve-twenty-auth-token';

const MAX_RETRY_ATTEMPTS = 8;
const BASE_RETRY_DELAY_MS = 500;

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    isTwentyRateLimitError(error) ||
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('503') ||
    message.includes('502')
  );
};

const getRetryDelayMs = (error: unknown, attempt: number): number => {
  if (isTwentyRateLimitError(error)) {
    return getTwentyRateLimitRetryWaitMs();
  }

  return BASE_RETRY_DELAY_MS * 2 ** (attempt - 1);
};

const requestWithRetry = async <TData>(
  executeRequest: () => Promise<TData>,
): Promise<TData> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    await waitForTwentyRequestSlot();

    try {
      return await executeRequest();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === MAX_RETRY_ATTEMPTS) {
        throw error;
      }

      const delayMs = getRetryDelayMs(error, attempt);
      console.warn(
        `[metadata.client] Retry ${attempt}/${MAX_RETRY_ATTEMPTS} in ${delayMs}ms`,
      );
      await sleep(delayMs);
      resetTwentyRequestThrottle();
    }
  }

  throw lastError;
};

export type MetadataFieldRecord = {
  id: string;
  name: string;
  type: string;
};

export type MetadataObjectRecord = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  labelIdentifierFieldMetadataId?: string | null;
  fieldsList?: MetadataFieldRecord[];
};

export class MetadataClient {
  private client: GraphQLClient | null = null;

  private async getClient(): Promise<GraphQLClient> {
    if (this.client) {
      return this.client;
    }

    const token = await resolveTwentyAuthToken();

    this.client = new GraphQLClient(`${twentyConfig.apiUrl}/metadata`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return this.client;
  }

  async request<TData>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<TData> {
    const client = await this.getClient();

    return requestWithRetry(() => client.request<TData>(document, variables));
  }

  async listObjects(): Promise<MetadataObjectRecord[]> {
    const response = await this.request<{
      objects: { edges: { node: MetadataObjectRecord }[] };
    }>(
      `
        query ListObjectsMetadata($filter: ObjectFilter!, $paging: CursorPaging!) {
          objects(filter: $filter, paging: $paging) {
            edges {
              node {
                id
                nameSingular
                namePlural
                labelSingular
                labelPlural
                labelIdentifierFieldMetadataId
                fieldsList {
                  id
                  name
                  type
                }
              }
            }
          }
        }
      `,
      {
        filter: {},
        paging: { first: 250 },
      },
    );

    return response.objects.edges.map((edge) => edge.node);
  }

  async createObject(input: {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
    icon: string;
    skipNameField?: boolean;
    description?: string;
  }): Promise<MetadataObjectRecord> {
    const response = await this.request<{
      createOneObject: MetadataObjectRecord;
    }>(
      `
        mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
          createOneObject(input: $input) {
            id
            nameSingular
            namePlural
            labelSingular
            labelPlural
            labelIdentifierFieldMetadataId
            fieldsList {
              id
              name
              type
            }
          }
        }
      `,
      {
        input: {
          object: {
            ...input,
            isLabelSyncedWithName: false,
          },
        },
      },
    );

    return response.createOneObject;
  }

  async createField(
    fieldInput: Record<string, unknown>,
  ): Promise<MetadataFieldRecord> {
    const response = await this.request<{
      createOneField: MetadataFieldRecord;
    }>(
      `
        mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
          createOneField(input: $input) {
            id
            name
            type
          }
        }
      `,
      {
        input: { field: fieldInput },
      },
    );

    return response.createOneField;
  }

  async updateObjectLabelIdentifier(
    objectMetadataId: string,
    labelIdentifierFieldMetadataId: string,
  ): Promise<void> {
    await this.request(
      `
        mutation UpdateOneObjectMetadataItem(
          $idToUpdate: UUID!
          $updatePayload: UpdateObjectPayload!
        ) {
          updateOneObject(
            input: { id: $idToUpdate, update: $updatePayload }
          ) {
            id
            labelIdentifierFieldMetadataId
          }
        }
      `,
      {
        idToUpdate: objectMetadataId,
        updatePayload: { labelIdentifierFieldMetadataId },
      },
    );
  }

  async updateField(
    fieldMetadataId: string,
    updatePayload: Record<string, unknown>,
  ): Promise<void> {
    await this.request(
      `
        mutation UpdateOneFieldMetadataItem(
          $idToUpdate: UUID!
          $updatePayload: UpdateFieldInput!
        ) {
          updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {
            id
            name
            options
          }
        }
      `,
      {
        idToUpdate: fieldMetadataId,
        updatePayload,
      },
    );
  }

  async getViews(objectMetadataId: string): Promise<
    {
      id: string;
      name: string;
      type: string;
      mainGroupByFieldMetadataId?: string | null;
    }[]
  > {
    const response = await this.request<{
      getViews: {
        id: string;
        name: string;
        type: string;
        mainGroupByFieldMetadataId?: string | null;
      }[];
    }>(
      `
        query GetViews($objectMetadataId: String) {
          getViews(objectMetadataId: $objectMetadataId) {
            id
            name
            type
            mainGroupByFieldMetadataId
          }
        }
      `,
      { objectMetadataId },
    );

    return response.getViews;
  }

  async createView(input: Record<string, unknown>): Promise<{ id: string; name: string }> {
    const response = await this.request<{
      createView: { id: string; name: string };
    }>(
      `
        mutation CreateView($input: CreateViewInput!) {
          createView(input: $input) {
            id
            name
            type
          }
        }
      `,
      { input },
    );

    return response.createView;
  }

  async listWebhooks(): Promise<WebhookRecord[]> {
    const response = await this.request<{ webhooks: WebhookRecord[] }>(
      `
        query ListWebhooks {
          webhooks {
            id
            targetUrl
            operations
            description
            secret
          }
        }
      `,
    );

    return response.webhooks;
  }

  async createWebhook(input: {
    targetUrl: string;
    operations: string[];
    description?: string;
    secret?: string;
  }): Promise<WebhookRecord> {
    const response = await this.request<{ createWebhook: WebhookRecord }>(
      `
        mutation CreateWebhook($input: CreateWebhookInput!) {
          createWebhook(input: $input) {
            id
            targetUrl
            operations
            description
            secret
          }
        }
      `,
      { input },
    );

    return response.createWebhook;
  }

  async updateWebhook(
    webhookId: string,
    update: {
      targetUrl?: string;
      operations?: string[];
      description?: string;
      secret?: string;
    },
  ): Promise<WebhookRecord> {
    const response = await this.request<{ updateWebhook: WebhookRecord }>(
      `
        mutation UpdateWebhook($input: UpdateWebhookInput!) {
          updateWebhook(input: $input) {
            id
            targetUrl
            operations
            description
            secret
          }
        }
      `,
      {
        input: {
          id: webhookId,
          update,
        },
      },
    );

    return response.updateWebhook;
  }

  async getRoles(): Promise<RoleRecord[]> {
    const response = await this.request<{ getRoles: RoleRecord[] }>(
      `
        query GetRoles {
          getRoles {
            id
            label
            description
            canReadAllObjectRecords
            canUpdateAllObjectRecords
          }
        }
      `,
    );

    return response.getRoles;
  }

  async createRole(input: {
    label: string;
    description?: string;
    icon?: string;
    canReadAllObjectRecords?: boolean;
    canUpdateAllObjectRecords?: boolean;
    canSoftDeleteAllObjectRecords?: boolean;
    canDestroyAllObjectRecords?: boolean;
    canUpdateAllSettings?: boolean;
    canAccessAllTools?: boolean;
  }): Promise<RoleRecord> {
    const response = await this.request<{ createOneRole: RoleRecord }>(
      `
        mutation CreateOneRole($createRoleInput: CreateRoleInput!) {
          createOneRole(createRoleInput: $createRoleInput) {
            id
            label
          }
        }
      `,
      { createRoleInput: input },
    );

    return response.createOneRole;
  }

  async upsertObjectPermissions(input: {
    roleId: string;
    objectPermissions: {
      objectMetadataId: string;
      canReadObjectRecords: boolean;
      canUpdateObjectRecords: boolean;
      canSoftDeleteObjectRecords?: boolean;
      canDestroyObjectRecords?: boolean;
    }[];
  }): Promise<void> {
    await this.request(
      `
        mutation UpsertObjectPermissions(
          $upsertObjectPermissionsInput: UpsertObjectPermissionsInput!
        ) {
          upsertObjectPermissions(
            upsertObjectPermissionsInput: $upsertObjectPermissionsInput
          ) {
            objectMetadataId
          }
        }
      `,
      { upsertObjectPermissionsInput: input },
    );
  }

  async createPageLayout(input: {
    name: string;
    type: 'DASHBOARD' | 'RECORD_PAGE';
    objectMetadataId?: string;
  }): Promise<{ id: string; name: string }> {
    const response = await this.request<{
      createPageLayout: { id: string; name: string };
    }>(
      `
        mutation CreatePageLayout($input: CreatePageLayoutInput!) {
          createPageLayout(input: $input) {
            id
            name
          }
        }
      `,
      { input },
    );

    return response.createPageLayout;
  }

  async createPageLayoutTab(input: {
    title: string;
    pageLayoutId: string;
    position?: number;
  }): Promise<{ id: string; title: string }> {
    const response = await this.request<{
      createPageLayoutTab: { id: string; title: string };
    }>(
      `
        mutation CreatePageLayoutTab($input: CreatePageLayoutTabInput!) {
          createPageLayoutTab(input: $input) {
            id
            title
          }
        }
      `,
      { input },
    );

    return response.createPageLayoutTab;
  }

  async createPageLayoutWidget(
    input: Record<string, unknown>,
  ): Promise<{ id: string; title: string }> {
    const response = await this.request<{
      createPageLayoutWidget: { id: string; title: string };
    }>(
      `
        mutation CreatePageLayoutWidget($input: CreatePageLayoutWidgetInput!) {
          createPageLayoutWidget(input: $input) {
            id
            title
          }
        }
      `,
      { input },
    );

    return response.createPageLayoutWidget;
  }
}

export type WebhookRecord = {
  id: string;
  targetUrl: string;
  operations: string[];
  description?: string | null;
  secret?: string | null;
};

export type RoleRecord = {
  id: string;
  label: string;
  description?: string | null;
  canReadAllObjectRecords?: boolean;
  canUpdateAllObjectRecords?: boolean;
};

export const metadataClient = new MetadataClient();
