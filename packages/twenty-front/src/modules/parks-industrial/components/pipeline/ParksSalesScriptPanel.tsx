import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { IconFileText, IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { generateParksSalesScript } from '@/parks-industrial/services/parks-commercial.client';
import { type SalesScriptResult } from '@/parks-industrial/types/parks-commercial.types';

const StyledScriptBlock = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledScriptTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[1]} 0 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledEmptyHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ParksSalesScriptPanelProps = {
  opportunityId: string;
  companyName: string;
  m2Requeridos?: number;
  industry?: string;
  naveDestacada?: string | null;
  embedded?: boolean;
};

export const ParksSalesScriptPanel = ({
  opportunityId,
  companyName,
  m2Requeridos,
  industry,
  naveDestacada,
  embedded = false,
}: ParksSalesScriptPanelProps) => {
  const [salesScript, setSalesScript] = useState<SalesScriptResult | null>(
    null,
  );
  const [loadingScript, setLoadingScript] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSalesScript = useCallback(async () => {
    if (!naveDestacada) {
      return;
    }

    setLoadingScript(true);
    setError(null);

    try {
      const script = await generateParksSalesScript({
        opportunityId,
        companyName,
        industry,
        m2Requeridos,
        naveDestacada,
      });
      setSalesScript(script);
    } catch (scriptError) {
      const message =
        scriptError instanceof Error
          ? scriptError.message
          : t`No se pudo generar el guion`;
      setError(message);
    } finally {
      setLoadingScript(false);
    }
  }, [companyName, industry, m2Requeridos, naveDestacada, opportunityId]);

  useEffect(() => {
    if (naveDestacada) {
      void loadSalesScript();
    }
  }, [loadSalesScript, naveDestacada]);

  return (
    <ParksToolSection
      title={t`Guion comercial`}
      icon={IconFileText}
      hint={t`Prepárate para la visita con apertura, preguntas y cierre`}
      embedded={embedded}
      action={
        <Button
          variant="secondary"
          Icon={IconRefresh}
          title={t`Regenerar`}
          onClick={() => void loadSalesScript()}
          disabled={loadingScript || !naveDestacada}
        />
      }
    >
      {!naveDestacada ? (
        <StyledEmptyHint>
          {t`Asigna una nave en Propuesta para generar el guion de la visita.`}
        </StyledEmptyHint>
      ) : null}

      {loadingScript ? <ParksLoadingSkeleton variant="list" /> : null}

      {salesScript ? (
        <>
          <StyledScriptTitle>{salesScript.scriptTitle}</StyledScriptTitle>
          <StyledScriptBlock>{salesScript.openingLine}</StyledScriptBlock>
          <StyledScriptBlock>
            <strong>{t`Preguntas de descubrimiento`}</strong>
            <StyledList>
              {salesScript.discoveryQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </StyledList>
          </StyledScriptBlock>
          <StyledScriptBlock>{salesScript.valueProposition}</StyledScriptBlock>
          <StyledScriptBlock>
            <strong>{t`Agenda de visita`}</strong>
            <StyledList>
              {salesScript.visitAgenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </StyledList>
          </StyledScriptBlock>
          <StyledScriptBlock>
            <strong>{t`Cierre sugerido`}</strong>
            <div>{salesScript.closingLine}</div>
          </StyledScriptBlock>
        </>
      ) : null}

      {error ? <StyledError>{error}</StyledError> : null}
    </ParksToolSection>
  );
};
