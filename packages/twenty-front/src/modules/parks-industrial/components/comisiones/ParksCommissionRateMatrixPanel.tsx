import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksInput } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksCommissionRateMatrix } from '@/parks-industrial/services/parks-commission.client';

const MATRIX_ROWS = [
  {
    key: 'DIRECTO',
    label: 'Directo',
    hint: 'Bono LO interno',
  },
  {
    key: 'BROKER_TOP_10',
    label: 'Broker Top 10',
    hint: 'Socios estratégicos',
  },
  {
    key: 'BROKER_NO_TOP_10',
    label: 'Fuera Top 10',
    hint: 'Brokers estándar',
  },
] as const;

const MATRIX_COLUMNS = [
  {
    key: 'nuevoConstruida',
    label: 'Nuevo · construida',
  },
  {
    key: 'nuevoPreventa',
    label: 'Nuevo · preventa',
  },
  {
    key: 'renovacion',
    label: 'Renovación',
  },
] as const;

type MatrixColumnKey = (typeof MATRIX_COLUMNS)[number]['key'];
type MatrixOrigenKey = (typeof MATRIX_ROWS)[number]['key'];

const StyledIntro = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0 0 ${themeCssVariables.spacing[3]};
`;

const StyledTableShell = styled.div`
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledTableScroll = styled.div`
  overflow-x: auto;
`;

const StyledMatrixTable = styled.table`
  border-collapse: collapse;
  min-width: 640px;
  width: 100%;
`;

const StyledTh = styled.th`
  background: ${PARKS_BRAND.primarySoft};
  border-bottom: 1px solid ${PARKS_BRAND.borderSoft};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;

  &[data-align='right'] {
    text-align: right;
  }
`;

const StyledTd = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  vertical-align: middle;

  tr:last-child & {
    border-bottom: none;
  }

  &[data-align='right'] {
    text-align: right;
  }
`;

const StyledRow = styled.tr`
  background: ${themeCssVariables.background.primary};

  &:nth-child(even) {
    background: ${themeCssVariables.background.secondary};
  }
`;

const StyledOrigenLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledOrigenHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const StyledRateCell = styled.div`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  max-width: 140px;
  margin-left: auto;
`;

const StyledRateInput = styled(StyledParksInput)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  max-width: 96px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: right;
  width: 100%;
`;

const StyledRateValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-feature-settings: 'tnum';
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledPercent = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledFeedback = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const getCellValue = (
  matrix: ParksCommissionRateMatrix,
  origenKey: MatrixOrigenKey,
  columnKey: MatrixColumnKey,
): number => {
  if (columnKey === 'nuevoConstruida') {
    return matrix[origenKey].NUEVO.CONSTRUIDA ?? 0;
  }

  if (columnKey === 'nuevoPreventa') {
    return matrix[origenKey].NUEVO.POR_CONSTRUIR ?? 0;
  }

  return matrix[origenKey].RENOVACION.rate ?? 0;
};

const setCellValue = (
  matrix: ParksCommissionRateMatrix,
  origenKey: MatrixOrigenKey,
  columnKey: MatrixColumnKey,
  value: number,
): ParksCommissionRateMatrix => {
  if (columnKey === 'nuevoConstruida') {
    return {
      ...matrix,
      [origenKey]: {
        ...matrix[origenKey],
        NUEVO: {
          ...matrix[origenKey].NUEVO,
          CONSTRUIDA: value,
        },
      },
    };
  }

  if (columnKey === 'nuevoPreventa') {
    return {
      ...matrix,
      [origenKey]: {
        ...matrix[origenKey],
        NUEVO: {
          ...matrix[origenKey].NUEVO,
          POR_CONSTRUIR: value,
        },
      },
    };
  }

  return {
    ...matrix,
    [origenKey]: {
      ...matrix[origenKey],
      RENOVACION: {
        rate: value,
      },
    },
  };
};

type ParksCommissionRateMatrixPanelProps = {
  matrix: ParksCommissionRateMatrix;
  readOnly?: boolean;
  isBusy?: boolean;
  message?: string | null;
  error?: string | null;
  onChange?: (matrix: ParksCommissionRateMatrix) => void;
  onSave?: () => void;
};

export const ParksCommissionRateMatrixPanel = ({
  matrix,
  readOnly = false,
  isBusy = false,
  message = null,
  error = null,
  onChange,
  onSave,
}: ParksCommissionRateMatrixPanelProps) => (
  <ParksSectionCard
    title={
      readOnly ? t`Matriz vigente (solo lectura)` : t`Matriz de tasas`
    }
    accent={readOnly ? 'blue' : 'purple'}
  >
    <StyledIntro>
      {readOnly
        ? t`Tasas vigentes por origen del deal, tipo de contrato y estatus de nave.`
        : t`Ajusta el % por origen. Al guardar se recalculan las comisiones pendientes de autorizar.`}
    </StyledIntro>

    <StyledTableShell>
      <StyledTableScroll>
        <StyledMatrixTable>
          <thead>
            <tr>
              <StyledTh>{t`Origen`}</StyledTh>
              {MATRIX_COLUMNS.map((column) => (
                <StyledTh key={column.key} data-align="right">
                  {column.label}
                </StyledTh>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_ROWS.map((row) => (
              <StyledRow key={row.key}>
                <StyledTd>
                  <StyledOrigenLabel>{row.label}</StyledOrigenLabel>
                  <StyledOrigenHint>{row.hint}</StyledOrigenHint>
                </StyledTd>
                {MATRIX_COLUMNS.map((column) => {
                  const value = getCellValue(matrix, row.key, column.key);

                  return (
                    <StyledTd key={column.key} data-align="right">
                      {readOnly ? (
                        <StyledRateCell>
                          <StyledRateValue>{value}</StyledRateValue>
                          <StyledPercent>%</StyledPercent>
                        </StyledRateCell>
                      ) : (
                        <StyledRateCell>
                          <StyledRateInput
                            type="number"
                            step="0.25"
                            min="0"
                            aria-label={`${row.label} · ${column.label}`}
                            value={value}
                            onChange={(event) =>
                              onChange?.(
                                setCellValue(
                                  matrix,
                                  row.key,
                                  column.key,
                                  Number(event.target.value),
                                ),
                              )
                            }
                          />
                          <StyledPercent>%</StyledPercent>
                        </StyledRateCell>
                      )}
                    </StyledTd>
                  );
                })}
              </StyledRow>
            ))}
          </tbody>
        </StyledMatrixTable>
      </StyledTableScroll>
    </StyledTableShell>

    {!readOnly ? (
      <StyledFooter>
        <StyledFeedback>
          {message ? (
            <ParksStatusBadge color="green" label={message} />
          ) : null}
          {error ? <StyledError>{error}</StyledError> : null}
        </StyledFeedback>
        <ParksActionButton
          title={isBusy ? t`Guardando…` : t`Guardar matriz y recalcular`}
          disabled={isBusy}
          onClick={() => onSave?.()}
        />
      </StyledFooter>
    ) : null}
  </ParksSectionCard>
);
