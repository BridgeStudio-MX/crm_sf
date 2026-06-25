import { useEffect, useState } from 'react';

import { fetchParksEmailSequence } from '@/parks-industrial/services/parks-commercial.client';
import { type EmailSequenceResult } from '@/parks-industrial/types/parks-commercial.types';

export const useParksEmailSequence = ({
  opportunityId,
  companyName,
  industryHint,
}: {
  opportunityId: string;
  companyName: string;
  industryHint?: string;
}) => {
  const [sequence, setSequence] = useState<EmailSequenceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSequence = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchParksEmailSequence({
          opportunityId,
          companyName,
          industryHint,
        });

        if (!cancelled) {
          setSequence(result);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudo cargar la secuencia',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSequence();

    return () => {
      cancelled = true;
    };
  }, [companyName, industryHint, opportunityId]);

  return { sequence, loading, error };
};
