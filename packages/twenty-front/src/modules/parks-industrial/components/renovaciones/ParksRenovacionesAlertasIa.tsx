import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { IconBrain } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_BRAND,
  PARKS_VISUAL_THEME,
  type ParksVisualAccent,
} from '@/parks-industrial/constants/parks-theme.constants';
import {
  buildParksRenovacionAlertBuckets,
  type ParksRenovacionQueueItem,
} from '@/parks-industrial/utils/parks-renovaciones.util';

type ParksRenovacionesAlertasIaProps = {
  queue: ParksRenovacionQueueItem[];
};

const StyledSection = styled.section`
  background: linear-gradient(
    145deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 70%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIaBadge = styled.span`
  align-items: center;
  background: ${PARKS_BRAND.accent};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: #111;
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 28px;
  justify-content: center;
  letter-spacing: 0.04em;
  width: 32px;
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: ${themeCssVariables.spacing[1]} 0 0;
  max-width: 560px;
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`;

const StyledBucket = styled.div<{ accent: ParksVisualAccent }>`
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].backgroundGradient};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledBucketLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledBucketValue = styled.div<{ accent: ParksVisualAccent }>`
  color: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
`;

const StyledBucketHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const bucketAccent = (
  months: 12 | 6 | 3 | 1,
  count: number,
): ParksVisualAccent => {
  if (count === 0) {
    return 'gray';
  }

  switch (months) {
    case 1:
      return 'red';
    case 3:
      return 'orange';
    case 6:
      return 'yellow';
    case 12:
      return 'blue';
  }
};

export const ParksRenovacionesAlertasIa = ({
  queue,
}: ParksRenovacionesAlertasIaProps) => {
  const buckets = useMemo(
    () => buildParksRenovacionAlertBuckets(queue),
    [queue],
  );

  return (
    <StyledSection>
      <StyledHeader>
        <div>
          <StyledTitleRow>
            <StyledIaBadge>IA</StyledIaBadge>
            <StyledTitle>{t`Alertas de renovación`}</StyledTitle>
          </StyledTitleRow>
          <StyledSubtitle>
            {t`Avisos automáticos a 12 / 6 / 3 / 1 mes del vencimiento para Comercial, Director Comercial, CEO y Legal según el umbral.`}
          </StyledSubtitle>
        </div>
        <IconBrain size={22} color={PARKS_BRAND.primary} />
      </StyledHeader>
      <StyledGrid>
        {buckets.map((bucket) => {
          const accent = bucketAccent(bucket.monthsBefore, bucket.count);

          return (
            <StyledBucket key={bucket.monthsBefore} accent={accent}>
              <StyledBucketLabel>
                {bucket.monthsBefore === 1
                  ? t`1 mes`
                  : t`${bucket.monthsBefore} meses`}
              </StyledBucketLabel>
              <StyledBucketValue accent={accent}>
                {bucket.count}
              </StyledBucketValue>
              <StyledBucketHint>{bucket.audienceHint}</StyledBucketHint>
            </StyledBucket>
          );
        })}
      </StyledGrid>
    </StyledSection>
  );
};
