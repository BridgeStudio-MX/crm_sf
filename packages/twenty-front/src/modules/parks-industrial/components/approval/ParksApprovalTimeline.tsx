import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IconArrowsSplit2,
  IconFileCheck,
  IconListCheck,
  IconProgressCheck,
  IconShield,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksApprovalCaseHero } from '@/parks-industrial/components/approval/ParksApprovalCaseHero';
import { ParksApprovalSummaryCard } from '@/parks-industrial/components/approval/ParksApprovalSummaryCard';
import { ParksApprovalWorkflowTimeline } from '@/parks-industrial/components/approval/ParksApprovalWorkflowTimeline';
import { ParksAiQuickActions } from '@/parks-industrial/components/ai/ParksAiQuickActions';
import { ParksDocumentValidationPanel } from '@/parks-industrial/components/legal/ParksDocumentValidationPanel';
import { ParksLegalActaRestitucionPanel } from '@/parks-industrial/components/legal/ParksLegalActaRestitucionPanel';
import { ParksLegalChecklistPanel } from '@/parks-industrial/components/legal/ParksLegalChecklistPanel';
import { ParksLegalFirmasPanel } from '@/parks-industrial/components/legal/ParksLegalFirmasPanel';
import { ParksLegalLawyerPanel } from '@/parks-industrial/components/legal/ParksLegalLawyerPanel';
import { ParksLegalSlaPanel } from '@/parks-industrial/components/legal/ParksLegalSlaPanel';
import { ParksLegalVersionPanel } from '@/parks-industrial/components/legal/ParksLegalVersionPanel';
import { ParksContractEditorPanel } from '@/parks-industrial/components/legal/ParksContractEditorPanel';
import { ParksCxcHandoffPanel } from '@/parks-industrial/components/operations/ParksCxcHandoffPanel';
import {
  ParksPageTabs,
  type ParksPageTab,
} from '@/parks-industrial/components/ui/ParksPageTabs';
import {
  ParksSectionCard,
  StyledParksPageStack,
  StyledParksTwoColumnGrid,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { buildLegalWorkflowTimeline } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksAiAssistant } from '@/parks-industrial/hooks/useParksAiAssistant';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import { type DocumentValidationResult } from '@/parks-industrial/types/parks-legal.types';
import { buildParksApprovalQuickActions } from '@/parks-industrial/utils/parks-ai-quick-actions.util';
import { parseParksApprovalComments } from '@/parks-industrial/utils/parks-format.util';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

type ApprovalTab =
  | 'workflow'
  | 'elaboracion'
  | 'firma'
  | 'operaciones'
  | 'validacion';

const StyledMainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-width: 0;
`;

const StyledSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-width: 0;
`;

const StyledCommentHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCommentItem = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledPanelsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const mapValidationToSemaforo = (
  result: DocumentValidationResult,
): string => {
  if (result.overallStatus === 'green') {
    return 'VERDE';
  }

  if (result.overallStatus === 'yellow') {
    return 'AMARILLO';
  }

  return 'ROJO';
};

type ParksApprovalTimelineProps = {
  casoLegal: ParksCasoLegalRecord;
};

export const ParksApprovalTimeline = ({
  casoLegal,
}: ParksApprovalTimelineProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<ApprovalTab>('workflow');
  const { updateOneRecord } = useUpdateOneRecord();
  const { setContextPatch } = useParksAiAssistant();
  const { canEditLegalWorkflow, canAssignLegalLawyer } = useParksAccess();

  const handleWorkflowUpdated = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    setContextPatch({
      screen: 'approval',
      casoLegalId: casoLegal.id,
    });
  }, [casoLegal.id, setContextPatch]);

  const timeline = buildLegalWorkflowTimeline(casoLegal.estatus);
  const commentHistory = parseParksApprovalComments(casoLegal.notasCatalina);

  const tabs = useMemo(() => {
    const availableTabs: ParksPageTab<ApprovalTab>[] = [
      {
        id: 'workflow',
        label: t`Workflow`,
        icon: IconProgressCheck,
      },
    ];

    if (canEditLegalWorkflow) {
      availableTabs.push(
        {
          id: 'elaboracion',
          label: t`Elaboración`,
          icon: IconListCheck,
        },
        {
          id: 'firma',
          label: t`Firma`,
          icon: IconFileCheck,
        },
        {
          id: 'validacion',
          label: t`Validación`,
          icon: IconShield,
        },
      );
    }

    availableTabs.push({
      id: 'operaciones',
      label: t`Operaciones`,
      icon: IconArrowsSplit2,
    });

    if (commentHistory.length > 0) {
      const workflowTab = availableTabs.find((tab) => tab.id === 'workflow');

      if (workflowTab) {
        workflowTab.count = commentHistory.length;
      }
    }

    return availableTabs;
  }, [canEditLegalWorkflow, commentHistory.length]);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('workflow');
    }
  }, [activeTab, tabs]);

  const handleValidationComplete = async (result: DocumentValidationResult) => {
    await updateOneRecord({
      objectNameSingular: 'casoLegal',
      idToUpdate: casoLegal.id,
      updateOneRecordInput: {
        semaforo: mapValidationToSemaforo(result),
      },
    });
  };

  const renderTabContent = () => {
    if (activeTab === 'workflow') {
      return (
        <>
          <ParksApprovalWorkflowTimeline timeline={timeline} embedded />
          {commentHistory.length > 0 ? (
            <ParksSectionCard title={t`Historial de comentarios`} accent="gray">
              <StyledCommentHistory>
                {commentHistory.map((comment, index) => (
                  <StyledCommentItem key={`${comment}-${index}`}>
                    {comment}
                  </StyledCommentItem>
                ))}
              </StyledCommentHistory>
            </ParksSectionCard>
          ) : null}
        </>
      );
    }

    if (activeTab === 'elaboracion' && canEditLegalWorkflow) {
      return (
        <StyledPanelsStack>
          <ParksLegalChecklistPanel
            key={`checklist-${refreshKey}`}
            casoLegalId={casoLegal.id}
            onUpdated={handleWorkflowUpdated}
          />
          {canAssignLegalLawyer ? (
            <ParksLegalLawyerPanel
              key={`lawyer-${refreshKey}`}
              casoLegalId={casoLegal.id}
              onUpdated={handleWorkflowUpdated}
            />
          ) : null}
          <ParksLegalVersionPanel
            key={`versions-${refreshKey}`}
            casoLegalId={casoLegal.id}
            onUpdated={handleWorkflowUpdated}
          />
          <ParksContractEditorPanel casoLegalId={casoLegal.id} />
        </StyledPanelsStack>
      );
    }

    if (activeTab === 'firma' && canEditLegalWorkflow) {
      return (
        <StyledPanelsStack>
          <ParksLegalFirmasPanel
            key={`firmas-${refreshKey}`}
            casoLegalId={casoLegal.id}
            cotejoAprobado={casoLegal.cotejoAprobado}
            onUpdated={handleWorkflowUpdated}
          />
          <ParksLegalActaRestitucionPanel casoLegal={casoLegal} />
        </StyledPanelsStack>
      );
    }

    if (activeTab === 'operaciones') {
      return (
        <StyledPanelsStack>
          {canEditLegalWorkflow ? (
            <ParksLegalSlaPanel casoLegalId={casoLegal.id} />
          ) : null}
          <ParksCxcHandoffPanel
            casoLegalId={casoLegal.id}
            referencia={casoLegal.referencia}
          />
        </StyledPanelsStack>
      );
    }

    if (activeTab === 'validacion' && canEditLegalWorkflow) {
      return (
        <ParksDocumentValidationPanel
          casoLegalId={casoLegal.id}
          onValidationComplete={(result) =>
            void handleValidationComplete(result)
          }
        />
      );
    }

    return null;
  };

  return (
    <StyledParksPageStack>
      <ParksApprovalCaseHero casoLegal={casoLegal} timeline={timeline} />

      <ParksAiQuickActions actions={buildParksApprovalQuickActions()} />

      <StyledParksTwoColumnGrid>
        <StyledMainColumn>
          <ParksPageTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            ariaLabel={t`Secciones de aprobación`}
          >
            {renderTabContent()}
          </ParksPageTabs>
        </StyledMainColumn>

        <StyledSidebar>
          <ParksApprovalSummaryCard casoLegal={casoLegal} />
        </StyledSidebar>
      </StyledParksTwoColumnGrid>
    </StyledParksPageStack>
  );
};
