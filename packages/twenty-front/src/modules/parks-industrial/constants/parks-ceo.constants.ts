export const PARKS_CEO_SERVICE_URL =
  import.meta.env.REACT_APP_PARKS_SERVICE_URL ??
  import.meta.env.VITE_PARKS_SERVICE_URL ??
  'http://localhost:3002';

export const PARKS_CEO_DASHBOARD_ENDPOINT = `${PARKS_CEO_SERVICE_URL}/ceo/dashboard`;

export const PARKS_CEO_INBOX_ENDPOINT = `${PARKS_CEO_SERVICE_URL}/ceo/inbox`;

export const PARKS_CEO_INBOX_RESOLVE_ENDPOINT = (itemId: string) =>
  `${PARKS_CEO_SERVICE_URL}/ceo/inbox/${encodeURIComponent(itemId)}/resolve`;
