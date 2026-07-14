import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import {
  IconFileText,
  IconListCheck,
  IconMap,
  IconNotes,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

import { ParksLoCampoChecklist } from '@/parks-industrial/components/campo/ParksLoCampoChecklist';
import { ParksLoCampoDealPicker } from '@/parks-industrial/components/campo/ParksLoCampoDealPicker';
import { ParksLoCampoHoyTab } from '@/parks-industrial/components/campo/ParksLoCampoHoyTab';
import { ParksLoCampoScript } from '@/parks-industrial/components/campo/ParksLoCampoScript';
import { ParksLoCampoTourNotes } from '@/parks-industrial/components/campo/ParksLoCampoTourNotes';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { PARKS_LO_CAMPO_TOUR_STAGES } from '@/parks-industrial/constants/parks-lo-campo.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  type ParksOpportunityRecord,
  useParksOpportunities,
} from '@/parks-industrial/hooks/useParksRecords';
import { isParksOpportunityAssignedToViewer } from '@/parks-industrial/utils/parks-format.util';

type CampoTab = 'hoy' | 'tour' | 'guion' | 'checklist';

const EMPTY_OPPORTUNITIES: ParksOpportunityRecord[] = [];

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin: 0 auto;
  max-width: 480px;
  min-height: min(720px, calc(100vh - 180px));
  padding-bottom: 88px;
  position: relative;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 100%;
    min-height: calc(100vh - 140px);
  }
`;

const StyledPhoneFrame = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: 28px;
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-radius: ${themeCssVariables.border.radius.xl};
  }
`;

const StyledHeader = styled.header`
  background: linear-gradient(
    160deg,
    ${PARKS_BRAND.primary} 0%,
    #004d29 100%
  );
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderEyebrow = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  letter-spacing: 0.08em;
  opacity: 0.8;
  text-transform: uppercase;
`;

const StyledHeaderTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledHeaderMeta = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  opacity: 0.9;
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledBottomNav = styled.nav`
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${PARKS_BRAND.borderSoft};
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 8px 4px calc(8px + env(safe-area-inset-bottom, 0px));
  position: sticky;
  z-index: 2;
`;

const StyledNavButton = styled.button<{ $active: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  color: ${({ $active }) =>
    $active ? PARKS_BRAND.primary : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-size: 11px;
  font-weight: ${({ $active }) =>
    $active
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.regular};
  gap: 4px;
  justify-content: center;
  min-height: 56px;
  padding: 6px 4px;
`;

const isTourRelevantStage = (stage?: string | null): boolean => {
  if (!stage) {
    return false;
  }

  return (PARKS_LO_CAMPO_TOUR_STAGES as readonly string[]).includes(stage);
};

export const ParksLoCampoContent = () => {
  const { displayName } = useParksAccess();
  const { records, loading, error } = useParksOpportunities();
  const [activeTab, setActiveTab] = useState<CampoTab>('hoy');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<ParksOpportunityRecord>>
  >({});

  const deals = useMemo(() => {
    const source = records ?? EMPTY_OPPORTUNITIES;

    const withLocalState = source.map((deal) => ({
      ...deal,
      ...localUpdates[deal.id],
    }));

    const assigned = withLocalState.filter((deal) =>
      isParksOpportunityAssignedToViewer(deal, displayName),
    );

    const pool = assigned.length > 0 ? assigned : withLocalState;

    return [...pool].sort((left, right) => {
      const leftTour = isTourRelevantStage(left.stage) ? 0 : 1;
      const rightTour = isTourRelevantStage(right.stage) ? 0 : 1;

      if (leftTour !== rightTour) {
        return leftTour - rightTour;
      }

      return (right.updatedAt ?? '').localeCompare(left.updatedAt ?? '');
    });
  }, [displayName, localUpdates, records]);

  const selectedDeal =
    deals.find((deal) => deal.id === selectedDealId) ?? deals[0] ?? null;

  const resolvedSelectedId = selectedDeal?.id ?? null;

  const tourReadyCount = deals.filter(
    (deal) =>
      isTourRelevantStage(deal.stage) ||
      isDefined(deal.tourFecha) ||
      isDefined(deal.naveVinculada),
  ).length;

  const handledCount = deals.filter(
    (deal) =>
      (deal.tourFeedback?.trim().length ?? 0) > 0 ||
      (deal.tourProximosPasos?.trim().length ?? 0) > 0,
  ).length;

  const inVisitCount = deals.filter((deal) =>
    isTourRelevantStage(deal.stage),
  ).length;

  const handleSelectDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setActiveTab('tour');
  };

  const handleDealSaved = (update: Partial<ParksOpportunityRecord>) => {
    if (!resolvedSelectedId) {
      return;
    }

    setLocalUpdates((current) => ({
      ...current,
      [resolvedSelectedId]: {
        ...current[resolvedSelectedId],
        ...update,
      },
    }));
  };

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (error) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar la app de campo`}
        description={t`Recarga o vuelve a iniciar sesión para ver tus deals.`}
      />
    );
  }

  return (
    <StyledApp>
      <StyledPhoneFrame>
        <StyledHeader>
          <StyledHeaderEyebrow>{t`App de campo · LO`}</StyledHeaderEyebrow>
          <StyledHeaderTitle>{t`Tour en vivo`}</StyledHeaderTitle>
          <StyledHeaderMeta>
            {displayName
              ? t`Hola ${displayName} — captura feedback sin abrir el CRM de escritorio.`
              : t`Captura feedback y guión sin abrir el CRM de escritorio.`}
          </StyledHeaderMeta>
        </StyledHeader>

        <StyledBody>
          {activeTab !== 'hoy' && deals.length > 0 ? (
            <ParksLoCampoDealPicker
              deals={deals}
              selectedDealId={resolvedSelectedId}
              onSelectDeal={(dealId) => setSelectedDealId(dealId)}
            />
          ) : null}

          {activeTab === 'hoy' ? (
            <ParksLoCampoHoyTab
              deals={deals}
              tourReadyCount={tourReadyCount}
              handledCount={handledCount}
              inVisitCount={inVisitCount}
              onSelectDeal={handleSelectDeal}
            />
          ) : null}

          {activeTab === 'tour' ? (
            selectedDeal ? (
              <ParksLoCampoTourNotes
                key={selectedDeal.id}
                deal={selectedDeal}
                onSaved={handleDealSaved}
              />
            ) : (
              <ParksEmptyState
                title={t`Selecciona un deal`}
                description={t`Elige un deal en Hoy para anotar comentarios y recomendaciones del tour.`}
              />
            )
          ) : null}

          {activeTab === 'guion' ? (
            selectedDeal ? (
              <ParksLoCampoScript key={selectedDeal.id} deal={selectedDeal} />
            ) : (
              <ParksEmptyState
                title={t`Selecciona un deal`}
                description={t`El guión comercial se genera con la nave del deal seleccionado.`}
              />
            )
          ) : null}

          {activeTab === 'checklist' ? <ParksLoCampoChecklist /> : null}
        </StyledBody>

        <StyledBottomNav aria-label={t`Navegación app de campo`}>
          <StyledNavButton
            type="button"
            $active={activeTab === 'hoy'}
            onClick={() => setActiveTab('hoy')}
          >
            <IconMap size={20} />
            {t`Hoy`}
          </StyledNavButton>
          <StyledNavButton
            type="button"
            $active={activeTab === 'tour'}
            onClick={() => setActiveTab('tour')}
          >
            <IconNotes size={20} />
            {t`Tour`}
          </StyledNavButton>
          <StyledNavButton
            type="button"
            $active={activeTab === 'guion'}
            onClick={() => setActiveTab('guion')}
          >
            <IconFileText size={20} />
            {t`Guión`}
          </StyledNavButton>
          <StyledNavButton
            type="button"
            $active={activeTab === 'checklist'}
            onClick={() => setActiveTab('checklist')}
          >
            <IconListCheck size={20} />
            {t`Check`}
          </StyledNavButton>
        </StyledBottomNav>
      </StyledPhoneFrame>
    </StyledApp>
  );
};
