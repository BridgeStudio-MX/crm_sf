import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import { type ParksStackingPlanNave } from '@/parks-industrial/hooks/useParksRecords';
import { downloadParksStackingPlanCsv } from '@/parks-industrial/utils/parks-format.util';
import { resolveParksParqueEntranceImageUrl } from '@/parks-industrial/utils/parks-image.util';
import { ParksPropertyImage } from '@/parks-industrial/components/ui/ParksPropertyImage';
import { StyledParksSelect } from '@/parks-industrial/components/ui/parks-form-control.styles';

type ParksStackingPlanHeaderProps = {
  parque: ParksParqueRecord;
  parqueId: string;
  parques: ParksParqueRecord[];
  naves: ParksStackingPlanNave[];
};

const StyledHeaderShell = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledMeta = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledStats = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

const StyledActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    align-items: flex-end;
    width: auto;
  }
`;

const StyledParqueSelect = styled(StyledParksSelect)`
  min-width: 240px;
`;

const StyledButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const ParksStackingPlanHeader = ({
  parque,
  parqueId,
  parques,
  naves,
}: ParksStackingPlanHeaderProps) => {
  const navigate = useNavigate();
  const parqueNombre = parque.nombre ?? t`Parque industrial`;
  const total = naves.length;
  const ocupadas = naves.filter((nave) => nave.statusColor !== 'gray').length;
  const disponibles = naves.filter((nave) => nave.statusColor === 'gray').length;
  const porRenovar = naves.filter(
    (nave) => nave.statusColor === 'yellow' || nave.statusColor === 'red',
  ).length;
  const fechaReporte = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <StyledHeaderShell>
      <ParksPropertyImage
        imageUrl={resolveParksParqueEntranceImageUrl({
          fotoEntradaUrl: parque.fotoEntradaUrl,
          nombre: parque.nombre,
          ubicacion: parque.ubicacion,
          recordId: parque.id,
        })}
        alt={parqueNombre}
        fallbackLabel={parqueNombre}
        height={180}
        showBorderRadius={false}
      />

      <StyledHeader>
        <div>
          <StyledTitle>{parqueNombre}</StyledTitle>
          <StyledMeta>
            {parque.ubicacion ?? t`Sin ubicación`} · {t`Reporte al`}{' '}
            {fechaReporte}
          </StyledMeta>
        <StyledStats>
          {total} {t`naves`} · {ocupadas} {t`ocupadas`} · {disponibles}{' '}
          {t`disponibles`} · {porRenovar} {t`por renovar`}
        </StyledStats>
      </div>

      <StyledActions>
        {parques.length > 1 ? (
          <StyledParqueSelect
            value={parqueId}
            onChange={(event) =>
              navigate(
                getAppPath(AppPath.ParksStackingPlan, {
                  parqueId: event.target.value,
                }),
              )
            }
          >
            {parques.map((parque) => (
              <option key={parque.id} value={parque.id}>
                {parque.nombre}
              </option>
            ))}
          </StyledParqueSelect>
        ) : null}
        <StyledButtonRow>
          <Button
            title={t`Exportar Excel`}
            variant="secondary"
            onClick={() => downloadParksStackingPlanCsv(parqueNombre, naves)}
          />
          <UndecoratedLink
            to={getAppPath(AppPath.RecordIndexPage, {
              objectNamePlural: 'naves',
            })}
          >
            <Button title={t`Nueva nave`} />
          </UndecoratedLink>
        </StyledButtonRow>
      </StyledActions>
      </StyledHeader>
    </StyledHeaderShell>
  );
};
