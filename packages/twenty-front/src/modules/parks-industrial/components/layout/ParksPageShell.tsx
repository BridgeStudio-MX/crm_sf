import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { ParksAiAssistantButton } from '@/parks-industrial/components/ai/ParksAiAssistantButton';
import { ParksAiPanel } from '@/parks-industrial/components/ai/ParksAiPanel';
import { ParksAiAssistantProvider } from '@/parks-industrial/hooks/useParksAiAssistant';
import { StyledParksPageSubtitle } from '@/parks-industrial/components/ui/ParksPageSubtitle';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ParksPageShellProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
};

const StyledContent = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const ParksPageShell = ({
  title,
  subtitle,
  icon,
  children,
}: ParksPageShellProps) => (
  <ParksAiAssistantProvider>
    <PageCardLayout
      header={
        <PageCardHeader
          title={title}
          icon={icon}
          actionButton={
            <StyledHeaderActions>
              <ParksAiAssistantButton />
              <SidePanelToggleButton />
            </StyledHeaderActions>
          }
        />
      }
    >
      <StyledContent>
        {subtitle ? (
          <StyledParksPageSubtitle>{subtitle}</StyledParksPageSubtitle>
        ) : null}
        {children}
      </StyledContent>
    </PageCardLayout>
    <ParksAiPanel />
  </ParksAiAssistantProvider>
);
