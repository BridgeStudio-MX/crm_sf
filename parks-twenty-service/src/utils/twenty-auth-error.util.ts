export const isTwentyAuthError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('token has expired') ||
    message.includes('unauthenticated') ||
    message.includes('you must be authenticated')
  );
};
