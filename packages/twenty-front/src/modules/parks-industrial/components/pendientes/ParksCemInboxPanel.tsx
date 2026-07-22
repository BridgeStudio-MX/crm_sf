import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconCheck,
  IconFileText,
  IconUserPlus,
  IconX,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { resolveParksApproval } from '@/parks-industrial/services/parks-commercial.client';
import {
  type ParksCemInboxItem,
  type ParksCemInboxSummary,
} from '@/parks-industrial/types/parks-cem-inbox.types';

type ParksCemInboxPanelProps = {
  inbox: ParksCemInboxSummary;
  onResolved: () => void;
};

const getAccent = (kind: ParksCemInboxItem['kind']): string => {
  if (kind === 'lead-sin-asignar') {
    return themeCssVariables.color.blue;
  }

  if (kind === 'aprobacion-comercial') {
    return themeCssVariables.color.purple;
  }

  return themeCssVariables.color.green;
};

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledItem = styled.div<{ accent: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-left: 3px solid ${({ accent }) => accent};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledItemHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledItemTitle = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledItemSubtitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const StyledItemDetail = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
`;

const StyledMetaRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledSummary = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const getKindLabel = (kind: ParksCemInboxItem['kind']): string => {
  if (kind === 'lead-sin-asignar') {
    return t`Lead sin asignar`;
  }

  if (kind === 'aprobacion-comercial') {
    return t`Aprobación Director Comercial`;
  }

  return t`Firma hoja`;
};

const getKindIcon = (kind: ParksCemInboxItem['kind']) => {
  if (kind === 'lead-sin-asignar') {
    return IconUserPlus;
  }

  if (kind === 'aprobacion-comercial') {
    return IconCheck;
  }

  return IconFileText;
};

const getActionLinkLabel = (kind: ParksCemInboxItem['kind']): string => {
  if (kind === 'lead-sin-asignar') {
    return t`Ir a cola Director Comercial →`;
  }

  if (kind === 'firma-hoja') {
    return t`Ir a firmar →`;
  }

  return t`Ver detalle →`;
};

export const ParksCemInboxPanel = ({
  inbox,
  onResolved,
}: ParksCemInboxPanelProps) => {
  const { displayName } = useParksAccess();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResolve = async (
    item: ParksCemInboxItem,
    decision: 'Aprobada' | 'Rechazada',
  ) => {
    setBusyItemId(item.id);
    setErrorMessage(null);

    try {
      await resolveParksApproval({
        opportunityId: item.entityId,
        decision,
        resolvedBy: displayName || 'Director Comercial',
        comentario:
          decision === 'Aprobada'
            ? 'Aprobado desde Mis pendientes (Director Comercial)'
            : 'Rechazado desde Mis pendientes (Director Comercial)',
      });
      onResolved();
    } catch (resolveError) {
      setErrorMessage(
        resolveError instanceof Error
          ? resolveError.message
          : t`No se pudo resolver la acción`,
      );
    } finally {
      setBusyItemId(null);
    }
  };

  return (
    <ParksSectionCard
      title={t`Bandeja Director Comercial`}
      accent="yellow"
      action={
        <ParksStatusBadge
          label={
            inbox.total === 0
              ? t`Al día`
              : t`${inbox.total} pendiente${inbox.total === 1 ? '' : 's'}`
          }
          color={inbox.total === 0 ? 'green' : 'yellow'}
        />
      }
    >
      <StyledSummary>
        {t`${inbox.leadsSinAsignar} leads · ${inbox.aprobacionesComerciales} aprobaciones · ${inbox.firmasHoja} firmas hoja`}
      </StyledSummary>

      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}

      {inbox.items.length === 0 ? (
        <ParksEmptyState
          title={t`Sin acciones pendientes`}
          description={t`Leads por asignar, aprobaciones Director Comercial y firmas de Hoja aparecerán aquí.`}
        />
      ) : (
        <StyledList>
          {inbox.items.map((item) => {
            const KindIcon = getKindIcon(item.kind);
            const isBusy = busyItemId === item.id;

            return (
              <StyledItem key={item.id} accent={getAccent(item.kind)}>
                <StyledItemHeader>
                  <div>
                    <StyledItemTitle>
                      <KindIcon
                        size={14}
                        style={{ marginRight: 6, verticalAlign: 'middle' }}
                      />
                      {item.title}
                    </StyledItemTitle>
                    <StyledItemSubtitle>{item.subtitle}</StyledItemSubtitle>
                  </div>
                  <ParksStatusBadge
                    label={getKindLabel(item.kind)}
                    color={item.priority === 'high' ? 'red' : 'blue'}
                  />
                </StyledItemHeader>

                <StyledItemDetail>{item.detail}</StyledItemDetail>

                <StyledMetaRow>
                  {item.amountLabel ? (
                    <ParksStatusBadge label={item.amountLabel} color="blue" />
                  ) : null}
                </StyledMetaRow>

                <StyledActions>
                  {item.canResolve ? (
                    <>
                      <ParksActionButton
                        title={t`Aprobar`}
                        size="sm"
                        Icon={IconCheck}
                        disabled={isBusy}
                        onClick={() => void handleResolve(item, 'Aprobada')}
                      />
                      <ParksActionButton
                        title={t`Rechazar`}
                        size="sm"
                        variant="secondary"
                        Icon={IconX}
                        disabled={isBusy}
                        onClick={() => void handleResolve(item, 'Rechazada')}
                      />
                    </>
                  ) : null}
                  <StyledLink to={item.actionPath}>
                    {getActionLinkLabel(item.kind)}
                  </StyledLink>
                </StyledActions>
              </StyledItem>
            );
          })}
        </StyledList>
      )}
    </ParksSectionCard>
  );
};
