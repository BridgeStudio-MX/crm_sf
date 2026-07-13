import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ParksLegalChecklistDocumentRow,
  resolveChecklistVigencia,
  type ChecklistAiState,
} from '@/parks-industrial/components/legal/ParksLegalChecklistDocumentRow';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  ensureParksLegalChecklist,
  extractParksDocument,
  fetchParksLegalWorkflow,
  updateParksLegalChecklistItem,
  validateParksDocuments,
} from '@/parks-industrial/services/parks-legal.client';
import { type LegalChecklistItem } from '@/parks-industrial/types/parks-legal.types';

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0 0 ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

type ParksLegalChecklistPanelProps = {
  casoLegalId: string;
  onUpdated?: () => void;
};

const resolveDocumentType = (item: LegalChecklistItem): string =>
  item.tipoDocumento?.trim() || item.titulo?.trim() || 'Documento';

export const ParksLegalChecklistPanel = ({
  casoLegalId,
  onUpdated,
}: ParksLegalChecklistPanelProps) => {
  const [checklist, setChecklist] = useState<LegalChecklistItem[]>([]);
  const [documentacionCompleta, setDocumentacionCompleta] = useState(false);
  const [aiByItemId, setAiByItemId] = useState<Record<string, ChecklistAiState>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadChecklist = useCallback(async () => {
    setLoading(true);

    try {
      const workflow = await fetchParksLegalWorkflow(casoLegalId);
      setChecklist(workflow.checklist);
      setDocumentacionCompleta(
        workflow.casoLegal.documentacionCompleta === true,
      );
    } finally {
      setLoading(false);
    }
  }, [casoLegalId]);

  useEffect(() => {
    void loadChecklist();
  }, [loadChecklist]);

  const handleEnsureChecklist = async () => {
    setBusyItemId('ensure');
    setErrorMessage(null);

    try {
      const workflow = await ensureParksLegalChecklist(casoLegalId);
      setChecklist(workflow.checklist);
      onUpdated?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo generar el checklist`,
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const handleFileSelect = (
    itemId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const fileName = event.target.files?.[0]?.name;

    setAiByItemId((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        fileName,
        status: undefined,
        summary: undefined,
        mismatches: undefined,
        extractedFields: undefined,
      },
    }));
  };

  const handleClearFile = (itemId: string) => {
    setAiByItemId((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        fileName: undefined,
        status: undefined,
        summary: undefined,
        mismatches: undefined,
        extractedFields: undefined,
        confidence: undefined,
      },
    }));
  };

  const handleToggleManual = async (item: LegalChecklistItem) => {
    const previousChecklist = checklist;
    const previousDocumentacionCompleta = documentacionCompleta;
    const nextEntregado = !item.entregado;

    setErrorMessage(null);
    setChecklist((current) =>
      current.map((checklistItem) =>
        checklistItem.id === item.id
          ? { ...checklistItem, entregado: nextEntregado }
          : checklistItem,
      ),
    );
    setDocumentacionCompleta(
      nextEntregado
        ? checklist.every((checklistItem) =>
            checklistItem.id === item.id ? true : checklistItem.entregado,
          )
        : false,
    );

    try {
      const result = await updateParksLegalChecklistItem({
        documentoChecklistId: item.id,
        casoLegalId,
        entregado: nextEntregado,
      });
      setDocumentacionCompleta(result.documentacionCompleta);
      onUpdated?.();
    } catch (error) {
      setChecklist(previousChecklist);
      setDocumentacionCompleta(previousDocumentacionCompleta);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo actualizar el documento`,
      );
    }
  };

  const handleVerifyWithAi = async (item: LegalChecklistItem) => {
    const documentType = resolveDocumentType(item);
    const fileName = aiByItemId[item.id]?.fileName;

    setBusyItemId(item.id);
    setErrorMessage(null);

    try {
      const [extraction, validation] = await Promise.all([
        extractParksDocument({
          casoLegalId,
          documentType,
          fileName,
        }),
        validateParksDocuments({
          casoLegalId,
          useLlm: true,
          uploads: [
            {
              documentType,
              fileName,
              simulateMismatch: false,
            },
          ],
        }),
      ]);

      const validationItem =
        validation.items.find(
          (resultItem) =>
            resultItem.documentType.toLowerCase() ===
            documentType.toLowerCase(),
        ) ?? validation.items[0];

      const status = validationItem?.status ?? 'warning';
      const extractedFields =
        validationItem?.extractedFields ?? extraction.extractedFields;
      const { vigencia, isExpired } = resolveChecklistVigencia(extractedFields);

      setAiByItemId((current) => ({
        ...current,
        [item.id]: {
          fileName,
          status,
          summary:
            validationItem
              ? `${validation.summary} · ${Object.keys(extractedFields).length} campos`
              : extraction.summary,
          extractedFields,
          mismatches: validationItem?.mismatches.map((mismatch) => ({
            field: mismatch.field,
            expected: mismatch.expected,
            found: mismatch.found,
          })),
          confidence: extraction.confidence,
          vigencia,
          isVigenciaExpired: isExpired,
        },
      }));

      if (status === 'ok' && !item.entregado) {
        setChecklist((current) =>
          current.map((checklistItem) =>
            checklistItem.id === item.id
              ? { ...checklistItem, entregado: true }
              : checklistItem,
          ),
        );

        try {
          const result = await updateParksLegalChecklistItem({
            documentoChecklistId: item.id,
            casoLegalId,
            entregado: true,
          });
          setDocumentacionCompleta(result.documentacionCompleta);
          onUpdated?.();
        } catch {
          setChecklist((current) =>
            current.map((checklistItem) =>
              checklistItem.id === item.id
                ? { ...checklistItem, entregado: false }
                : checklistItem,
            ),
          );
        }
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo verificar el documento con IA`,
      );
    } finally {
      setBusyItemId(null);
    }
  };

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return (
    <ParksSectionCard title={t`Checklist documentación`}>
      <StyledHint>
        {t`Adjunta cada documento y verifica con IA (OCR + cotejo vs expediente). Si coincide, se marca entregado automáticamente.`}
      </StyledHint>

      <StyledHeader>
        <ParksStatusBadge
          color={documentacionCompleta ? 'green' : 'yellow'}
          label={
            documentacionCompleta
              ? t`Documentación completa`
              : t`Documentación pendiente`
          }
        />
        {checklist.length === 0 ? (
          <Button
            title={t`Generar checklist`}
            onClick={() => void handleEnsureChecklist()}
            disabled={busyItemId !== null}
          />
        ) : null}
      </StyledHeader>

      {checklist.length === 0 ? (
        <p style={{ color: themeCssVariables.font.color.secondary }}>
          {t`No hay documentos en el checklist. Genera la lista estándar para iniciar.`}
        </p>
      ) : (
        <StyledList>
          {checklist.map((item) => (
            <ParksLegalChecklistDocumentRow
              key={item.id}
              item={item}
              aiState={aiByItemId[item.id]}
              isBusy={busyItemId === item.id}
              onFileSelect={(event) => handleFileSelect(item.id, event)}
              onClearFile={() => handleClearFile(item.id)}
              onVerifyWithAi={() => void handleVerifyWithAi(item)}
              onToggleManual={() => void handleToggleManual(item)}
            />
          ))}
        </StyledList>
      )}

      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
    </ParksSectionCard>
  );
};
