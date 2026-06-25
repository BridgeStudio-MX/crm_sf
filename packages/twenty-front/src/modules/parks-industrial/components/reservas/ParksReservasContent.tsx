import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { Link } from 'react-router-dom';
import { IconBox, IconBuildingSkyscraper, IconClock } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksPropertyImage } from '@/parks-industrial/components/ui/ParksPropertyImage';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksReservas } from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksNumber,
  formatParksUsd,
  getParksDaysInStageColor,
} from '@/parks-industrial/utils/parks-format.util';

const StyledHero = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.blue1} 0%,
    ${themeCssVariables.background.primary} 55%,
    ${themeCssVariables.color.purple1} 100%
  );
  border: 1px solid ${themeCssVariables.color.blue3};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeroTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[2]};
`;

const StyledHeroText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0 0 ${themeCssVariables.spacing[3]};
  max-width: 680px;
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.color.blue};
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
`;

const StyledCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCardTitle = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCardMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledCardFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledPipelineLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.xs};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const ParksReservasContent = () => {
  const { reservas, summary, loading } = useParksReservas();

  if (loading) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  return (
    <StyledParksPageStack>
      <StyledHero>
        <StyledHeroTitle>{t`Inventario bajo negociación`}</StyledHeroTitle>
        <StyledHeroText>
          {t`Naves reservadas o en proceso comercial. Evita doble asignación revisando qué activos ya tienen deal activo antes de prometer disponibilidad.`}
        </StyledHeroText>
        <StyledMetricsGrid>
          <ParksMetricCard
            label={t`Naves reservadas`}
            value={summary.totalReservadas}
            icon={IconBox}
            accent="blue"
          />
          <ParksMetricCard
            label={t`m² en negociación`}
            value={formatParksNumber(summary.m2BajoNegociacion)}
            icon={IconBuildingSkyscraper}
            accent="blue"
          />
          <ParksMetricCard
            label={t`Valor estimado`}
            value={formatParksUsd(summary.valorPipelineUsd)}
            icon={IconClock}
            accent="yellow"
          />
          <ParksMetricCard
            label={t`Disponibles en catálogo`}
            value={summary.navesDisponibles}
            icon={IconBox}
            accent="green"
            trend={`${formatParksNumber(summary.m2Disponible)} m²`}
          />
        </StyledMetricsGrid>
      </StyledHero>

      {reservas.length === 0 ? (
        <ParksEmptyState
          title={t`Sin naves en negociación`}
          description={t`Cuando un deal comercial vincule una nave o su estatus cambie a negociación, aparecerá aquí.`}
        />
      ) : (
        <StyledGrid>
          {reservas.map((reserva) => {
            const daysColor = reserva.opportunity?.updatedAt
              ? getParksDaysInStageColor(reserva.opportunity.updatedAt)
              : 'gray';

            return (
              <StyledCard key={reserva.id}>
                <ParksPropertyImage
                  imageUrl={reserva.nave.fotoInmuebleUrl}
                  alt={reserva.nave.identificador ?? t`Nave`}
                  fallbackLabel={reserva.nave.identificador ?? t`Nave`}
                  height={140}
                  showBorderRadius={false}
                />
                <StyledCardBody>
                  <StyledCardTitle>
                    {reserva.nave.identificador ?? t`Nave`}
                  </StyledCardTitle>
                  <StyledCardMeta>{reserva.parqueNombre}</StyledCardMeta>
                  <StyledCardMeta>
                    {formatParksNumber(reserva.nave.m2 ?? 0)} m² ·{' '}
                    {formatParksUsd(reserva.valorEstimadoUsd)}
                  </StyledCardMeta>
                  <div>
                    <ParksStatusBadge
                      label={reserva.estatusLabel}
                      color="blue"
                    />
                  </div>
                  <StyledCardMeta>
                    {t`Responsable`}: {reserva.responsable}
                  </StyledCardMeta>
                  {reserva.diasEnEtapa !== null ? (
                    <ParksStatusBadge
                      label={t`${reserva.diasEnEtapa} días en etapa`}
                      color={daysColor}
                    />
                  ) : null}
                  {reserva.opportunity?.name ? (
                    <StyledCardMeta>{reserva.opportunity.name}</StyledCardMeta>
                  ) : null}
                </StyledCardBody>
                <StyledCardFooter>
                  <span style={{ fontSize: 12, color: themeCssVariables.font.color.tertiary }}>
                    {t`Reserva activa`}
                  </span>
                  <StyledPipelineLink to={AppPath.ParksPipeline}>
                    {t`Ver pipeline`}
                  </StyledPipelineLink>
                </StyledCardFooter>
              </StyledCard>
            );
          })}
        </StyledGrid>
      )}
    </StyledParksPageStack>
  );
};
