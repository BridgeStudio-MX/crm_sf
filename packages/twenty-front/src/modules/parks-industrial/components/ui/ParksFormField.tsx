import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

type ParksFormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

const StyledField = styled.div<{ fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  grid-column: ${({ fullWidth }) => (fullWidth ? '1 / -1' : 'auto')};
  min-width: 0;
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.35;
`;

const StyledError = styled.span`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
`;

export const StyledParksFieldGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

export const StyledParksFullWidthInput = styled.div`
  width: 100%;

  input,
  select,
  textarea {
    width: 100%;
  }
`;

export const ParksFormField = ({
  label,
  htmlFor,
  hint,
  error,
  children,
  fullWidth = false,
}: ParksFormFieldProps) => (
  <StyledField fullWidth={fullWidth}>
    <StyledLabel htmlFor={htmlFor}>{label}</StyledLabel>
    <StyledParksFullWidthInput>{children}</StyledParksFullWidthInput>
    {hint ? <StyledHint>{hint}</StyledHint> : null}
    {error ? <StyledError>{error}</StyledError> : null}
  </StyledField>
);
