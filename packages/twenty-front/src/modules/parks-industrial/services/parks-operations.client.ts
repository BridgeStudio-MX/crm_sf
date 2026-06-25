import {
  PARKS_OPERATIONS_BROKER_PERFORMANCE_ENDPOINT,
  PARKS_OPERATIONS_CXC_HANDOFF_ENDPOINT,
  PARKS_OPERATIONS_REGISTER_PAYMENT_ENDPOINT,
  PARKS_OPERATIONS_SERVICE_URL,
} from '@/parks-industrial/constants/parks-operations.constants';
import {
  type BrokerPerformanceMetrics,
  type CxcHandoffRecord,
  type CxcHandoffResult,
  type PaymentCommissionResult,
} from '@/parks-industrial/types/parks-operations.types';

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ??
    `Error del servicio Parks Operations (${response.status})`
  );
};

export const triggerParksCxcHandoff = async (
  casoLegalId: string,
): Promise<CxcHandoffResult> => {
  const response = await fetch(PARKS_OPERATIONS_CXC_HANDOFF_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ casoLegalId }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcHandoffResult;
};

export const fetchParksCxcHandoff = async (
  casoLegalId: string,
): Promise<CxcHandoffRecord | null> => {
  const response = await fetch(
    `${PARKS_OPERATIONS_SERVICE_URL}/operations/cxc-handoff/${casoLegalId}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CxcHandoffRecord;
};

export const registerParksPayment = async (
  comisionId: string,
): Promise<PaymentCommissionResult> => {
  const response = await fetch(PARKS_OPERATIONS_REGISTER_PAYMENT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comisionId }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as PaymentCommissionResult;
};

export const fetchParksBrokerPerformance = async ({
  brokerName,
}: {
  brokerName?: string;
} = {}): Promise<BrokerPerformanceMetrics> => {
  const query = brokerName
    ? `?brokerName=${encodeURIComponent(brokerName)}`
    : '';
  const response = await fetch(
    `${PARKS_OPERATIONS_BROKER_PERFORMANCE_ENDPOINT}${query}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as BrokerPerformanceMetrics;
};
