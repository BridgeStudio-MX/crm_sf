import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCeoInboxPanel } from '@/parks-industrial/components/dashboard/ParksCeoInboxPanel';
import { ParksCemInboxPanel } from '@/parks-industrial/components/pendientes/ParksCemInboxPanel';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { useParksMisPendientes } from '@/parks-industrial/hooks/useParksMisPendientes';

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const ParksMisPendientesContent = () => {
  const { audience, ceoInbox, cemInbox, loading, error, refresh } =
    useParksMisPendientes();

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (audience === 'cem') {
    if (!cemInbox) {
      return (
        <ParksEmptyState
          title={t`No se pudieron cargar tus pendientes`}
          description={error ?? t`Revisa el microservicio Parks (:3002).`}
          action={
            <Button
              variant="secondary"
              Icon={IconRefresh}
              title={t`Reintentar`}
              onClick={() => void refresh()}
            />
          }
        />
      );
    }

    return (
      <StyledParksPageStack>
        <StyledToolbar>
          <StyledHint>
            {t`Leads por asignar, aprobaciones Director Comercial y firmas de Hoja de Acuerdos.`}
          </StyledHint>
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Actualizar`}
            onClick={() => void refresh()}
          />
        </StyledToolbar>

        <StyledMetricsGrid>
          <ParksMetricCard
            label={t`Total`}
            value={cemInbox.total}
            accent="yellow"
          />
          <ParksMetricCard
            label={t`Leads`}
            value={cemInbox.leadsSinAsignar}
            accent="blue"
          />
          <ParksMetricCard
            label={t`Aprobaciones`}
            value={cemInbox.aprobacionesComerciales}
            accent="purple"
          />
          <ParksMetricCard
            label={t`Firmas hoja`}
            value={cemInbox.firmasHoja}
            accent="green"
          />
        </StyledMetricsGrid>

        {error ? <StyledError>{error}</StyledError> : null}

        <ParksCemInboxPanel
          inbox={cemInbox}
          onResolved={() => void refresh()}
        />
      </StyledParksPageStack>
    );
  }

  if (!ceoInbox) {
    return (
      <ParksEmptyState
        title={t`No se pudieron cargar tus pendientes`}
        description={error ?? t`Revisa el microservicio Parks (:3002).`}
        action={
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Reintentar`}
            onClick={() => void refresh()}
          />
        }
      />
    );
  }

  return (
    <StyledParksPageStack>
      <StyledToolbar>
        <StyledHint>
          {t`Aprobaciones, condonaciones y firmas que requieren tu decisión.`}
        </StyledHint>
        <Button
          variant="secondary"
          Icon={IconRefresh}
          title={t`Actualizar`}
          onClick={() => void refresh()}
        />
      </StyledToolbar>

      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Total`}
          value={ceoInbox.total}
          accent="yellow"
        />
        <ParksMetricCard
          label={t`Comerciales`}
          value={ceoInbox.aprobacionesComerciales}
          accent="purple"
        />
        <ParksMetricCard
          label={t`Condonaciones`}
          value={ceoInbox.condonaciones}
          accent="orange"
        />
        <ParksMetricCard
          label={t`Firmas`}
          value={ceoInbox.firmas}
          accent="green"
        />
      </StyledMetricsGrid>

      {error ? <StyledError>{error}</StyledError> : null}

      <ParksCeoInboxPanel
        inbox={ceoInbox}
        onResolved={() => void refresh()}
      />
    </StyledParksPageStack>
  );
};
