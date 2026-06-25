const TWENTY_API_URL =
  process.env.TWENTY_API_URL ?? 'http://localhost:3000/graphql';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY ?? '';

type GraphQlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

export async function twentyQuery<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  if (!TWENTY_API_KEY) {
    throw new Error(
      'TWENTY_API_KEY no configurada — copia .env.example a .env.local',
    );
  }

  const response = await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Twenty API error: ${response.status}`);
  }

  const payload = (await response.json()) as GraphQlResponse<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? 'GraphQL error');
  }

  if (!payload.data) {
    throw new Error('Twenty API returned empty data');
  }

  return payload.data;
}

export async function twentyMutate<TData>(
  mutation: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  return twentyQuery<TData>(mutation, variables);
}

export const getTwentyConfig = () => ({
  apiUrl: TWENTY_API_URL,
  hasApiKey: Boolean(TWENTY_API_KEY),
});
