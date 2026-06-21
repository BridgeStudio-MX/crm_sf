export const PARKS_DASHBOARD_LEGAL_TITLE =
  'Parks Industrial — Dashboard Legal';

export const PARKS_DASHBOARD_EJECUTIVO_TITLE =
  'Parks Industrial — Dashboard Ejecutivo';

export type DashboardWidgetGridPosition = {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
};

export type DashboardWidgetDefinition = {
  title: string;
  type: 'GRAPH' | 'RECORD_TABLE' | 'STANDALONE_RICH_TEXT';
  gridPosition: DashboardWidgetGridPosition;
  objectNameSingular?: string;
  viewName?: string;
  buildConfiguration: (context: DashboardWidgetContext) => Record<string, unknown>;
};

export type DashboardWidgetContext = {
  resolveFieldId: (objectNameSingular: string, fieldName: string) => string;
  resolveObjectId: (objectNameSingular: string) => string;
  viewIdsByName: Map<string, string>;
};

export type ParksDashboardDefinition = {
  title: string;
  tabTitle: string;
  viewDefinitions: {
    name: string;
    objectNameSingular: string;
    type: 'TABLE' | 'KANBAN';
    icon: string;
    mainGroupByFieldName?: string;
  }[];
  widgets: DashboardWidgetDefinition[];
};

export const PARKS_DASHBOARD_DEFINITIONS: ParksDashboardDefinition[] = [
  {
    title: PARKS_DASHBOARD_LEGAL_TITLE,
    tabTitle: 'Legal',
    viewDefinitions: [
      {
        name: 'Parks — Casos SLA en riesgo',
        objectNameSingular: 'casoLegal',
        type: 'TABLE',
        icon: 'IconAlertTriangle',
      },
      {
        name: 'Parks — Documentación pendiente',
        objectNameSingular: 'casoLegal',
        type: 'TABLE',
        icon: 'IconFileAlert',
      },
      {
        name: 'Parks — Expedientes por vencer',
        objectNameSingular: 'expedienteContrato',
        type: 'TABLE',
        icon: 'IconCalendarTime',
      },
      {
        name: 'Parks — Holdovers activos',
        objectNameSingular: 'holdover',
        type: 'TABLE',
        icon: 'IconAlertCircle',
      },
    ],
    widgets: [
      {
        title: 'Casos por semáforo',
        type: 'GRAPH',
        objectNameSingular: 'casoLegal',
        gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 6 },
        buildConfiguration: ({ resolveFieldId, resolveObjectId }) => ({
          configurationType: 'PIE_CHART',
          aggregateFieldMetadataId: resolveFieldId('casoLegal', 'id'),
          aggregateOperation: 'COUNT',
          groupByFieldMetadataId: resolveFieldId('casoLegal', 'semaforo'),
          objectMetadataId: resolveObjectId('casoLegal'),
        }),
      },
      {
        title: 'Holdovers activos',
        type: 'GRAPH',
        objectNameSingular: 'holdover',
        gridPosition: { row: 0, column: 6, rowSpan: 3, columnSpan: 3 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'AGGREGATE_CHART',
          aggregateFieldMetadataId: resolveFieldId('holdover', 'id'),
          aggregateOperation: 'COUNT',
          displayDataLabel: true,
        }),
      },
      {
        title: 'SLA promedio (días)',
        type: 'GRAPH',
        objectNameSingular: 'casoLegal',
        gridPosition: { row: 0, column: 9, rowSpan: 3, columnSpan: 3 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'AGGREGATE_CHART',
          aggregateFieldMetadataId: resolveFieldId(
            'casoLegal',
            'diasTranscurridos',
          ),
          aggregateOperation: 'AVG',
          displayDataLabel: true,
        }),
      },
      {
        title: 'Carga por abogado',
        type: 'GRAPH',
        objectNameSingular: 'casoLegal',
        gridPosition: { row: 3, column: 6, rowSpan: 6, columnSpan: 6 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'BAR_CHART',
          layout: 'VERTICAL',
          aggregateFieldMetadataId: resolveFieldId('casoLegal', 'id'),
          aggregateOperation: 'COUNT',
          primaryAxisGroupByFieldMetadataId: resolveFieldId(
            'casoLegal',
            'abogadoAsignado',
          ),
          primaryAxisOrderBy: 'VALUE_DESC',
          displayDataLabel: true,
          axisNameDisplay: 'NONE',
        }),
      },
      {
        title: 'SLA en riesgo',
        type: 'RECORD_TABLE',
        objectNameSingular: 'casoLegal',
        viewName: 'Parks — Casos SLA en riesgo',
        gridPosition: { row: 6, column: 0, rowSpan: 8, columnSpan: 6 },
        buildConfiguration: ({ viewIdsByName }) => ({
          configurationType: 'RECORD_TABLE',
          viewId: viewIdsByName.get('Parks — Casos SLA en riesgo'),
        }),
      },
      {
        title: 'Documentación pendiente',
        type: 'RECORD_TABLE',
        objectNameSingular: 'casoLegal',
        viewName: 'Parks — Documentación pendiente',
        gridPosition: { row: 6, column: 6, rowSpan: 8, columnSpan: 6 },
        buildConfiguration: ({ viewIdsByName }) => ({
          configurationType: 'RECORD_TABLE',
          viewId: viewIdsByName.get('Parks — Documentación pendiente'),
        }),
      },
      {
        title: 'Contratos por vencer (90 días)',
        type: 'RECORD_TABLE',
        objectNameSingular: 'expedienteContrato',
        viewName: 'Parks — Expedientes por vencer',
        gridPosition: { row: 14, column: 0, rowSpan: 8, columnSpan: 12 },
        buildConfiguration: ({ viewIdsByName }) => ({
          configurationType: 'RECORD_TABLE',
          viewId: viewIdsByName.get('Parks — Expedientes por vencer'),
        }),
      },
    ],
  },
  {
    title: PARKS_DASHBOARD_EJECUTIVO_TITLE,
    tabTitle: 'Ejecutivo',
    viewDefinitions: [
      {
        name: 'Parks — Pipeline comercial',
        objectNameSingular: 'opportunity',
        type: 'TABLE',
        icon: 'IconChartFunnel',
      },
      {
        name: 'Parks — Contratos por vencer',
        objectNameSingular: 'expedienteContrato',
        type: 'TABLE',
        icon: 'IconCalendarStats',
      },
    ],
    widgets: [
      {
        title: 'Pipeline activo por etapa',
        type: 'GRAPH',
        objectNameSingular: 'opportunity',
        gridPosition: { row: 0, column: 0, rowSpan: 8, columnSpan: 8 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'BAR_CHART',
          layout: 'VERTICAL',
          aggregateFieldMetadataId: resolveFieldId('opportunity', 'id'),
          aggregateOperation: 'COUNT',
          primaryAxisGroupByFieldMetadataId: resolveFieldId(
            'opportunity',
            'stage',
          ),
          primaryAxisOrderBy: 'FIELD_ASC',
          displayDataLabel: true,
          axisNameDisplay: 'NONE',
        }),
      },
      {
        title: 'Holdovers activos',
        type: 'GRAPH',
        objectNameSingular: 'holdover',
        gridPosition: { row: 0, column: 8, rowSpan: 4, columnSpan: 4 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'AGGREGATE_CHART',
          aggregateFieldMetadataId: resolveFieldId('holdover', 'id'),
          aggregateOperation: 'COUNT',
          displayDataLabel: true,
        }),
      },
      {
        title: 'Comisiones generadas (USD)',
        type: 'GRAPH',
        objectNameSingular: 'comision',
        gridPosition: { row: 4, column: 8, rowSpan: 4, columnSpan: 4 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'AGGREGATE_CHART',
          aggregateFieldMetadataId: resolveFieldId('comision', 'montoUsd'),
          aggregateOperation: 'SUM',
          displayDataLabel: true,
        }),
      },
      {
        title: 'Revenue promedio USD/m²',
        type: 'GRAPH',
        objectNameSingular: 'hojaDeAcuerdos',
        gridPosition: { row: 8, column: 0, rowSpan: 4, columnSpan: 4 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'AGGREGATE_CHART',
          aggregateFieldMetadataId: resolveFieldId(
            'hojaDeAcuerdos',
            'precioUsdM2',
          ),
          aggregateOperation: 'AVG',
          displayDataLabel: true,
        }),
      },
      {
        title: 'm² rentados (nacional)',
        type: 'GRAPH',
        objectNameSingular: 'parque',
        gridPosition: { row: 8, column: 4, rowSpan: 4, columnSpan: 4 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'AGGREGATE_CHART',
          aggregateFieldMetadataId: resolveFieldId('parque', 'm2Rentados'),
          aggregateOperation: 'SUM',
          displayDataLabel: true,
        }),
      },
      {
        title: 'Casos cerrados',
        type: 'GRAPH',
        objectNameSingular: 'casoLegal',
        gridPosition: { row: 8, column: 8, rowSpan: 4, columnSpan: 4 },
        buildConfiguration: ({ resolveFieldId }) => ({
          configurationType: 'AGGREGATE_CHART',
          aggregateFieldMetadataId: resolveFieldId('casoLegal', 'id'),
          aggregateOperation: 'COUNT',
          displayDataLabel: true,
        }),
      },
      {
        title: 'Sincronización Oracle',
        type: 'STANDALONE_RICH_TEXT',
        gridPosition: { row: 12, column: 0, rowSpan: 3, columnSpan: 12 },
        buildConfiguration: () => ({
          configurationType: 'STANDALONE_RICH_TEXT',
          body: {
            blocknote: JSON.stringify([
              {
                id: 'oracle-status',
                type: 'paragraph',
                props: {
                  textColor: 'default',
                  backgroundColor: 'default',
                  textAlignment: 'left',
                },
                content: [
                  {
                    type: 'text',
                    text: 'Oracle ERP — modo mock activo. Última sync vía parks-twenty-service cron.',
                    styles: {},
                  },
                ],
                children: [],
              },
            ]),
            markdown:
              'Oracle ERP — modo mock activo. Última sync vía parks-twenty-service cron.',
          },
        }),
      },
      {
        title: 'Contratos por vencer',
        type: 'RECORD_TABLE',
        objectNameSingular: 'expedienteContrato',
        viewName: 'Parks — Contratos por vencer',
        gridPosition: { row: 15, column: 0, rowSpan: 8, columnSpan: 12 },
        buildConfiguration: ({ viewIdsByName }) => ({
          configurationType: 'RECORD_TABLE',
          viewId: viewIdsByName.get('Parks — Contratos por vencer'),
        }),
      },
    ],
  },
];
