export const PARKS_AI_SERVICE_URL =
  import.meta.env.VITE_PARKS_SERVICE_URL ?? 'http://localhost:3002';

export const PARKS_AI_CHAT_ENDPOINT = `${PARKS_AI_SERVICE_URL}/ai/chat`;
