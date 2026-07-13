import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLegalPipelineCard } from '@/parks-industrial/components/legal/ParksLegalPipelineCard';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import { getParksLegalStageTheme } from '@/parks-industrial/utils/parks-format.util';

export type ParksLegalPipelineColumnStage = {
  id: string;
  label: string;
  estatus: string;
  responsable: string;
};

type ParksLegalPipelineColumnProps = {
  stage: ParksLegalPipelineColumnStage;
  casosLegales: ParksCasoLegalRecord[];
};

const StyledColumnWrapper = styled.div`
  flex-shrink: 0;
  min-width: 280px;
`;

const StyledColumnHeader = styled.div<{ accentColor: string; backgroundTint: string }>`
  background: linear-gradient(
    160deg,
    ${({ backgroundTint }) => backgroundTint} 0%,
    ${themeCssVariables.background.primary} 100%
  );
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  border-top: 4px solid ${({ accentColor }) => accentColor};
  box-shadow: ${themeCssVariables.boxShadow.light};
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledColumnTitleRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledColumnTitle = styled.strong`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.35;
`;

const StyledResponsable = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledColumnBody = styled.div<{ backgroundColor: string }>`
  background: ${({ backgroundColor }) => backgroundColor};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  max-height: 62vh;
  min-height: 320px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledEmptyHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
  text-align: center;
`;

export const ParksLegalPipelineColumn = ({
  stage,
  casosLegales,
}: ParksLegalPipelineColumnProps) => {
  const stageTheme = getParksLegalStageTheme(stage.id);
  const riesgoCount = casosLegales.filter(
    (casoLegal) =>
      casoLegal.semaforo === 'ROJO' || casoLegal.semaforo === 'NARANJA',
  ).length;

  return (
    <StyledColumnWrapper>
      <StyledColumnHeader
        accentColor={stageTheme.accent}
        backgroundTint={stageTheme.background}
      >
        <StyledColumnTitleRow>
          <div>
            <StyledColumnTitle>{stage.label}</StyledColumnTitle>
            <StyledResponsable>{stage.responsable}</StyledResponsable>
          </div>
          <Tag
            color="blue"
            text={String(casosLegales.length)}
            variant="solid"
            weight="medium"
          />
        </StyledColumnTitleRow>
        {riesgoCount > 0 ? (
          <StyledResponsable style={{ marginTop: 8 }}>
            {riesgoCount} {t`en riesgo`}
          </StyledResponsable>
        ) : null}
      </StyledColumnHeader>

      <StyledColumnBody backgroundColor={stageTheme.dragHighlight}>
        {casosLegales.length === 0 ? (
          <StyledEmptyHint>{t`Sin casos en esta etapa`}</StyledEmptyHint>
        ) : (
          casosLegales.map((casoLegal) => (
            <ParksLegalPipelineCard
              key={casoLegal.id}
              casoLegal={casoLegal}
              stageTheme={stageTheme}
            />
          ))
        )}
      </StyledColumnBody>
    </StyledColumnWrapper>
  );
};
