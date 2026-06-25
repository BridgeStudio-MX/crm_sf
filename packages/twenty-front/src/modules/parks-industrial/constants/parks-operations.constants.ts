export const PARKS_OPERATIONS_SERVICE_URL =
  import.meta.env.VITE_PARKS_SERVICE_URL ?? 'http://localhost:3002';

export const PARKS_OPERATIONS_CXC_HANDOFF_ENDPOINT = `${PARKS_OPERATIONS_SERVICE_URL}/operations/cxc-handoff`;
export const PARKS_OPERATIONS_REGISTER_PAYMENT_ENDPOINT = `${PARKS_OPERATIONS_SERVICE_URL}/operations/register-payment`;
export const PARKS_OPERATIONS_BROKER_PERFORMANCE_ENDPOINT = `${PARKS_OPERATIONS_SERVICE_URL}/operations/broker-performance`;
