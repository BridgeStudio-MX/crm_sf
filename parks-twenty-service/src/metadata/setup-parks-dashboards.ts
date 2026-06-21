import { twentyClient } from '../services/twenty.client';
import { metadataClient } from './metadata-client';
import {
  buildMetadataRegistry,
  resolveFieldId,
  resolveObjectId,
  type MetadataRegistry,
} from './metadata-registry.util';
import {
  PARKS_DASHBOARD_DEFINITIONS,
  type ParksDashboardDefinition,
} from './parks-dashboard-definitions';

const LOG_PREFIX = '[setup:dashboards]';

const findDashboardByTitle = async (
  title: string,
): Promise<{ id: string; pageLayoutId?: string } | null> => {
  try {
    const response = await twentyClient.query<{
      dashboards: {
        edges: { node: { id: string; pageLayoutId?: string } }[];
      };
    }>(
      `
        query FindDashboardByTitle($title: String!) {
          dashboards(filter: { title: { eq: $title } }, first: 1) {
            edges {
              node {
                id
                pageLayoutId
              }
            }
          }
        }
      `,
      { title },
    );

    return response.dashboards.edges[0]?.node ?? null;
  } catch {
    return null;
  }
};

const createDashboardRecord = async (
  title: string,
  pageLayoutId: string,
): Promise<string> => {
  const response = await twentyClient.mutate<{
    createDashboard: { id: string };
  }>(
    `
      mutation CreateDashboard($input: DashboardCreateInput!) {
        createDashboard(data: $input) {
          id
        }
      }
    `,
    {
      input: {
        title,
        pageLayoutId,
        position: 0,
      },
    },
  );

  return response.createDashboard.id;
};

const createViewsForDashboard = async (
  dashboardDefinition: ParksDashboardDefinition,
  registry: MetadataRegistry,
): Promise<Map<string, string>> => {
  const viewIdsByName = new Map<string, string>();

  for (const viewDefinition of dashboardDefinition.viewDefinitions) {
    const objectMetadataId = resolveObjectId(
      registry,
      viewDefinition.objectNameSingular,
    );

    const viewInput: Record<string, unknown> = {
      name: viewDefinition.name,
      objectMetadataId,
      type: viewDefinition.type,
      icon: viewDefinition.icon,
      visibility: 'WORKSPACE',
    };

    if (viewDefinition.mainGroupByFieldName) {
      viewInput.mainGroupByFieldMetadataId = resolveFieldId(
        registry,
        viewDefinition.objectNameSingular,
        viewDefinition.mainGroupByFieldName,
      );
    }

    const createdView = await metadataClient.createView(viewInput);

    viewIdsByName.set(viewDefinition.name, createdView.id);
    console.log(`${LOG_PREFIX}   + view ${viewDefinition.name}`);
  }

  return viewIdsByName;
};

const createWidgetsForDashboard = async (
  dashboardDefinition: ParksDashboardDefinition,
  pageLayoutTabId: string,
  registry: MetadataRegistry,
  viewIdsByName: Map<string, string>,
): Promise<void> => {
  const widgetContext = {
    resolveFieldId: (objectNameSingular: string, fieldName: string) =>
      resolveFieldId(registry, objectNameSingular, fieldName),
    resolveObjectId: (objectNameSingular: string) =>
      resolveObjectId(registry, objectNameSingular),
    viewIdsByName,
  };

  for (const widgetDefinition of dashboardDefinition.widgets) {
    try {
      const configuration = widgetDefinition.buildConfiguration(widgetContext);

      await metadataClient.createPageLayoutWidget({
        title: widgetDefinition.title,
        type: widgetDefinition.type,
        pageLayoutTabId,
        gridPosition: widgetDefinition.gridPosition,
        ...(widgetDefinition.objectNameSingular
          ? {
              objectMetadataId: resolveObjectId(
                registry,
                widgetDefinition.objectNameSingular,
              ),
            }
          : {}),
        configuration,
      });

      console.log(`${LOG_PREFIX}   + widget ${widgetDefinition.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `${LOG_PREFIX}   ⚠ widget skipped (${widgetDefinition.title}): ${message}`,
      );
    }
  }
};

const setupSingleDashboard = async (
  dashboardDefinition: ParksDashboardDefinition,
  registry: MetadataRegistry,
): Promise<void> => {
  const existingDashboard = await findDashboardByTitle(dashboardDefinition.title);

  if (existingDashboard) {
    console.log(
      `${LOG_PREFIX}   ✓ ${dashboardDefinition.title} (exists)`,
    );
    return;
  }

  const pageLayout = await metadataClient.createPageLayout({
    name: dashboardDefinition.title,
    type: 'DASHBOARD',
  });

  const pageLayoutTab = await metadataClient.createPageLayoutTab({
    title: dashboardDefinition.tabTitle,
    pageLayoutId: pageLayout.id,
    position: 0,
  });

  const viewIdsByName = await createViewsForDashboard(
    dashboardDefinition,
    registry,
  );

  await createWidgetsForDashboard(
    dashboardDefinition,
    pageLayoutTab.id,
    registry,
    viewIdsByName,
  );

  const dashboardId = await createDashboardRecord(
    dashboardDefinition.title,
    pageLayout.id,
  );

  console.log(
    `${LOG_PREFIX}   + dashboard ${dashboardDefinition.title} (${dashboardId})`,
  );
};

export const setupParksDashboards = async (): Promise<void> => {
  console.log(
    `${LOG_PREFIX} Configuring Parks Industrial dashboards (Sección 7)...`,
  );

  const registry = await buildMetadataRegistry();

  for (const dashboardDefinition of PARKS_DASHBOARD_DEFINITIONS) {
    await setupSingleDashboard(dashboardDefinition, registry);
  }

  console.log(
    `${LOG_PREFIX} Done — ${PARKS_DASHBOARD_DEFINITIONS.length} dashboards`,
  );
};
