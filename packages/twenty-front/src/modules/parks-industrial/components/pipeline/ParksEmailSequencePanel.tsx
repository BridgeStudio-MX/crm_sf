import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconMail } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { useParksEmailSequence } from '@/parks-industrial/hooks/useParksEmailSequence';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledStepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledStep = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledStepTitle = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledStepPreview = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
  margin: 0;
`;

const StyledStepMeta = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type ParksEmailSequencePanelProps = {
  opportunityId: string;
  companyName: string;
  industryHint?: string;
};

export const ParksEmailSequencePanel = ({
  opportunityId,
  companyName,
  industryHint,
}: ParksEmailSequencePanelProps) => {
  const { sequence, loading, error } = useParksEmailSequence({
    opportunityId,
    companyName,
    industryHint,
  });

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (error || !sequence) {
    return null;
  }

  return (
    <StyledPanel>
      <StyledHeader>
        <IconMail size={16} />
        {t`Secuencia nurture (${sequence.industry})`}
      </StyledHeader>
      <StyledStepList>
        {sequence.steps.map((step) => (
          <StyledStep key={step.stepNumber}>
            <StyledStepTitle>{step.subject}</StyledStepTitle>
            <StyledStepPreview>{step.preview}</StyledStepPreview>
            <StyledStepMeta>
              <ParksStatusBadge
                color={step.status === 'sent' ? 'green' : 'yellow'}
                label={
                  step.status === 'sent'
                    ? t`Enviado · ${step.scheduledIn}`
                    : t`Programado · ${step.scheduledIn}`
                }
              />
            </StyledStepMeta>
          </StyledStep>
        ))}
      </StyledStepList>
    </StyledPanel>
  );
};
