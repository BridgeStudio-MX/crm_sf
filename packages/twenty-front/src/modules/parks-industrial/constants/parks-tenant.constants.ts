export const PARKS_INDUSTRIAL_TENANT_NAME = 'Parks Industrial';

export const getParksIndustrialPageSubtitle = (description: string): string =>
  `${PARKS_INDUSTRIAL_TENANT_NAME} · ${description}`;

export const formatParksIndustrialDocumentTitle = (pageName: string): string =>
  `${pageName} · ${PARKS_INDUSTRIAL_TENANT_NAME}`;
