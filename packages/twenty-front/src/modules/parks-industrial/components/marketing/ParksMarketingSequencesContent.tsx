import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconMail, IconPencil, IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { ParksResponsiveSheet } from '@/parks-industrial/components/ui/ParksResponsiveSheet';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  PARKS_MARKETING_NURTURE_TEMPLATES,
  type ParksMarketingNurtureTemplate,
} from '@/parks-industrial/constants/parks-marketing-demo.constants';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

const StyledIntro = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledSequenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledSequenceRow = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSequenceTitle = styled.h4`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[1]};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledStat = styled.div`
  min-width: 72px;
`;

const StyledStatLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledStatValue = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSheetPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledSheetHeader = styled.div`
  align-items: flex-start;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSheetTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledSheetBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledStepList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledStepCard = styled.li`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledStepSubject = styled.div`
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledDisabledNote = styled.p`
  background: ${themeCssVariables.background.transparent.orange};
  border: 1px solid ${themeCssVariables.color.orange3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0 0 ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

export const ParksMarketingSequencesContent = () => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ParksMarketingNurtureTemplate | null>(null);

  return (
    <StyledParksPageStack>
      <StyledIntro>
        {t`Secuencias de nutrición por canal (digital, LinkedIn, brokers, eventos). Puedes revisar el contenido; la edición quedará disponible en una siguiente iteración.`}
      </StyledIntro>

      <ParksSectionCard title={t`Plantillas de nutrición`} accent="blue">
        <StyledSequenceList>
          {PARKS_MARKETING_NURTURE_TEMPLATES.map((template) => (
            <StyledSequenceRow key={template.id}>
              <div>
                <StyledSequenceTitle>{template.name}</StyledSequenceTitle>
                <StyledMeta>
                  {template.channel} · {template.audience}
                </StyledMeta>
                <div style={{ marginTop: 8 }}>
                  <ParksStatusBadge
                    label={
                      template.status === 'activa' ? t`Activa` : t`Borrador`
                    }
                    color={template.status === 'activa' ? 'green' : 'gray'}
                  />
                </div>
              </div>
              <StyledStats>
                <StyledStat>
                  <StyledStatLabel>{t`Pasos`}</StyledStatLabel>
                  <StyledStatValue>{template.stepsCount}</StyledStatValue>
                </StyledStat>
                <StyledStat>
                  <StyledStatLabel>{t`Activas`}</StyledStatLabel>
                  <StyledStatValue>
                    {formatParksNumber(template.activeSequences)}
                  </StyledStatValue>
                </StyledStat>
                <StyledStat>
                  <StyledStatLabel>{t`Open`}</StyledStatLabel>
                  <StyledStatValue>{template.openRatePct}%</StyledStatValue>
                </StyledStat>
                <StyledStat>
                  <StyledStatLabel>{t`Reply`}</StyledStatLabel>
                  <StyledStatValue>{template.replyRatePct}%</StyledStatValue>
                </StyledStat>
              </StyledStats>
              <StyledActions>
                <ParksActionButton
                  title={t`Ver secuencia`}
                  Icon={IconMail}
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedTemplate(template)}
                />
                <ParksActionButton
                  title={t`Editar (próximamente)`}
                  Icon={IconPencil}
                  variant="ghost"
                  size="sm"
                  disabled
                />
              </StyledActions>
            </StyledSequenceRow>
          ))}
        </StyledSequenceList>
      </ParksSectionCard>

      <ParksResponsiveSheet
        isOpen={selectedTemplate !== null}
        onClose={() => setSelectedTemplate(null)}
        focusId="parks-marketing-sequence-sheet"
        ariaLabelledBy="parks-marketing-sequence-title"
      >
        {selectedTemplate ? (
          <StyledSheetPanel>
            <StyledSheetHeader>
              <StyledSheetTitle id="parks-marketing-sequence-title">
                {selectedTemplate.name}
              </StyledSheetTitle>
              <StyledCloseButton
                type="button"
                aria-label={t`Cerrar`}
                onClick={() => setSelectedTemplate(null)}
              >
                <IconX size={16} />
              </StyledCloseButton>
            </StyledSheetHeader>
            <StyledSheetBody>
              <StyledDisabledNote>
                {t`Solo lectura por ahora. La edición de asuntos, delays y copy se habilitará cuando conectemos el editor de nutrición.`}
              </StyledDisabledNote>
              <StyledMeta style={{ marginBottom: 16 }}>
                {selectedTemplate.channel} · {selectedTemplate.audience} ·{' '}
                {selectedTemplate.stepsCount} {t`pasos`} · Open{' '}
                {selectedTemplate.openRatePct}% · Reply{' '}
                {selectedTemplate.replyRatePct}%
              </StyledMeta>
              <StyledStepList>
                {selectedTemplate.steps.map((step) => (
                  <StyledStepCard key={step.stepNumber}>
                    <StyledMeta>
                      {t`Paso`} {step.stepNumber} · {step.scheduledIn}
                    </StyledMeta>
                    <StyledStepSubject>{step.subject}</StyledStepSubject>
                    <StyledIntro>{step.preview}</StyledIntro>
                  </StyledStepCard>
                ))}
              </StyledStepList>
              <div style={{ marginTop: 16 }}>
                <ParksActionButton
                  title={t`Editar secuencia (próximamente)`}
                  Icon={IconPencil}
                  variant="secondary"
                  disabled
                  fullWidth
                />
              </div>
            </StyledSheetBody>
          </StyledSheetPanel>
        ) : null}
      </ParksResponsiveSheet>
    </StyledParksPageStack>
  );
};
