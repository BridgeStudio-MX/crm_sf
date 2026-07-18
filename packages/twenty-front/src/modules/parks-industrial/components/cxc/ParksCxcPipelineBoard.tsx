import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCxcPipelineCard } from '@/parks-industrial/components/cxc/ParksCxcPipelineCard';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import {
  CXC_PIPELINE_STAGES,
  resolveCxcPipelineStage,
} from '@/parks-industrial/constants/parks-cxc-pipeline.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type CxcAccount } from '@/parks-industrial/types/parks-cxc.types';

type ParksCxcPipelineBoardProps = {
  accounts: CxcAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
};

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledBoard = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  overflow-x: auto;
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledColumn = styled.section`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  max-height: calc(100vh - 280px);
  min-width: 260px;
  overflow: hidden;
  width: 260px;
`;

const StyledColumnHeader = styled.header`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledColumnTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  justify-content: space-between;
`;

const StyledCount = styled.span`
  background: ${PARKS_BRAND.primarySoft};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 2px 8px;
`;

const StyledColumnDesc = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.35;
`;

const StyledColumnBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

export const ParksCxcPipelineBoard = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
}: ParksCxcPipelineBoardProps) => {
  const byStage = useMemo(() => {
    const map = new Map<string, CxcAccount[]>();

    for (const stage of CXC_PIPELINE_STAGES) {
      map.set(stage.id, []);
    }

    for (const account of accounts) {
      const stageId = resolveCxcPipelineStage(account);
      const list = map.get(stageId) ?? [];
      list.push(account);
      map.set(stageId, list);
    }

    return map;
  }, [accounts]);

  if (accounts.length === 0) {
    return (
      <ParksEmptyState
        title={t`Sin cuentas en pipeline CxC`}
        description={t`Cuando Legal marca un contrato como firmado, aparece aquí en Recibido Legal.`}
      />
    );
  }

  return (
    <StyledLayout>
      <StyledHint>
        {t`Pipeline Legal → Cobranza: del handoff del contrato firmado hasta salida. Haz clic en una tarjeta para ver expediente completo.`}
      </StyledHint>
      <StyledBoard>
        {CXC_PIPELINE_STAGES.map((stage) => {
          const columnAccounts = byStage.get(stage.id) ?? [];

          return (
            <StyledColumn key={stage.id}>
              <StyledColumnHeader>
                <StyledColumnTitle>
                  {stage.label}
                  <StyledCount>{columnAccounts.length}</StyledCount>
                </StyledColumnTitle>
                <StyledColumnDesc>{stage.description}</StyledColumnDesc>
              </StyledColumnHeader>
              <StyledColumnBody>
                {columnAccounts.length === 0 ? (
                  <StyledHint>{t`Vacío`}</StyledHint>
                ) : (
                  columnAccounts.map((account) => (
                    <ParksCxcPipelineCard
                      key={account.id}
                      account={account}
                      selected={account.id === selectedAccountId}
                      onSelect={onSelectAccount}
                    />
                  ))
                )}
              </StyledColumnBody>
            </StyledColumn>
          );
        })}
      </StyledBoard>
    </StyledLayout>
  );
};
