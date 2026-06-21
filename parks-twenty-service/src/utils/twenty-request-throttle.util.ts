const DEFAULT_MIN_REQUEST_INTERVAL_MS = 700;
const RATE_LIMIT_RETRY_WAIT_MS = 65_000;

let lastRequestAt = 0;

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export const isTwentyRateLimitError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('Limit reached');
};

export const waitForTwentyRequestSlot = async (): Promise<void> => {
  const intervalMs = Number(
    process.env.TWENTY_REQUEST_INTERVAL_MS ?? DEFAULT_MIN_REQUEST_INTERVAL_MS,
  );
  const elapsedMs = Date.now() - lastRequestAt;
  const waitMs = intervalMs - elapsedMs;

  if (waitMs > 0) {
    await sleep(waitMs);
  }

  lastRequestAt = Date.now();
};

export const resetTwentyRequestThrottle = (): void => {
  lastRequestAt = 0;
};

export const getTwentyRateLimitRetryWaitMs = (): number =>
  RATE_LIMIT_RETRY_WAIT_MS;
