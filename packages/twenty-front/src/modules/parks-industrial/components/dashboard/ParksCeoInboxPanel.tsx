import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconCheck,
  IconFileText,
  IconReportMoney,
  IconX,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { resolveParksCeoInboxItem } from '@/parks-industrial/services/parks-ceo.client';
import {
  type ParksCeoInboxItem,
  type ParksCeoInboxSummary,
} from '@/parks-industrial/types/parks-ceo-dashboard.types';

type ParksCeoInboxPanelProps = {
  inbox: ParksCeoInboxSummary;
  onResolved: () => void;
};

const getAccent = (kind: ParksCeoInboxItem['kind']): string => {
  if (kind === 'aprobacion-comercial') {
    return themeCssVariables.color.purple;
  }

  if (kind === 'condonacion-holdover') {
    return themeCssVariables.color.orange;
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

const getKindLabel = (kind: ParksCeoInboxItem['kind']): string => {
  if (kind === 'aprobacion-comercial') {
    return t`Aprobación comercial`;
  }

  if (kind === 'condonacion-holdover') {
    return t`Condonación`;
  }

  return t`Firma`;
};

const getKindIcon = (kind: ParksCeoInboxItem['kind']) => {
  if (kind === 'aprobacion-comercial') {
    return IconReportMoney;
  }

  if (kind === 'condonacion-holdover') {
    return IconCheck;
  }

  return IconFileText;
};

export const ParksCeoInboxPanel = ({
  inbox,
  onResolved,
}: ParksCeoInboxPanelProps) => {
  const { displayName } = useParksAccess();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResolve = async (
    item: ParksCeoInboxItem,
    decision: 'Aprobada' | 'Rechazada',
  ) => {
    setBusyItemId(item.id);
    setErrorMessage(null);

    try {
      await resolveParksCeoInboxItem({
        item,
        decision,
        resolvedBy: displayName || 'CEO',
        comentario:
          decision === 'Aprobada'
            ? 'Aprobado desde Command Center CEO'
            : 'Rechazado desde Command Center CEO',
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
      title={t`Aprobaciones y firmas`}
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
        {t`${inbox.aprobacionesComerciales} comerciales · ${inbox.condonaciones} condonaciones · ${inbox.firmas} firmas`}
        {inbox.items.some((item) => item.isDemo) ? ` · ${t`demo`}` : ''}
      </StyledSummary>

      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}

      {inbox.items.length === 0 ? (
        <ParksEmptyState
          title={t`Sin acciones pendientes`}
          description={t`Cuando Comercial o Legal te pidan aprobación o firma, aparecerán aquí.`}
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
                    {item.kind === 'firma-contrato'
                      ? t`Ir a firmar →`
                      : t`Ver detalle →`}
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
