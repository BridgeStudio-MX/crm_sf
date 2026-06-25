import { twentyQuery } from '@/lib/twenty-api';

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as {
      query: string;
      variables?: Record<string, unknown>;
    };
    const data = await twentyQuery(body.query, body.variables);

    return Response.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error en proxy GraphQL';

    return Response.json({ errors: [{ message }] }, { status: 500 });
  }
};
