import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { IconBrain, IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  PARKS_BRAND,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import { runParksLegalCotejoIa } from '@/parks-industrial/services/parks-legal.client';
import { type CotejoIaResult } from '@/parks-industrial/types/parks-legal.types';

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0 0 ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledSummary = styled.div`
  background: linear-gradient(
    135deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 75%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSummaryTitle = styled.div`
  align-items: center;
  color: ${PARKS_BRAND.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: 8px;
`;

const StyledChangeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChangeCard = styled.div<{ severidad: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-left: 3px solid
    ${({ severidad }) =>
      severidad === 'alto'
        ? PARKS_VISUAL_THEME.accents.red.accent
        : severidad === 'medio'
          ? PARKS_VISUAL_THEME.accents.orange.accent
          : PARKS_VISUAL_THEME.accents.green.accent};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledChangeTitle = styled.strong`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledChangeMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

const recomendacionBadge = (
  recomendacion: CotejoIaResult['recomendacion'],
): { color: 'green' | 'orange' | 'red'; label: string } => {
  switch (recomendacion) {
    case 'aprobar':
      return { color: 'green', label: t`Recomienda aprobar` };
    case 'rechazar':
      return { color: 'red', label: t`Recomienda rechazar` };
    case 'revisar':
      return { color: 'orange', label: t`Revisar cambios` };
  }
};

const severidadLabel = (severidad: string): string => {
  switch (severidad) {
    case 'alto':
      return t`Alto`;
    case 'medio':
      return t`Medio`;
    default:
      return t`Bajo`;
  }
};

type ParksLegalCotejoIaPanelProps = {
  casoLegalId: string;
};

export const ParksLegalCotejoIaPanel = ({
  casoLegalId,
}: ParksLegalCotejoIaPanelProps) => {
  const [result, setResult] = useState<CotejoIaResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    setBusy(true);
    setErrorMessage(null);

    try {
      const cotejo = await runParksLegalCotejoIa({ casoLegalId });
      setResult(cotejo);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo ejecutar el cotejo IA`,
      );
    } finally {
      setBusy(false);
    }
  }, [casoLegalId]);

  return (
    <ParksSectionCard title={t`Cotejo inteligente con IA`} accent="green">
      <StyledHint>
        {t`Detecta cambios entre versiones del contrato (montos, fechas y cláusulas) antes del cotejo físico y el flujo de firmas.`}
      </StyledHint>
      <StyledActions>
        <Button
          title={t`Comparar versiones`}
          variant="primary"
          size="small"
          Icon={IconBrain}
          disabled={busy}
          onClick={() => void handleRun()}
        />
        {result ? (
          <Button
            title={t`Volver a analizar`}
            variant="secondary"
            size="small"
            Icon={IconRefresh}
            disabled={busy}
            onClick={() => void handleRun()}
          />
        ) : null}
      </StyledActions>

      {result ? (
        <>
          <StyledSummary>
            <StyledSummaryTitle>
              <IconBrain size={16} />
              {`V${result.versionBase} → V${result.versionComparada}`}
            </StyledSummaryTitle>
            <div>{result.resumen}</div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <ParksStatusBadge
                color={recomendacionBadge(result.recomendacion).color}
                label={recomendacionBadge(result.recomendacion).label}
              />
              <ParksStatusBadge
                color={result.coinciden ? 'green' : 'orange'}
                label={
                  result.coinciden
                    ? t`Sin delta material`
                    : t`${result.cambios.length} cambios`
                }
              />
              <ParksStatusBadge
                color="sky"
                label={
                  result.usadoHtmlDraft
                    ? t`Diff sobre borrador`
                    : t`Análisis por metadatos`
                }
              />
            </div>
          </StyledSummary>
          <StyledChangeList>
            {result.cambios.map((cambio) => (
              <StyledChangeCard key={cambio.id} severidad={cambio.severidad}>
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <StyledChangeTitle>{cambio.seccion}</StyledChangeTitle>
                  <ParksStatusBadge
                    color={
                      cambio.severidad === 'alto'
                        ? 'red'
                        : cambio.severidad === 'medio'
                          ? 'orange'
                          : 'green'
                    }
                    label={severidadLabel(cambio.severidad)}
                  />
                </div>
                <StyledChangeMeta>{cambio.explicacion}</StyledChangeMeta>
                {cambio.antes || cambio.despues ? (
                  <StyledChangeMeta>
                    {cambio.antes ? `${t`Antes`}: ${cambio.antes}` : null}
                    {cambio.antes && cambio.despues ? ' → ' : null}
                    {cambio.despues
                      ? `${t`Después`}: ${cambio.despues}`
                      : null}
                  </StyledChangeMeta>
                ) : null}
              </StyledChangeCard>
            ))}
          </StyledChangeList>
        </>
      ) : null}

      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
    </ParksSectionCard>
  );
};
