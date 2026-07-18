import {
  PARKS_CXC_DASHBOARD_ENDPOINT,
  parksCxcAccountUrl,
  parksCxcActionsUrl,
  parksCxcApplyPaymentUrl,
  parksCxcDepositStepUrl,
  parksCxcOcReminderUrl,
  parksCxcRegisterOcUrl,
  parksCxcResolveAnomalyUrl,
  parksCxcSuggestPaymentUrl,
} from '@/parks-industrial/constants/parks-cxc.constants';
import {
  type CxcAccount,
  type CxcAnomaly,
  type CxcCobranzaActionType,
  type CxcDashboardResult,
  type CxcPaymentSuggestion,
  type CxcRiskLabel,
} from '@/parks-industrial/types/parks-cxc.types';

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ??
    `Error del servicio Parks Industrial (${response.status})`
  );
};

export const fetchParksCxcDashboard = async (filters?: {
  ejecutivoId?: string;
  riskLabel?: CxcRiskLabel;
}): Promise<CxcDashboardResult> => {
  const searchParams = new URLSearchParams();

  if (filters?.ejecutivoId) {
    searchParams.set('ejecutivoId', filters.ejecutivoId);
  }

  if (filters?.riskLabel) {
    searchParams.set('riskLabel', filters.riskLabel);
  }

  const query = searchParams.toString();
  const response = await fetch(
    query
      ? `${PARKS_CXC_DASHBOARD_ENDPOINT}?${query}`
      : PARKS_CXC_DASHBOARD_ENDPOINT,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcDashboardResult;
};

export const fetchParksCxcAccount = async (
  accountId: string,
): Promise<CxcAccount> => {
  const response = await fetch(parksCxcAccountUrl(accountId));

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcAccount;
};

export const suggestParksCxcPayment = async (
  accountId: string,
  pagoMonto: number,
): Promise<CxcPaymentSuggestion> => {
  const response = await fetch(parksCxcSuggestPaymentUrl(accountId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pagoMonto }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcPaymentSuggestion;
};

export const applyParksCxcPayment = async (
  accountId: string,
  input: {
    pagoMonto: number;
    invoiceIds: string[];
    note?: string;
    appliedBy?: string;
  },
): Promise<CxcAccount> => {
  const response = await fetch(parksCxcApplyPaymentUrl(accountId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcAccount;
};

export const addParksCxcCobranzaAction = async (
  accountId: string,
  input: {
    type: CxcCobranzaActionType;
    detail?: string;
    createdBy?: string;
    compromisoPagoFecha?: string;
    compromisoMonto?: number;
    proximaAccionFecha?: string;
    proximaAccionNota?: string;
  },
): Promise<CxcAccount> => {
  const response = await fetch(parksCxcActionsUrl(accountId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcAccount;
};

export const sendParksCxcOcReminder = async (
  accountId: string,
  input?: { escalate?: boolean; createdBy?: string },
): Promise<CxcAccount> => {
  const response = await fetch(parksCxcOcReminderUrl(accountId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input ?? {}),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcAccount;
};

export const registerParksCxcOc = async (
  accountId: string,
  numeroOc: string,
): Promise<CxcAccount> => {
  const response = await fetch(parksCxcRegisterOcUrl(accountId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numeroOc }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcAccount;
};

export const advanceParksCxcDepositStep = async (
  accountId: string,
  step: 'caratula' | 'carta' | 'firmas' | 'devolver',
): Promise<CxcAccount> => {
  const response = await fetch(parksCxcDepositStepUrl(accountId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcAccount;
};

export const resolveParksCxcAnomaly = async (
  anomalyId: string,
  note?: string,
): Promise<CxcAnomaly> => {
  const response = await fetch(parksCxcResolveAnomalyUrl(anomalyId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcAnomaly;
};
