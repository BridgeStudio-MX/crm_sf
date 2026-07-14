import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { generateParksSalesScript } from '@/parks-industrial/services/parks-commercial.client';
import { type SalesScriptResult } from '@/parks-industrial/types/parks-commercial.types';
import {
  formatParksTourNavesLabel,
  parseParksTourNavesMostradas,
} from '@/parks-industrial/utils/parks-tour-naves.util';

type ParksLoCampoScriptProps = {
  deal: ParksOpportunityRecord;
};

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledCard = styled.section`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCardTitle = styled.h3`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.02em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledBody = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
`;

const StyledList = styled.ul`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledToolbar = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const resolveNaveDestacada = (deal: ParksOpportunityRecord): string | null => {
  if (deal.naveVinculada?.identificador) {
    return deal.naveVinculada.identificador;
  }

  const tourNaves = parseParksTourNavesMostradas(deal.tourNavesMostradas);

  if (tourNaves.length > 0) {
    return formatParksTourNavesLabel(tourNaves);
  }

  return null;
};

export const ParksLoCampoScript = ({ deal }: ParksLoCampoScriptProps) => {
  const [salesScript, setSalesScript] = useState<SalesScriptResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const naveDestacada = resolveNaveDestacada(deal);

  const loadScript = useCallback(async () => {
    if (!naveDestacada) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const script = await generateParksSalesScript({
        opportunityId: deal.id,
        companyName: deal.name ?? t`Prospecto`,
        industry: deal.giroEmpresa,
        m2Requeridos: deal.m2Requeridos,
        naveDestacada,
      });
      setSalesScript(script);
    } catch (scriptError) {
      setError(
        scriptError instanceof Error
          ? scriptError.message
          : t`No se pudo generar el guión`,
      );
    } finally {
      setLoading(false);
    }
  }, [deal, naveDestacada]);

  useEffect(() => {
    if (naveDestacada) {
      void loadScript();
    }
  }, [loadScript, naveDestacada]);

  if (!naveDestacada) {
    return (
      <ParksEmptyState
        title={t`Sin nave para el guión`}
        description={t`Vincula una nave o marca naves del tour en el pipeline para generar el guión comercial.`}
      />
    );
  }

  return (
    <StyledStack>
      <StyledToolbar>
        <Button
          variant="secondary"
          Icon={IconRefresh}
          title={t`Regenerar`}
          disabled={loading}
          onClick={() => void loadScript()}
        />
      </StyledToolbar>

      {loading ? <ParksLoadingSkeleton variant="list" /> : null}

      {salesScript ? (
        <>
          <StyledCard>
            <StyledCardTitle>{salesScript.scriptTitle}</StyledCardTitle>
            <StyledBody>{salesScript.openingLine}</StyledBody>
          </StyledCard>

          <StyledCard>
            <StyledCardTitle>{t`Preguntas`}</StyledCardTitle>
            <StyledList>
              {salesScript.discoveryQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </StyledList>
          </StyledCard>

          <StyledCard>
            <StyledCardTitle>{t`Propuesta de valor`}</StyledCardTitle>
            <StyledBody>{salesScript.valueProposition}</StyledBody>
          </StyledCard>

          <StyledCard>
            <StyledCardTitle>{t`Agenda de visita`}</StyledCardTitle>
            <StyledList>
              {salesScript.visitAgenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </StyledList>
          </StyledCard>

          <StyledCard>
            <StyledCardTitle>{t`Cierre`}</StyledCardTitle>
            <StyledBody>{salesScript.closingLine}</StyledBody>
          </StyledCard>
        </>
      ) : null}

      {error ? <StyledError>{error}</StyledError> : null}
    </StyledStack>
  );
};
