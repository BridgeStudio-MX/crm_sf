import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useRef, type ChangeEvent } from 'react';
import {
  IconAlertTriangle,
  IconCheck,
  IconCircle,
  IconFileText,
  IconSparkles,
  IconUpload,
  IconX,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  type DocumentValidationSeverity,
  type LegalChecklistItem,
} from '@/parks-industrial/types/parks-legal.types';

const StyledRow = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledRowTop = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHiddenFileInput = styled.input`
  display: none;
`;

const StyledFileChip = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  max-width: 100%;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledFileName = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledClearFileButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: inline-flex;
  padding: 2px;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledVigenciaBanner = styled.div<{ isExpired: boolean }>`
  align-items: center;
  background: ${({ isExpired }) =>
    isExpired
      ? `${themeCssVariables.color.orange}18`
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isExpired }) =>
      isExpired
        ? `${themeCssVariables.color.orange}66`
        : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isExpired }) =>
    isExpired
      ? themeCssVariables.color.orange
      : themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledAiResult = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledMismatch = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledExtracted = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

export type ChecklistAiState = {
  fileName?: string;
  status?: DocumentValidationSeverity;
  summary?: string;
  extractedFields?: Record<string, string>;
  mismatches?: Array<{ field: string; expected: string; found: string }>;
  confidence?: number;
  vigencia?: string;
  isVigenciaExpired?: boolean;
};

type ParksLegalChecklistDocumentRowProps = {
  item: LegalChecklistItem;
  aiState?: ChecklistAiState;
  isBusy: boolean;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  onVerifyWithAi: () => void;
  onToggleManual: () => void;
};

const VIGENCIA_FIELD_KEYS = [
  'vigencia',
  'fechaVigencia',
  'fechaVencimiento',
  'vencimiento',
  'validoHasta',
] as const;

export const resolveChecklistVigencia = (
  extractedFields?: Record<string, string>,
): { vigencia?: string; isExpired: boolean } => {
  if (!extractedFields) {
    return { isExpired: false };
  }

  const vigenciaEntry = Object.entries(extractedFields).find(([field]) =>
    VIGENCIA_FIELD_KEYS.some(
      (key) => key.toLowerCase() === field.toLowerCase(),
    ),
  );

  if (!vigenciaEntry) {
    return { isExpired: false };
  }

  const vigencia = vigenciaEntry[1];
  const parsedDate = new Date(`${vigencia}T23:59:59`);

  if (Number.isNaN(parsedDate.getTime())) {
    return { vigencia, isExpired: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    vigencia,
    isExpired: parsedDate < today,
  };
};

const resolveStatusColor = (
  status?: DocumentValidationSeverity,
): 'green' | 'yellow' | 'red' | 'gray' => {
  if (status === 'ok') {
    return 'green';
  }

  if (status === 'warning') {
    return 'yellow';
  }

  if (status === 'error') {
    return 'red';
  }

  return 'gray';
};

export const ParksLegalChecklistDocumentRow = ({
  item,
  aiState,
  isBusy,
  onFileSelect,
  onClearFile,
  onVerifyWithAi,
  onToggleManual,
}: ParksLegalChecklistDocumentRowProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFile = Boolean(aiState?.fileName);
  const vigencia = aiState?.vigencia;
  const isVigenciaExpired = Boolean(aiState?.isVigenciaExpired);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onClearFile();
  };

  return (
    <StyledRow>
      <StyledRowTop>
        <StyledTitle>
          {item.entregado ? (
            <IconCheck size={16} color={themeCssVariables.color.green} />
          ) : (
            <IconCircle size={14} />
          )}
          <span>{item.titulo ?? item.tipoDocumento ?? item.id}</span>
          {aiState?.status ? (
            <ParksStatusBadge
              color={resolveStatusColor(aiState.status)}
              label={
                aiState.status === 'ok'
                  ? t`IA OK`
                  : aiState.status === 'warning'
                    ? t`IA revisión`
                    : t`IA conflicto`
              }
            />
          ) : null}
        </StyledTitle>

        {vigencia ? (
          <StyledVigenciaBanner isExpired={isVigenciaExpired}>
            {isVigenciaExpired ? <IconAlertTriangle size={14} /> : null}
            {isVigenciaExpired
              ? t`Vigencia vencida: ${vigencia}`
              : t`Vigencia: ${vigencia}`}
          </StyledVigenciaBanner>
        ) : null}

        <StyledActions>
          <StyledHiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onFileSelect}
            disabled={isBusy}
          />
          <ParksActionButton
            variant="secondary"
            size="sm"
            Icon={IconUpload}
            title={hasFile ? t`Cambiar archivo` : t`Seleccionar archivo`}
            onClick={handleOpenFilePicker}
            disabled={isBusy}
          />
          {hasFile ? (
            <StyledFileChip>
              <IconFileText size={14} />
              <StyledFileName title={aiState?.fileName}>
                {aiState?.fileName}
              </StyledFileName>
              <StyledClearFileButton
                type="button"
                aria-label={t`Quitar archivo`}
                onClick={handleClearFile}
                disabled={isBusy}
              >
                <IconX size={14} />
              </StyledClearFileButton>
            </StyledFileChip>
          ) : null}
          <ParksActionButton
            variant="primary"
            size="sm"
            Icon={IconSparkles}
            title={t`Verificar con IA`}
            onClick={onVerifyWithAi}
            disabled={isBusy || !hasFile}
          />
          <Button
            variant="secondary"
            title={item.entregado ? t`Marcar pendiente` : t`Marcar entregado`}
            onClick={onToggleManual}
            disabled={isBusy}
          />
        </StyledActions>
      </StyledRowTop>

      {aiState?.summary ? (
        <StyledAiResult>
          <StyledExtracted>
            {aiState.summary}
            {typeof aiState.confidence === 'number'
              ? ` · ${Math.round(aiState.confidence * 100)}% confianza`
              : ''}
          </StyledExtracted>
          {aiState.extractedFields
            ? Object.entries(aiState.extractedFields)
                .filter(
                  ([field]) =>
                    !VIGENCIA_FIELD_KEYS.some(
                      (key) => key.toLowerCase() === field.toLowerCase(),
                    ),
                )
                .map(([field, value]) => (
                  <StyledExtracted key={field}>
                    {field}: {value}
                  </StyledExtracted>
                ))
            : null}
          {aiState.mismatches?.map((mismatch) => (
            <StyledMismatch key={`${mismatch.field}-${mismatch.found}`}>
              {mismatch.field}: esperaba “{mismatch.expected}”, encontró “
              {mismatch.found}”
            </StyledMismatch>
          ))}
        </StyledAiResult>
      ) : null}
    </StyledRow>
  );
};
