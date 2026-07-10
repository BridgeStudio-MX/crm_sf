import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBuildingSkyscraper,
  IconCalendar,
  IconClock,
  IconCurrencyDollar,
  IconExternalLink,
  IconFileText,
  IconLayoutKanban,
  IconMail,
  IconMap,
  IconPhone,
  IconPlus,
  IconUser,
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Tag } from 'twenty-ui/data-display';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDecisoresPanel } from '@/parks-industrial/components/pipeline/ParksDecisoresPanel';
import { ParksNewLeadModal } from '@/parks-industrial/components/pipeline/ParksNewLeadModal';
import {
  ParksDetailField,
  ParksKpiTile,
} from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksSegmentedControl } from '@/parks-industrial/components/ui/ParksSegmentedControl';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksAccount360Response } from '@/parks-industrial/types/parks-commercial.types';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksDaysUntil,
  getParksStackingStatus,
} from '@/parks-industrial/utils/parks-format.util';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

type Account360Tab =
  | 'resumen'
  | 'contratos'
  | 'oportunidades'
  | 'historial'
  | 'decisores';

type ParksAccount360ContentProps = {
  data: ParksAccount360Response;
  inquilinoId: string;
  onRefresh: () => Promise<void>;
};

const StyledPageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledHeroBand = styled.div`
  background: linear-gradient(
    155deg,
    ${themeCssVariables.color.blue1} 0%,
    ${themeCssVariables.background.primary} 58%,
    ${themeCssVariables.color.purple1} 100%
  );
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[3]};
  }
`;

const StyledBackLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  text-decoration: none;
  width: fit-content;

  &:hover {
    color: ${themeCssVariables.color.blue};
  }
`;

const StyledHeroMain = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
`;

const StyledHeroIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.blue};
  border: 1px solid ${themeCssVariables.color.blue3};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.color.blue};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 56px;
  justify-content: center;
  width: 56px;
`;

const StyledHeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledHeroTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.2;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledHeroSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledHeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledKpiGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StyledTabBar = styled.div`
  overflow-x: auto;
  padding-bottom: 2px;
`;

const StyledTwoColumn = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1.4fr 1fr;
  }
`;

const StyledContactGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledAlertBanner = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.color.yellow1};
  border: 1px solid ${themeCssVariables.color.yellow3};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEntityCard = styled.button`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  width: 100%;

  &:hover {
    border-color: ${themeCssVariables.color.blue3};
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
`;

const StyledStaticCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledCardTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMetaGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledMetaItem = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledContactLink = styled.a`
  color: ${themeCssVariables.color.blue};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledTimeline = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledTimelineItem = styled.li<{ accent: string }>`
  border-left: 2px solid ${({ accent }) => accent};
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 10px;
  padding: 0 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  position: relative;

  &::before {
    background: ${({ accent }) => accent};
    border: 2px solid ${themeCssVariables.background.primary};
    border-radius: 50%;
    content: '';
    height: 10px;
    left: -6px;
    position: absolute;
    top: 4px;
    width: 10px;
  }
`;

const StyledTimelineTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTimelineMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledPipelineLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 4px;
  text-decoration: none;

  &:hover {
    color: ${themeCssVariables.color.blue};
  }
`;

const getCompanyInitials = (companyName?: string): string => {
  if (!companyName?.trim()) {
    return '—';
  }

  const words = companyName.trim().split(/\s+/).slice(0, 2);

  return words.map((word) => word.charAt(0).toUpperCase()).join('');
};

const formatRelativeDate = (value?: string): string => {
  if (!value) {
    return '—';
  }

  try {
    return formatDistanceToNow(parseISO(value), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return value;
  }
};

export const ParksAccount360Content = ({
  data,
  inquilinoId,
  onRefresh,
}: ParksAccount360ContentProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const [activeTab, setActiveTab] = useState<Account360Tab>('resumen');
  const [isNewOpportunityOpen, setIsNewOpportunityOpen] = useState(false);

  const oportunidades = data.oportunidades ?? [];
  const contratos = data.contratos ?? [];
  const interacciones = data.interacciones ?? [];
  const decisores = data.decisores ?? [];
  const estadoPagos = data.estadoPagos ?? { fuente: 'sin-datos' as const };

  const oportunidadesEnProceso = useMemo(
    () => oportunidades.filter((oportunidad) => oportunidad.enProceso),
    [oportunidades],
  );

  const rentaMensualTotal = useMemo(
    () =>
      contratos.reduce(
        (total, contrato) => total + (contrato.rentaMensualUsd ?? 0),
        0,
      ),
    [contratos],
  );

  const paymentStatus = estadoPagos.alCorriente
    ? { label: t`Al corriente`, color: 'green' as const, accent: 'green' as const }
    : estadoPagos.alCorriente === false
      ? { label: t`Con adeudos`, color: 'red' as const, accent: 'red' as const }
      : { label: t`Sin dato`, color: 'gray' as const, accent: 'gray' as const };

  const prefillInquilino = {
    inquilinoId,
    empresa: data.inquilino?.empresa ?? t`Inquilino`,
    nombreCompleto: data.inquilino?.contactoPrincipal,
    correo: data.inquilino?.emailContacto,
    telefono: data.inquilino?.telefono,
    giroEmpresa: data.inquilino?.sector,
  };

  const tabOptions = [
    { id: 'resumen' as const, label: t`Resumen` },
    {
      id: 'contratos' as const,
      label: t`Contratos`,
      count: contratos.length,
    },
    {
      id: 'oportunidades' as const,
      label: t`Oportunidades`,
      count: oportunidadesEnProceso.length,
    },
    {
      id: 'historial' as const,
      label: t`Historial`,
      count: interacciones.length,
    },
    { id: 'decisores' as const, label: t`Decisores`, count: decisores.length },
  ];

  const handleOpenOpportunity = (opportunityId: string) => {
    openRecordInSidePanel({
      recordId: opportunityId,
      objectNameSingular: 'opportunity',
    });
  };

  return (
    <StyledPageStack>
      <StyledHeroBand>
        <StyledBackLink to={AppPath.ParksPipeline}>
          <IconArrowLeft size={14} />
          {t`Volver al pipeline`}
        </StyledBackLink>

        <StyledHeroMain>
          <StyledHeroIdentity>
            <StyledAvatar>
              {getCompanyInitials(data.inquilino?.empresa)}
            </StyledAvatar>
            <StyledHeroText>
              <StyledHeroTitle>
                {data.inquilino?.empresa ?? t`Inquilino`}
              </StyledHeroTitle>
              <StyledHeroSubtitle>
                {data.inquilino?.sector ?? t`Sector no definido`} ·{' '}
                {data.inquilino?.rfc ?? t`RFC pendiente`}
              </StyledHeroSubtitle>
            </StyledHeroText>
          </StyledHeroIdentity>

          <StyledHeroActions>
            <Link to={AppPath.ParksPipeline} style={{ textDecoration: 'none' }}>
              <Button
                variant="secondary"
                Icon={IconLayoutKanban}
                title={t`Ver pipeline`}
              />
            </Link>
            <Button
              variant="primary"
              Icon={IconPlus}
              title={t`Nueva oportunidad`}
              onClick={() => setIsNewOpportunityOpen(true)}
            />
          </StyledHeroActions>
        </StyledHeroMain>

        <StyledBadgeRow>
          <ParksStatusBadge
            label={paymentStatus.label}
            color={paymentStatus.color}
          />
          {data.inquilino?.estatus ? (
            <ParksStatusBadge label={data.inquilino.estatus} color="blue" />
          ) : null}
          {data.tieneContratosFuno ? (
            <ParksStatusBadge label={t`Portafolio FUNO`} color="yellow" />
          ) : null}
        </StyledBadgeRow>
      </StyledHeroBand>

      <StyledKpiGrid>
        <ParksMetricCard
          label={t`Contratos activos`}
          value={data.expedientesActivos}
          icon={IconFileText}
          accent="green"
          trend={
            rentaMensualTotal > 0
              ? `${formatParksUsd(rentaMensualTotal)}/mes`
              : undefined
          }
        />
        <ParksMetricCard
          label={t`Oportunidades abiertas`}
          value={data.oportunidadesEnProceso}
          icon={IconLayoutKanban}
          accent="purple"
        />
        <ParksMetricCard
          label={t`Decisores`}
          value={decisores.length}
          icon={IconUsers}
          accent="blue"
          trend={t`Meta: 2–5 personas`}
        />
        <ParksMetricCard
          label={t`Estado de pagos`}
          value={paymentStatus.label}
          icon={IconCurrencyDollar}
          accent={paymentStatus.accent}
          trend={formatParksDate(estadoPagos.ultimoPagoFecha)}
        />
      </StyledKpiGrid>

      {data.tieneContratosFuno ? (
        <StyledAlertBanner>
          <IconAlertTriangle size={18} />
          <span>
            {t`Este cliente tiene contratos en propiedades FUNO. Valida la ruta de archivo y el impacto en comisiones antes de negociar.`}
          </span>
        </StyledAlertBanner>
      ) : null}

      <StyledTabBar>
        <ParksSegmentedControl
          options={tabOptions}
          value={activeTab}
          onChange={setActiveTab}
        />
      </StyledTabBar>

      {activeTab === 'resumen' ? (
        <StyledTwoColumn>
          <ParksSectionCard title={t`Contacto y cuenta`} accent="blue">
            <StyledContactGrid>
              <ParksDetailField
                label={t`Contacto principal`}
                icon={IconUser}
                accent="blue"
                value={data.inquilino?.contactoPrincipal ?? '—'}
              />
              <ParksDetailField
                label={t`Correo`}
                icon={IconMail}
                accent="blue"
                value={
                  data.inquilino?.emailContacto ? (
                    <StyledContactLink
                      href={`mailto:${data.inquilino.emailContacto}`}
                    >
                      {data.inquilino.emailContacto}
                    </StyledContactLink>
                  ) : (
                    '—'
                  )
                }
              />
              <ParksDetailField
                label={t`Teléfono`}
                icon={IconPhone}
                accent="blue"
                value={
                  data.inquilino?.telefono ? (
                    <StyledContactLink href={`tel:${data.inquilino.telefono}`}>
                      {data.inquilino.telefono}
                    </StyledContactLink>
                  ) : (
                    '—'
                  )
                }
              />
              <ParksDetailField
                label={t`Rep. legal`}
                icon={IconUser}
                value={data.inquilino?.repLegalNombre ?? '—'}
              />
              <ParksDetailField
                label={t`RFC`}
                icon={IconBuildingSkyscraper}
                value={data.inquilino?.rfc ?? '—'}
              />
              <ParksDetailField
                label={t`Oracle ID`}
                icon={IconCurrencyDollar}
                value={data.inquilino?.oracleClienteId ?? '—'}
              />
            </StyledContactGrid>
            {data.note ? <StyledHint>{data.note}</StyledHint> : null}
          </ParksSectionCard>

          <ParksSectionCard title={t`Snapshot comercial`} accent="purple">
            <StyledContactGrid>
              <ParksKpiTile
                label={t`Renta mensual`}
                value={formatParksUsd(rentaMensualTotal)}
                accent="green"
              />
              <ParksKpiTile
                label={t`Último pago`}
                value={formatParksDate(estadoPagos.ultimoPagoFecha)}
                accent="yellow"
              />
              <ParksKpiTile
                label={t`Contratos FUNO`}
                value={data.contratos.filter((contrato) => contrato.esPropiedadFuno).length}
                accent="yellow"
              />
              <ParksKpiTile
                label={t`Interacciones`}
                value={interacciones.length}
                accent="purple"
              />
            </StyledContactGrid>
            <StyledPipelineLink to={AppPath.ParksPipeline}>
              {t`Abrir pipeline completo`}
              <IconExternalLink size={14} />
            </StyledPipelineLink>
          </ParksSectionCard>
        </StyledTwoColumn>
      ) : null}

      {activeTab === 'contratos' ? (
        <ParksSectionCard title={t`Contratos activos`} accent="green">
          {contratos.length > 0 ? (
            <StyledCardList>
              {contratos.map((contrato) => {
                const diasRestantes = getParksDaysUntil(
                  contrato.fechaVencimiento,
                );
                const expiryStatus = getParksStackingStatus(
                  diasRestantes,
                  true,
                );

                return (
                  <StyledStaticCard key={contrato.id}>
                    <StyledCardHeader>
                      <StyledCardTitle>
                        {contrato.numeroExpediente ?? contrato.id}
                      </StyledCardTitle>
                      <StyledBadgeRow>
                        {contrato.esPropiedadFuno ? (
                          <ParksStatusBadge label={t`FUNO`} color="yellow" />
                        ) : null}
                        <ParksStatusBadge
                          label={contrato.estatus ?? t`Activo`}
                          color="green"
                        />
                      </StyledBadgeRow>
                    </StyledCardHeader>
                    <StyledMetaGrid>
                      <StyledMetaItem>
                        <IconMap size={14} />
                        {contrato.parqueNombre ?? t`Sin parque`} ·{' '}
                        {contrato.naveIdentificador ?? t`Sin nave`}
                      </StyledMetaItem>
                      <StyledMetaItem>
                        <IconCurrencyDollar size={14} />
                        {formatParksUsd(contrato.rentaMensualUsd)}/mes
                      </StyledMetaItem>
                      <StyledMetaItem>
                        <IconCalendar size={14} />
                        {t`Vence`} {formatParksDate(contrato.fechaVencimiento)}
                      </StyledMetaItem>
                      <StyledMetaItem>
                        <IconClock size={14} />
                        {diasRestantes !== null
                          ? t`${diasRestantes} días restantes`
                          : t`Sin fecha`}
                        <ParksStatusBadge
                          label={
                            expiryStatus.statusKey === 'renewal_due'
                              ? t`Renovar ya`
                              : expiryStatus.statusKey === 'expiring_soon'
                                ? t`Por vencer`
                                : t`Vigente`
                          }
                          color={expiryStatus.color}
                        />
                      </StyledMetaItem>
                    </StyledMetaGrid>
                  </StyledStaticCard>
                );
              })}
            </StyledCardList>
          ) : (
            <ParksEmptyState
              title={t`Sin contratos activos`}
              description={t`Este cliente aún no tiene expedientes vigentes vinculados.`}
              action={
                <Button
                  variant="primary"
                  Icon={IconPlus}
                  title={t`Crear oportunidad`}
                  onClick={() => setIsNewOpportunityOpen(true)}
                />
              }
            />
          )}
        </ParksSectionCard>
      ) : null}

      {activeTab === 'oportunidades' ? (
        <ParksSectionCard
          title={t`Oportunidades en proceso`}
          accent="purple"
          action={
            <StyledPipelineLink to={AppPath.ParksPipeline}>
              {t`Pipeline`}
              <IconExternalLink size={14} />
            </StyledPipelineLink>
          }
        >
          {oportunidadesEnProceso.length > 0 ? (
            <StyledCardList>
              {oportunidadesEnProceso.map((oportunidad) => (
                <StyledEntityCard
                  key={oportunidad.id}
                  type="button"
                  onClick={() => handleOpenOpportunity(oportunidad.id)}
                >
                  <StyledCardHeader>
                    <StyledCardTitle>
                      {oportunidad.name ?? oportunidad.id}
                    </StyledCardTitle>
                    <Tag
                      color={getParksPipelineStageColor(oportunidad.stage)}
                      text={getParksPipelineStageLabel(oportunidad.stage)}
                      variant="solid"
                      weight="medium"
                    />
                  </StyledCardHeader>
                  <StyledMetaGrid>
                    <StyledMetaItem>
                      <IconFileText size={14} />
                      {oportunidad.tipoOperacion ?? t`Sin tipo`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconBuildingSkyscraper size={14} />
                      {oportunidad.m2Requeridos
                        ? `${formatParksNumber(oportunidad.m2Requeridos)} m²`
                        : t`Sin m²`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconMap size={14} />
                      {oportunidad.ubicacionDeseada ?? t`Sin ubicación`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconClock size={14} />
                      {t`Actualizado`}{' '}
                      {formatRelativeDate(oportunidad.updatedAt)}
                    </StyledMetaItem>
                  </StyledMetaGrid>
                </StyledEntityCard>
              ))}
            </StyledCardList>
          ) : (
            <ParksEmptyState
              title={t`Sin oportunidades abiertas`}
              description={t`Crea una nueva oportunidad para expansión, renovación o nave adicional.`}
              action={
                <Button
                  variant="primary"
                  Icon={IconPlus}
                  title={t`Nueva oportunidad`}
                  onClick={() => setIsNewOpportunityOpen(true)}
                />
              }
            />
          )}
        </ParksSectionCard>
      ) : null}

      {activeTab === 'historial' ? (
        <ParksSectionCard title={t`Historial de interacciones`} accent="yellow">
          {interacciones.length > 0 ? (
            <StyledTimeline>
              {interacciones.map((interaccion) => (
                <StyledTimelineItem
                  key={interaccion.id}
                  accent={
                    interaccion.tipo === 'notificacion'
                      ? themeCssVariables.color.orange
                      : themeCssVariables.color.blue
                  }
                >
                  <StyledTimelineTitle>{interaccion.titulo}</StyledTimelineTitle>
                  <StyledTimelineMeta>
                    {interaccion.descripcion}
                  </StyledTimelineMeta>
                  <StyledTimelineMeta>
                    {formatRelativeDate(interaccion.fecha)}
                  </StyledTimelineMeta>
                </StyledTimelineItem>
              ))}
            </StyledTimeline>
          ) : (
            <ParksEmptyState
              title={t`Sin actividad registrada`}
              description={t`Las oportunidades y notificaciones del cliente aparecerán aquí.`}
            />
          )}
        </ParksSectionCard>
      ) : null}

      {activeTab === 'decisores' ? (
        <ParksDecisoresPanel inquilinoId={inquilinoId} embedded />
      ) : null}

      {isNewOpportunityOpen ? (
        <ParksNewLeadModal
          prefillInquilino={prefillInquilino}
          onClose={() => setIsNewOpportunityOpen(false)}
          onCreated={async () => {
            setIsNewOpportunityOpen(false);
            await onRefresh();
          }}
        />
      ) : null}
    </StyledPageStack>
  );
};
