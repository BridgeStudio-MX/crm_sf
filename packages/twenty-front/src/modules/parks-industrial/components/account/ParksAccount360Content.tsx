import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconClock,
  IconCurrencyDollar,
  IconExternalLink,
  IconFileCheck,
  IconFileText,
  IconLayoutKanban,
  IconMail,
  IconMap,
  IconPhone,
  IconPlus,
  IconReportMoney,
  IconSparkles,
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
import { getLegalEstatusLabel } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { PARKS_CXC_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import { type ParksAccount360Response } from '@/parks-industrial/types/parks-commercial.types';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksDaysUntil,
  getParksLegalSemaforoBadgeColor,
  getParksLegalSemaforoLabel,
  getParksStackingStatus,
} from '@/parks-industrial/utils/parks-format.util';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

type Account360Tab =
  | 'resumen'
  | 'empresa'
  | 'documentos'
  | 'hojas'
  | 'actividad'
  | 'contratos'
  | 'oportunidades'
  | 'legal'
  | 'cxc'
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
  const casosLegales = data.casosLegales ?? [];
  const hojasDeAcuerdos = data.hojasDeAcuerdos ?? [];
  const documentos = data.documentos ?? [];
  const actividades = data.actividades ?? [];
  const cxc = data.cxc;
  const interacciones = data.interacciones ?? [];
  const decisores = data.decisores ?? [];
  const estadoPagos = data.estadoPagos ?? { fuente: 'sin-datos' as const };

  const oportunidadesEnProceso = useMemo(
    () => oportunidades.filter((oportunidad) => oportunidad.enProceso),
    [oportunidades],
  );

  const oportunidadesCerradas = useMemo(
    () => oportunidades.filter((oportunidad) => !oportunidad.enProceso),
    [oportunidades],
  );

  const documentosEntregados = useMemo(
    () => documentos.filter((documento) => documento.entregado),
    [documentos],
  );

  const documentosPendientes = useMemo(
    () => documentos.filter((documento) => !documento.entregado),
    [documentos],
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

  const paymentSourceLabel =
    estadoPagos.fuente === 'oracle'
      ? t`Fuente: Oracle`
      : estadoPagos.fuente === 'cxc'
        ? t`Fuente: CxC`
        : t`Fuente: sin dato`;

  const prefillInquilino = {
    inquilinoId,
    empresa: data.inquilino?.empresa ?? t`Inquilino`,
    nombreCompleto: data.inquilino?.contactoPrincipal,
    correo: data.inquilino?.emailContacto,
    telefono: data.inquilino?.telefono,
    giroEmpresa: data.inquilino?.sector,
  };

  const actividadCount = actividades.length + interacciones.length;

  const tabOptions = [
    { id: 'resumen' as const, label: t`Resumen` },
    { id: 'empresa' as const, label: t`Empresa` },
    {
      id: 'documentos' as const,
      label: t`Documentos`,
      count: documentos.length,
    },
    {
      id: 'hojas' as const,
      label: t`Hojas`,
      count: hojasDeAcuerdos.length,
    },
    {
      id: 'actividad' as const,
      label: t`Actividad`,
      count: actividadCount,
    },
    {
      id: 'contratos' as const,
      label: t`Contratos`,
      count: contratos.length,
    },
    {
      id: 'oportunidades' as const,
      label: t`Oportunidades`,
      count: oportunidades.length,
    },
    {
      id: 'legal' as const,
      label: t`Legal`,
      count: casosLegales.length,
    },
    {
      id: 'cxc' as const,
      label: t`CxC`,
      count: cxc ? 1 : 0,
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
              : data.contratos.length > 0
                ? t`${data.contratos.length} en portafolio`
                : t`Sin expediente aún`
          }
        />
        <ParksMetricCard
          label={t`Oportunidades abiertas`}
          value={data.oportunidadesEnProceso}
          icon={IconLayoutKanban}
          accent="purple"
          trend={
            data.oportunidades.length > 0
              ? t`${data.oportunidades.length} en historial`
              : t`Sin oportunidades`
          }
        />
        <ParksMetricCard
          label={t`Casos legales`}
          value={data.casosLegalesActivos ?? casosLegales.length}
          icon={IconBriefcase}
          accent="blue"
          trend={
            casosLegales.length > 0
              ? t`${casosLegales.length} en historial`
              : t`Sin casos`
          }
        />
        <ParksMetricCard
          label={t`Estado de pagos`}
          value={paymentStatus.label}
          icon={IconCurrencyDollar}
          accent={paymentStatus.accent}
          trend={paymentSourceLabel}
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

      {(data.senalesExpansion?.length ?? 0) > 0 ? (
        <StyledAlertBanner>
          <IconSparkles size={18} />
          <span>
            {t`IA detectó ${data.senalesExpansion!.length} señal(es) de expansión. Revisa el resumen para naves candidatas.`}
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
        <StyledCardList>
          {(data.senalesExpansion?.length ?? 0) > 0 ? (
            <ParksSectionCard
              title={t`Señales de expansión (IA)`}
              accent="green"
            >
              <StyledCardList>
                {data.senalesExpansion!.map((signal) => (
                  <StyledEntityCard
                    key={signal.id}
                    type="button"
                    onClick={() => setIsNewOpportunityOpen(true)}
                  >
                    <StyledCardHeader>
                      <StyledCardTitle>{signal.titulo}</StyledCardTitle>
                      <Tag
                        color={
                          signal.confianza === 'alta'
                            ? 'green'
                            : signal.confianza === 'media'
                              ? 'orange'
                              : 'gray'
                        }
                        text={`${signal.fuente} · ${signal.confianza}`}
                        variant="solid"
                        weight="medium"
                      />
                    </StyledCardHeader>
                    <StyledMetaItem>{signal.detalle}</StyledMetaItem>
                    <StyledMetaGrid>
                      <StyledMetaItem>
                        <IconMap size={14} />
                        {signal.zonaObjetivo}
                      </StyledMetaItem>
                      <StyledMetaItem>
                        <IconBuildingSkyscraper size={14} />
                        {signal.naveActual
                          ? `${signal.naveActual} · ${signal.parqueActual ?? ''}`
                          : t`Sin nave actual`}
                      </StyledMetaItem>
                    </StyledMetaGrid>
                    {signal.navesCandidatas.length > 0 ? (
                      <StyledMetaItem>
                        {t`Naves candidatas:`}{' '}
                        {signal.navesCandidatas
                          .map(
                            (nave) =>
                              `${nave.identificador} (${nave.m2.toLocaleString('es-MX')} m² · ${nave.estatus})`,
                          )
                          .join(' · ')}
                      </StyledMetaItem>
                    ) : null}
                    <StyledMetaItem>
                      {t`Clic para crear oportunidad de expansión`}
                    </StyledMetaItem>
                  </StyledEntityCard>
                ))}
              </StyledCardList>
            </ParksSectionCard>
          ) : null}

          <ParksSectionCard title={t`Datos de la empresa`} accent="blue">
            <StyledContactGrid>
              <ParksDetailField
                label={t`Nombre / razón social`}
                icon={IconBuildingSkyscraper}
                accent="blue"
                value={data.inquilino?.empresa ?? '—'}
              />
              <ParksDetailField
                label={t`RFC`}
                icon={IconFileText}
                accent="blue"
                value={data.inquilino?.rfc ?? '—'}
              />
              <ParksDetailField
                label={t`Sector`}
                icon={IconBriefcase}
                accent="blue"
                value={data.inquilino?.sector ?? '—'}
              />
              <ParksDetailField
                label={t`Estatus`}
                icon={IconUsers}
                accent="blue"
                value={data.inquilino?.estatus ?? '—'}
              />
              <ParksDetailField
                label={t`Rep. legal`}
                icon={IconUser}
                value={data.inquilino?.repLegalNombre ?? '—'}
              />
              <ParksDetailField
                label={t`Oracle ID`}
                icon={IconCurrencyDollar}
                value={data.inquilino?.oracleClienteId || '—'}
              />
            </StyledContactGrid>
          </ParksSectionCard>

          <StyledTwoColumn>
            <ParksSectionCard title={t`Contacto`} accent="purple">
              <StyledContactGrid>
                <ParksDetailField
                  label={t`Contacto principal`}
                  icon={IconUser}
                  accent="purple"
                  value={data.inquilino?.contactoPrincipal ?? '—'}
                />
                <ParksDetailField
                  label={t`Correo`}
                  icon={IconMail}
                  accent="purple"
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
                  accent="purple"
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
                  label={t`Email rep. legal`}
                  icon={IconMail}
                  value={
                    data.inquilino?.repLegalEmail ? (
                      <StyledContactLink
                        href={`mailto:${data.inquilino.repLegalEmail}`}
                      >
                        {data.inquilino.repLegalEmail}
                      </StyledContactLink>
                    ) : (
                      '—'
                    )
                  }
                />
              </StyledContactGrid>
              {data.note ? <StyledHint>{data.note}</StyledHint> : null}
            </ParksSectionCard>

            <ParksSectionCard title={t`Snapshot`} accent="green">
              <StyledContactGrid>
                <ParksKpiTile
                  label={t`Renta mensual`}
                  value={formatParksUsd(rentaMensualTotal)}
                  accent="green"
                />
                <ParksKpiTile
                  label={t`Documentos`}
                  value={`${data.documentosEntregados ?? documentosEntregados.length}/${documentos.length || 0}`}
                  accent="yellow"
                />
                <ParksKpiTile
                  label={t`Hojas de Acuerdos`}
                  value={hojasDeAcuerdos.length}
                  accent="purple"
                />
                <ParksKpiTile
                  label={t`Casos legales`}
                  value={casosLegales.length}
                  accent="blue"
                />
              </StyledContactGrid>
              <StyledPipelineLink to={AppPath.ParksPipeline}>
                {t`Abrir pipeline completo`}
                <IconExternalLink size={14} />
              </StyledPipelineLink>
            </ParksSectionCard>
          </StyledTwoColumn>
        </StyledCardList>
      ) : null}

      {activeTab === 'empresa' ? (
        <ParksSectionCard title={t`Ficha de la empresa`} accent="blue">
          <StyledContactGrid>
            <ParksDetailField
              label={t`Nombre / razón social`}
              icon={IconBuildingSkyscraper}
              accent="blue"
              value={data.inquilino?.empresa ?? '—'}
            />
            <ParksDetailField
              label={t`RFC`}
              icon={IconFileText}
              accent="blue"
              value={data.inquilino?.rfc ?? '—'}
            />
            <ParksDetailField
              label={t`Sector / giro`}
              icon={IconBriefcase}
              value={data.inquilino?.sector ?? '—'}
            />
            <ParksDetailField
              label={t`Estatus comercial`}
              icon={IconUsers}
              value={data.inquilino?.estatus ?? '—'}
            />
            <ParksDetailField
              label={t`Representante legal`}
              icon={IconUser}
              value={data.inquilino?.repLegalNombre ?? '—'}
            />
            <ParksDetailField
              label={t`Email representante`}
              icon={IconMail}
              value={data.inquilino?.repLegalEmail || '—'}
            />
            <ParksDetailField
              label={t`Contacto principal`}
              icon={IconUser}
              value={data.inquilino?.contactoPrincipal ?? '—'}
            />
            <ParksDetailField
              label={t`Correo contacto`}
              icon={IconMail}
              value={data.inquilino?.emailContacto ?? '—'}
            />
            <ParksDetailField
              label={t`Teléfono`}
              icon={IconPhone}
              value={data.inquilino?.telefono ?? '—'}
            />
            <ParksDetailField
              label={t`Oracle cliente ID`}
              icon={IconCurrencyDollar}
              value={data.inquilino?.oracleClienteId || '—'}
            />
            <ParksDetailField
              label={t`Último pago`}
              icon={IconCalendar}
              value={formatParksDate(estadoPagos.ultimoPagoFecha)}
            />
            <ParksDetailField
              label={t`Decisores registrados`}
              icon={IconUsers}
              value={`${decisores.length}`}
            />
          </StyledContactGrid>
        </ParksSectionCard>
      ) : null}

      {activeTab === 'documentos' ? (
        <ParksSectionCard
          title={t`Documentación del cliente`}
          accent="yellow"
          action={
            <StyledHint>
              {t`${documentosEntregados.length} entregados · ${documentosPendientes.length} pendientes`}
            </StyledHint>
          }
        >
          {documentos.length > 0 ? (
            <StyledCardList>
              {documentos.map((documento) => (
                <StyledStaticCard key={documento.id}>
                  <StyledCardHeader>
                    <StyledCardTitle>
                      {documento.titulo ??
                        documento.tipoDocumento ??
                        t`Documento`}
                    </StyledCardTitle>
                    <ParksStatusBadge
                      label={
                        documento.entregado ? t`Entregado` : t`Pendiente`
                      }
                      color={documento.entregado ? 'green' : 'yellow'}
                    />
                  </StyledCardHeader>
                  <StyledMetaGrid>
                    <StyledMetaItem>
                      <IconFileText size={14} />
                      {documento.tipoDocumento ?? t`Sin tipo`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconBriefcase size={14} />
                      {documento.casoReferencia ?? t`Sin caso`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <StyledPipelineLink
                        to={getAppPath(AppPath.ParksContratoAprobacion, {
                          contratoId: documento.casoLegalId,
                        })}
                      >
                        {t`Ver en caso legal`}
                        <IconExternalLink size={14} />
                      </StyledPipelineLink>
                    </StyledMetaItem>
                  </StyledMetaGrid>
                </StyledStaticCard>
              ))}
            </StyledCardList>
          ) : (
            <ParksEmptyState
              title={t`Sin checklist de documentos`}
              description={t`Los documentos aparecen cuando Legal genera el checklist del caso (CSF, acta, INE, etc.).`}
            />
          )}
        </ParksSectionCard>
      ) : null}

      {activeTab === 'hojas' ? (
        <ParksSectionCard title={t`Hojas de Acuerdos`} accent="purple">
          {hojasDeAcuerdos.length > 0 ? (
            <StyledCardList>
              {hojasDeAcuerdos.map((hoja) => (
                <StyledStaticCard key={hoja.id}>
                  <StyledCardHeader>
                    <StyledCardTitle>
                      {hoja.referencia ?? hoja.id}
                    </StyledCardTitle>
                    <StyledBadgeRow>
                      <ParksStatusBadge
                        label={hoja.estatus ?? t`Sin estatus`}
                        color="blue"
                      />
                      {hoja.firmadaPorCliente && hoja.firmadaPorCem ? (
                        <ParksStatusBadge label={t`Firmada`} color="green" />
                      ) : (
                        <ParksStatusBadge
                          label={t`Firma pendiente`}
                          color="yellow"
                        />
                      )}
                    </StyledBadgeRow>
                  </StyledCardHeader>
                  <StyledMetaGrid>
                    <StyledMetaItem>
                      <IconFileText size={14} />
                      {hoja.tipoContrato ?? t`Sin tipo`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconBuildingSkyscraper size={14} />
                      {hoja.m2Acordados
                        ? `${formatParksNumber(hoja.m2Acordados)} m²`
                        : t`Sin m²`}
                      {hoja.precioUsdM2
                        ? ` · ${formatParksUsd(hoja.precioUsdM2)}/m²`
                        : ''}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconCurrencyDollar size={14} />
                      {hoja.rentaMensualEstimadaUsd != null
                        ? `${formatParksUsd(hoja.rentaMensualEstimadaUsd)}/mes`
                        : t`Sin renta`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconCalendar size={14} />
                      {t`Plazo`} {hoja.plazoMeses ?? '—'} {t`meses`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconMap size={14} />
                      {hoja.parqueNombre ?? t`Sin parque`} ·{' '}
                      {hoja.naveIdentificador ?? t`Sin nave`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconClock size={14} />
                      {t`Firma`} {formatParksDate(hoja.fechaFirma)}
                    </StyledMetaItem>
                    {hoja.oportunidadVinculadaId ? (
                      <StyledMetaItem>
                        <button
                          type="button"
                          style={{
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            font: 'inherit',
                            gap: 4,
                            padding: 0,
                          }}
                          onClick={() => {
                            if (hoja.oportunidadVinculadaId) {
                              handleOpenOpportunity(
                                hoja.oportunidadVinculadaId,
                              );
                            }
                          }}
                        >
                          {t`Ver oportunidad`}
                          <IconExternalLink size={14} />
                        </button>
                      </StyledMetaItem>
                    ) : null}
                  </StyledMetaGrid>
                </StyledStaticCard>
              ))}
            </StyledCardList>
          ) : (
            <ParksEmptyState
              title={t`Sin Hojas de Acuerdos`}
              description={t`Cuando el LO genera y firma la Hoja, aparece aquí vinculada al inquilino.`}
            />
          )}
        </ParksSectionCard>
      ) : null}

      {activeTab === 'actividad' ? (
        <StyledCardList>
          <ParksSectionCard title={t`Actividad comercial`} accent="blue">
            {actividades.length > 0 ? (
              <StyledTimeline>
                {actividades.map((actividad) => (
                  <StyledTimelineItem
                    key={actividad.id}
                    accent={
                      actividad.type === 'email'
                        ? themeCssVariables.color.blue
                        : actividad.type === 'call'
                          ? themeCssVariables.color.green
                          : themeCssVariables.color.orange
                    }
                  >
                    <StyledTimelineTitle>
                      {actividad.subject}
                    </StyledTimelineTitle>
                    <StyledTimelineMeta>
                      {actividad.type.toUpperCase()} · {actividad.direction} ·{' '}
                      {actividad.participant}
                      {actividad.opportunityName
                        ? ` · ${actividad.opportunityName}`
                        : ''}
                    </StyledTimelineMeta>
                    <StyledTimelineMeta>{actividad.summary}</StyledTimelineMeta>
                    <StyledTimelineMeta>
                      {formatRelativeDate(actividad.occurredAt)}
                    </StyledTimelineMeta>
                  </StyledTimelineItem>
                ))}
              </StyledTimeline>
            ) : (
              <ParksEmptyState
                title={t`Sin actividad reciente`}
                description={t`Emails, llamadas y tareas del deal aparecerán aquí.`}
              />
            )}
          </ParksSectionCard>

          <ParksSectionCard title={t`Línea de tiempo CRM`} accent="yellow">
            {interacciones.length > 0 ? (
              <StyledTimeline>
                {interacciones.map((interaccion) => (
                  <StyledTimelineItem
                    key={interaccion.id}
                    accent={
                      interaccion.tipo === 'notificacion'
                        ? themeCssVariables.color.orange
                        : interaccion.tipo === 'legal'
                          ? themeCssVariables.color.purple
                          : interaccion.tipo === 'cxc'
                            ? themeCssVariables.color.green
                            : interaccion.tipo === 'hoja'
                              ? themeCssVariables.color.turquoise
                              : themeCssVariables.color.blue
                    }
                  >
                    <StyledTimelineTitle>
                      {interaccion.titulo}
                    </StyledTimelineTitle>
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
                title={t`Sin eventos CRM`}
                description={t`Oportunidades, hojas, legal y CxC se consolidan aquí.`}
              />
            )}
          </ParksSectionCard>
        </StyledCardList>
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
                        <IconBuildingSkyscraper size={14} />
                        {contrato.m2
                          ? `${formatParksNumber(contrato.m2)} m²`
                          : t`Sin m²`}
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
                      {contrato.casoLegalId ? (
                        <StyledMetaItem>
                          <IconBriefcase size={14} />
                          <StyledPipelineLink
                            to={getAppPath(AppPath.ParksContratoAprobacion, {
                              contratoId: contrato.casoLegalId,
                            })}
                          >
                            {t`Ver caso legal`}
                            <IconExternalLink size={14} />
                          </StyledPipelineLink>
                        </StyledMetaItem>
                      ) : null}
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
        <StyledCardList>
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

          {oportunidadesCerradas.length > 0 ? (
            <ParksSectionCard title={t`Cerradas / perdidas`} accent="gray">
              <StyledCardList>
                {oportunidadesCerradas.map((oportunidad) => (
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
                    <StyledMetaItem>
                      <IconClock size={14} />
                      {formatRelativeDate(oportunidad.updatedAt)}
                    </StyledMetaItem>
                  </StyledEntityCard>
                ))}
              </StyledCardList>
            </ParksSectionCard>
          ) : null}
        </StyledCardList>
      ) : null}

      {activeTab === 'legal' ? (
        <ParksSectionCard title={t`Casos legales`} accent="blue">
          {casosLegales.length > 0 ? (
            <StyledCardList>
              {casosLegales.map((casoLegal) => (
                <StyledStaticCard key={casoLegal.id}>
                  <StyledCardHeader>
                    <StyledCardTitle>
                      {casoLegal.referencia ?? casoLegal.id}
                    </StyledCardTitle>
                    <StyledBadgeRow>
                      {casoLegal.semaforo ? (
                        <ParksStatusBadge
                          label={getParksLegalSemaforoLabel(casoLegal.semaforo)}
                          color={getParksLegalSemaforoBadgeColor(
                            casoLegal.semaforo,
                          )}
                        />
                      ) : null}
                      <ParksStatusBadge
                        label={getLegalEstatusLabel(casoLegal.estatus)}
                        color="blue"
                      />
                    </StyledBadgeRow>
                  </StyledCardHeader>
                  <StyledMetaGrid>
                    <StyledMetaItem>
                      <IconFileText size={14} />
                      {casoLegal.tipoDocumento ?? t`Sin tipo`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconUser size={14} />
                      {casoLegal.abogadoAsignado ?? t`Sin abogado`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconMap size={14} />
                      {casoLegal.parqueNombre ?? t`Sin parque`} ·{' '}
                      {casoLegal.naveIdentificador ?? t`Sin nave`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconClock size={14} />
                      {t`SLA`} {casoLegal.diasTranscurridos ?? 0}/
                      {casoLegal.slaDiasHabiles ?? '—'} {t`días`}
                      {casoLegal.slaPausado ? ` · ${t`Pausado`}` : ''}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <IconFileCheck size={14} />
                      {casoLegal.documentacionCompleta
                        ? t`Documentación completa`
                        : t`Documentación pendiente`}
                    </StyledMetaItem>
                    <StyledMetaItem>
                      <StyledPipelineLink
                        to={getAppPath(AppPath.ParksContratoAprobacion, {
                          contratoId: casoLegal.id,
                        })}
                      >
                        {t`Abrir aprobación`}
                        <IconExternalLink size={14} />
                      </StyledPipelineLink>
                    </StyledMetaItem>
                  </StyledMetaGrid>
                </StyledStaticCard>
              ))}
            </StyledCardList>
          ) : (
            <ParksEmptyState
              title={t`Sin casos legales`}
              description={t`Los casos aparecen cuando se firma la Hoja de Acuerdos y hay handoff a Legal.`}
            />
          )}
        </ParksSectionCard>
      ) : null}

      {activeTab === 'cxc' ? (
        <ParksSectionCard
          title={t`Cuentas por cobrar`}
          accent="green"
          action={
            <StyledPipelineLink to={PARKS_CXC_PATH}>
              {t`Dashboard CxC`}
              <IconExternalLink size={14} />
            </StyledPipelineLink>
          }
        >
          {cxc ? (
            <StyledContactGrid>
              <ParksDetailField
                label={t`Estatus de pagos`}
                icon={IconReportMoney}
                accent="green"
                value={cxc.estatusPagos}
              />
              <ParksDetailField
                label={t`Score de riesgo`}
                icon={IconAlertTriangle}
                value={`${cxc.scoreRiesgo} · ${cxc.scoreLabel}`}
              />
              <ParksDetailField
                label={t`Adeudo total`}
                icon={IconCurrencyDollar}
                value={formatParksUsd(cxc.montoAdeudoTotal)}
              />
              <ParksDetailField
                label={t`Días en mora`}
                icon={IconClock}
                value={`${cxc.diasEnMora}`}
              />
              <ParksDetailField
                label={t`Renta mensual`}
                icon={IconCurrencyDollar}
                value={formatParksUsd(cxc.rentaMensual)}
              />
              <ParksDetailField
                label={t`Último pago`}
                icon={IconCalendar}
                value={formatParksDate(cxc.ultimaFechaPago ?? undefined)}
              />
              <ParksDetailField
                label={t`Nave / parque`}
                icon={IconMap}
                value={`${cxc.nave} · ${cxc.parque}`}
              />
              <ParksDetailField
                label={t`Facturas pendientes`}
                icon={IconFileText}
                value={`${cxc.facturasPendientes}`}
              />
              <ParksDetailField
                label={t`Ciclo`}
                icon={IconBriefcase}
                value={cxc.cicloEstatus}
              />
            </StyledContactGrid>
          ) : (
            <ParksEmptyState
              title={t`Sin cuenta CxC vinculada`}
              description={t`Cuando exista match por empresa o RFC en cobranza, el resumen aparecerá aquí.`}
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
