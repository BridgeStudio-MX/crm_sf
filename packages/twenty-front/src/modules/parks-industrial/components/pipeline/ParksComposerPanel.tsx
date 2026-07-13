import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconChartBar, IconFileText } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { generateParksComposerMaterial } from '@/parks-industrial/services/parks-commercial.client';
import {
  type ComposerGenerateResult,
  type ComposerTemplateType,
  type NaveMatchCandidate,
} from '@/parks-industrial/types/parks-commercial.types';

const StyledPreview = styled.iframe`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 320px;
  margin-top: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

type ParksComposerPanelProps = {
  opportunityId?: string;
  opportunityName?: string;
  companyName?: string;
  selectedNave?: NaveMatchCandidate;
};

export const ParksComposerPanel = ({
  opportunityId,
  opportunityName,
  companyName,
  selectedNave,
}: ParksComposerPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComposerGenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMaterial = async (templateType: ComposerTemplateType) => {
    if (!selectedNave) {
      setError(t`Selecciona una nave en matching para generar material`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generated = await generateParksComposerMaterial({
        templateType,
        opportunityId,
        opportunityName,
        companyName,
        naveIdentificador: selectedNave.identificador,
        parqueNombre: selectedNave.parqueNombre,
        ubicacion: selectedNave.ubicacion,
        m2: selectedNave.m2,
        precioUsdM2: selectedNave.precioUsdM2,
      });

      setResult(generated);
    } catch (generationError) {
      const message =
        generationError instanceof Error
          ? generationError.message
          : 'No se pudo generar material';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParksToolSection
      title={t`Composer Parks`}
      icon={IconFileText}
      hint={t`Brochures y reportes de actividad de listing generados desde datos del CRM`}
    >
      <StyledActions>
        <Button
          variant="secondary"
          Icon={IconFileText}
          title={t`Brochure de propiedad`}
          onClick={() => void generateMaterial('brochure')}
          disabled={loading || !selectedNave}
        />
        <Button
          variant="secondary"
          Icon={IconChartBar}
          title={t`Reporte de listing (owner)`}
          onClick={() => void generateMaterial('listing-report')}
          disabled={loading || !selectedNave}
        />
      </StyledActions>

      {loading ? <ParksLoadingSkeleton variant="list" /> : null}

      {result ? (
        <>
          <ParksStatusBadge
            color="green"
            label={t`Generado: ${result.fileName}`}
          />
          <StyledPreview
            title={result.fileName}
            srcDoc={result.html}
            sandbox=""
          />
        </>
      ) : null}

      {error ? <ParksStatusBadge color="red" label={error} /> : null}

      {!selectedNave ? (
        <ParksStatusBadge
          color="gray"
          label={t`Selecciona una nave en matching para habilitar Composer`}
        />
      ) : null}
    </ParksToolSection>
  );
};
