import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IconBuildingSkyscraper } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

import { ParksAccount360Content } from '@/parks-industrial/components/account/ParksAccount360Content';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { fetchParksAccount360 } from '@/parks-industrial/services/parks-commercial.client';
import { type ParksAccount360Response } from '@/parks-industrial/types/parks-commercial.types';

export const ParksInquilino360Page = () => {
  const { inquilinoId } = useParams<{ inquilinoId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<ParksAccount360Response | null>(null);

  const loadAccount360 = useCallback(async () => {
    if (!inquilinoId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await fetchParksAccount360(inquilinoId);
      setData(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo cargar la vista 360`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [inquilinoId]);

  useEffect(() => {
    void loadAccount360();
  }, [loadAccount360]);

  const pageTitle =
    data?.inquilino?.empresa && data.inquilino.empresa.trim().length > 0
      ? data.inquilino.empresa
      : t`Cuenta 360`;

  return (
    <ParksPageShell
      title={pageTitle}
      subtitle={getParksIndustrialPageSubtitle(
        t`Vista unificada del cliente — contratos, pipeline, pagos y decisores`,
      )}
      icon={<IconBuildingSkyscraper size={20} />}
    >
      {isLoading ? <ParksLoadingSkeleton variant="dashboard" /> : null}

      {!isLoading && errorMessage ? (
        <ParksEmptyState
          title={t`No se pudo cargar la cuenta`}
          description={errorMessage}
          action={
            <Button
              variant="secondary"
              title={t`Reintentar`}
              onClick={() => void loadAccount360()}
            />
          }
        />
      ) : null}

      {!isLoading && data && inquilinoId ? (
        <ParksAccount360Content
          data={data}
          inquilinoId={inquilinoId}
          onRefresh={loadAccount360}
        />
      ) : null}
    </ParksPageShell>
  );
};
