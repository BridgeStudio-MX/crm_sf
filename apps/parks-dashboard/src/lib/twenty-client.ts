type GraphQlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

export const twentyClientMutate = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as GraphQlResponse<TData>;

  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? 'GraphQL error');
  }

  if (!payload.data) {
    throw new Error('Empty GraphQL response');
  }

  return payload.data;
};
