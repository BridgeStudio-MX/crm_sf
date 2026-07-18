import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  type CxcAccount,
  type CxcCalendarioPagoItem,
} from '@/parks-industrial/types/parks-cxc.types';
import { formatCxcMoney } from '@/parks-industrial/utils/parks-cxc-format.util';

type ParksCxcCalendarioPagosProps = {
  account: CxcAccount;
};

const StyledMetaRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledCalendarSummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0 0 ${themeCssVariables.spacing[2]};
`;

const StyledCalendarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-height: 480px;
  overflow: auto;
  padding-right: 2px;
`;

const StyledYearHeader = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  margin-top: ${themeCssVariables.spacing[1]};
  padding: 6px ${themeCssVariables.spacing[2]};
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
`;

const StyledCalendarRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 110px 1fr auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledCalendarDate = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-variant-numeric: tabular-nums;
`;

const StyledCalendarConcept = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCalendarAmount = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
`;

const StyledAmount = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-variant-numeric: tabular-nums;
`;

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const groupByYear = (
  items: CxcCalendarioPagoItem[],
): Array<{ year: string; items: CxcCalendarioPagoItem[] }> => {
  const groups = new Map<string, CxcCalendarioPagoItem[]>();

  for (const item of items) {
    const year = item.fecha.slice(0, 4);
    const existing = groups.get(year) ?? [];
    existing.push(item);
    groups.set(year, existing);
  }

  return Array.from(groups.entries()).map(([year, yearItems]) => ({
    year,
    items: yearItems,
  }));
};

export const ParksCxcCalendarioPagos = ({
  account,
}: ParksCxcCalendarioPagosProps) => {
  const calendario = account.calendarioPagos;

  if (!calendario || calendario.items.length === 0) {
    return (
      <ParksSectionCard title={t`Calendario de pagos`} accent="green">
        <StyledCalendarSummary>
          {t`Aún no hay calendario de rentas para este contrato.`}
        </StyledCalendarSummary>
      </ParksSectionCard>
    );
  }

  const calendarByYear = groupByYear(calendario.items);
  const rentas = calendario.items.filter((item) =>
    item.concepto.includes('Renta mensual'),
  ).length;
  const gracia = calendario.items.filter((item) =>
    item.concepto.includes('gracia'),
  ).length;
  const iniciales = calendario.items.filter(
    (item) =>
      item.concepto.includes('Depósito') ||
      item.concepto.includes('adelantada'),
  ).length;
  const programadas = calendario.items.filter(
    (item) => item.estatus === 'Programada' && item.monto > 0,
  ).length;

  return (
    <ParksSectionCard title={t`Calendario de pagos del contrato`} accent="green">
      <StyledMetaRow>
        <ParksStatusBadge
          label={`${t`Día`}: ${calendario.diaPagoAcordado}`}
          color="gray"
        />
        {calendario.proximaFechaPago ? (
          <ParksStatusBadge
            label={`${t`Próximo`}: ${formatDate(calendario.proximaFechaPago)}`}
            color="green"
          />
        ) : null}
        <ParksStatusBadge
          label={`${calendario.items.length} ${t`cargos`}`}
          color="blue"
        />
        <ParksStatusBadge
          label={`${programadas} ${t`programados`}`}
          color="yellow"
        />
      </StyledMetaRow>
      <StyledCalendarSummary>
        {t`${iniciales} iniciales · ${gracia} gracia · ${rentas} rentas mensuales — desplázate para ver todo el plazo`}
      </StyledCalendarSummary>
      <StyledCalendarList>
        {calendarByYear.map((group) => (
          <div key={group.year}>
            <StyledYearHeader>{group.year}</StyledYearHeader>
            {group.items.map((item, index) => (
              <StyledCalendarRow
                key={`${item.fecha}-${item.concepto}-${index}`}
              >
                <StyledCalendarDate>{formatDate(item.fecha)}</StyledCalendarDate>
                <StyledCalendarConcept>{item.concepto}</StyledCalendarConcept>
                <StyledCalendarAmount>
                  <StyledAmount>
                    {item.monto === 0
                      ? t`Sin cargo`
                      : formatCxcMoney(item.monto, account.moneda)}
                  </StyledAmount>
                  <ParksStatusBadge
                    label={item.estatus}
                    color={
                      item.estatus === 'Pagada'
                        ? 'green'
                        : item.estatus === 'Vencida'
                          ? 'red'
                          : item.estatus === 'Facturada'
                            ? 'yellow'
                            : 'gray'
                    }
                  />
                </StyledCalendarAmount>
              </StyledCalendarRow>
            ))}
          </div>
        ))}
      </StyledCalendarList>
    </ParksSectionCard>
  );
};
