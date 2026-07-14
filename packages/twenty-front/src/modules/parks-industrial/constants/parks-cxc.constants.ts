export const PARKS_CXC_SERVICE_URL =
  import.meta.env.VITE_PARKS_SERVICE_URL ?? 'http://localhost:3002';

export const PARKS_CXC_DASHBOARD_ENDPOINT = `${PARKS_CXC_SERVICE_URL}/cxc/dashboard`;

export const parksCxcAccountUrl = (accountId: string): string =>
  `${PARKS_CXC_SERVICE_URL}/cxc/accounts/${accountId}`;

export const parksCxcSuggestPaymentUrl = (accountId: string): string =>
  `${parksCxcAccountUrl(accountId)}/suggest-payment`;

export const parksCxcApplyPaymentUrl = (accountId: string): string =>
  `${parksCxcAccountUrl(accountId)}/apply-payment`;

export const parksCxcActionsUrl = (accountId: string): string =>
  `${parksCxcAccountUrl(accountId)}/actions`;

export const parksCxcOcReminderUrl = (accountId: string): string =>
  `${parksCxcAccountUrl(accountId)}/oc-reminder`;

export const parksCxcRegisterOcUrl = (accountId: string): string =>
  `${parksCxcAccountUrl(accountId)}/register-oc`;

export const parksCxcDepositStepUrl = (accountId: string): string =>
  `${parksCxcAccountUrl(accountId)}/deposit-step`;

export const parksCxcResolveAnomalyUrl = (anomalyId: string): string =>
  `${PARKS_CXC_SERVICE_URL}/cxc/anomalies/${anomalyId}/resolve`;
