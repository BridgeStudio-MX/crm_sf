import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { IconDownload, IconEye } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDetailField } from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import { fetchParksLegalHojaCopy } from '@/parks-industrial/services/parks-legal.client';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

type ParksLegalLoiPanelProps = {
  casoLegal: ParksCasoLegalRecord;
};

type LoiCopyMeta = {
  html: string;
  fileName: string;
  referencia: string;
  firmadaPorCem: boolean;
  firmadaPorCliente: boolean;
  m2Acordados: number | null;
  precioUsdM2: number | null;
  plazoMeses: number | null;
  fechaInicio: string | null;
  tipoContrato: string | null;
};

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0 0 ${themeCssVariables.spacing[3]};
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const openLoiHtmlInNewTab = (html: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const downloadLoiHtml = (html: string, fileName: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const ParksLegalLoiPanel = ({ casoLegal }: ParksLegalLoiPanelProps) => {
  const hojaSummary = casoLegal.hojaDeAcuerdos;
  const [copyMeta, setCopyMeta] = useState<LoiCopyMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCopy = useCallback(async (): Promise<LoiCopyMeta | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const copy = await fetchParksLegalHojaCopy(casoLegal.id);
      const nextMeta: LoiCopyMeta = {
        html: copy.html,
        fileName: copy.fileName,
        referencia: copy.referencia,
        firmadaPorCem: copy.firmadaPorCem,
        firmadaPorCliente: copy.firmadaPorCliente,
        m2Acordados: copy.m2Acordados,
        precioUsdM2: copy.precioUsdM2,
        plazoMeses: copy.plazoMeses,
        fechaInicio: copy.fechaInicio,
        tipoContrato: copy.tipoContrato,
      };
      setCopyMeta(nextMeta);

      return nextMeta;
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : t`No se pudo cargar la LOI`;
      setError(message);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [casoLegal.id]);

  const handleViewLoi = async () => {
    const meta = copyMeta ?? (await loadCopy());

    if (meta) {
      openLoiHtmlInNewTab(meta.html);
    }
  };

  const handleDownloadLoi = async () => {
    const meta = copyMeta ?? (await loadCopy());

    if (meta) {
      downloadLoiHtml(meta.html, meta.fileName);
    }
  };

  const m2Acordados = copyMeta?.m2Acordados ?? hojaSummary?.m2Acordados;
  const precioUsdM2 = copyMeta?.precioUsdM2 ?? hojaSummary?.precioUsdM2;
  const plazoMeses = copyMeta?.plazoMeses ?? hojaSummary?.plazoMeses;
  const fechaInicio = copyMeta?.fechaInicio ?? hojaSummary?.fechaInicio;
  const rentaEstimada =
    (m2Acordados ?? 0) > 0 && (precioUsdM2 ?? 0) > 0
      ? (m2Acordados ?? 0) * (precioUsdM2 ?? 0)
      : null;
  const hasLinkedLoi = Boolean(hojaSummary?.id || copyMeta?.referencia);
  const firmadaCompleta = Boolean(
    copyMeta?.firmadaPorCem && copyMeta?.firmadaPorCliente,
  );

  return (
    <ParksSectionCard title={t`Hoja de Acuerdos (LOI)`}>
      <StyledHint>
        {t`Base comercial firmada para elaborar el contrato. Revisa el documento completo antes de generar el borrador.`}
      </StyledHint>

      <StyledBadges>
        <ParksStatusBadge
          color={hasLinkedLoi ? 'green' : 'orange'}
          label={hasLinkedLoi ? t`LOI vinculada` : t`Sin LOI vinculada`}
        />
        {copyMeta ? (
          <>
            <ParksStatusBadge
              color={copyMeta.firmadaPorCem ? 'green' : 'orange'}
              label={
                copyMeta.firmadaPorCem ? t`Firma Director Comercial` : t`Director Comercial pendiente`
              }
            />
            <ParksStatusBadge
              color={copyMeta.firmadaPorCliente ? 'green' : 'orange'}
              label={
                copyMeta.firmadaPorCliente
                  ? t`Firma cliente`
                  : t`Cliente pendiente`
              }
            />
            {firmadaCompleta ? (
              <ParksStatusBadge color="green" label={t`LOI firmada`} />
            ) : null}
          </>
        ) : null}
      </StyledBadges>

      <StyledGrid>
        <ParksDetailField
          label={t`Referencia LOI`}
          value={
            copyMeta?.referencia ?? hojaSummary?.referencia ?? hojaSummary?.id ?? '—'
          }
        />
        <ParksDetailField
          label={t`m² acordados`}
          value={formatParksNumber(m2Acordados)}
        />
        <ParksDetailField
          label={t`Precio USD/m²`}
          value={formatParksUsd(precioUsdM2)}
        />
        <ParksDetailField
          label={t`Renta mensual`}
          value={formatParksUsd(rentaEstimada)}
        />
        <ParksDetailField
          label={t`Plazo`}
          value={
            plazoMeses != null ? t`${plazoMeses} meses` : '—'
          }
        />
        <ParksDetailField
          label={t`Inicio`}
          value={formatParksDate(fechaInicio)}
        />
      </StyledGrid>

      <StyledActions>
        <Button
          title={t`Ver LOI completa`}
          Icon={IconEye}
          onClick={() => void handleViewLoi()}
          disabled={isLoading}
        />
        <Button
          title={t`Descargar LOI`}
          Icon={IconDownload}
          variant="secondary"
          onClick={() => void handleDownloadLoi()}
          disabled={isLoading}
        />
      </StyledActions>

      {error ? <StyledError>{error}</StyledError> : null}
    </ParksSectionCard>
  );
};
