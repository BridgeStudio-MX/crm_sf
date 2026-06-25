import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { IconDownload, IconFileText, IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  fetchParksContractDraft,
  fetchParksContractTypes,
  generateParksContractDraft,
  generateParksContractPdf,
  getParksContractPdfDownloadUrl,
  saveParksContractDraft,
} from '@/parks-industrial/services/parks-legal.client';
import { type ContractTypeOption } from '@/parks-industrial/types/parks-legal.types';

const StyledSelect = styled.select`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledEditor = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.45;
  min-height: 280px;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
  width: 100%;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ParksContractEditorPanelProps = {
  casoLegalId: string;
};

export const ParksContractEditorPanel = ({
  casoLegalId,
}: ParksContractEditorPanelProps) => {
  const [contractTypes, setContractTypes] = useState<ContractTypeOption[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [html, setHtml] = useState('');
  const [version, setVersion] = useState(0);
  const [pdfReady, setPdfReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      const types = await fetchParksContractTypes();
      setContractTypes(types);
      setSelectedType(types[0]?.tipoDocumento ?? '');

      const existingDraft = await fetchParksContractDraft(casoLegalId);

      if (existingDraft) {
        setHtml(existingDraft.html);
        setVersion(existingDraft.version);
        setSelectedType(existingDraft.tipoDocumento);
        setPdfReady(Boolean(existingDraft.pdfPath));
      }
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Error al cargar';
      setError(message);
    }
  }, [casoLegalId]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleGenerate = async () => {
    if (!selectedType) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const draft = await generateParksContractDraft({
        casoLegalId,
        tipoDocumento: selectedType,
      });
      setHtml(draft.html);
      setVersion(draft.version);
      setPdfReady(false);
    } catch (generateError) {
      const message =
        generateError instanceof Error
          ? generateError.message
          : 'No se pudo generar';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const draft = await saveParksContractDraft({ casoLegalId, html });
      setVersion(draft.version);
      setPdfReady(false);
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'No se pudo guardar';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    setLoading(true);
    setError(null);

    try {
      await generateParksContractPdf(casoLegalId);
      setPdfReady(true);
    } catch (pdfError) {
      const message =
        pdfError instanceof Error ? pdfError.message : 'No se pudo crear PDF';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParksSectionCard title={t`Generador y editor de contratos`}>
      <StyledSelect
        value={selectedType}
        onChange={(event) => setSelectedType(event.target.value)}
      >
        {contractTypes.map((contractType) => (
          <option
            key={contractType.id}
            value={contractType.tipoDocumento}
          >
            {contractType.label}
          </option>
        ))}
      </StyledSelect>

      <StyledActions>
        <Button
          variant="primary"
          Icon={IconFileText}
          title={t`Generar borrador`}
          onClick={() => void handleGenerate()}
          disabled={loading}
        />
        <Button
          variant="secondary"
          title={t`Guardar edición`}
          onClick={() => void handleSave()}
          disabled={loading || html.trim().length === 0}
        />
        <Button
          variant="secondary"
          Icon={IconRefresh}
          title={t`Exportar PDF`}
          onClick={() => void handleGeneratePdf()}
          disabled={loading || html.trim().length === 0}
        />
        {pdfReady ? (
          <Button
            variant="secondary"
            Icon={IconDownload}
            title={t`Descargar PDF`}
            onClick={() => {
              window.open(
                getParksContractPdfDownloadUrl(casoLegalId),
                '_blank',
              );
            }}
          />
        ) : null}
      </StyledActions>

      {loading ? <ParksLoadingSkeleton variant="list" /> : null}

      {version > 0 ? (
        <StyledMeta>
          {t`Versión`} {version}
          {pdfReady ? (
            <ParksStatusBadge color="green" label={t`PDF listo`} />
          ) : null}
        </StyledMeta>
      ) : null}

      <StyledEditor
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        placeholder={t`Genera un borrador para editar cláusulas, montos y plazos...`}
      />

      {error ? <StyledError>{error}</StyledError> : null}
    </ParksSectionCard>
  );
};
