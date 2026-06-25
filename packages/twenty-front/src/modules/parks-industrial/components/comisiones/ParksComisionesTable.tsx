import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';

import { registerParksPayment } from '@/parks-industrial/services/parks-operations.client';
import { type ParksComisionRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksComisionesSummary } from '@/parks-industrial/components/comisiones/ParksComisionesSummary';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksInput } from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  formatParksUsd,
  getParksComisionStatusColor,
} from '@/parks-industrial/utils/parks-format.util';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFilter = styled(StyledParksInput)`
  max-width: 320px;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledTableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 720px;
  width: 100%;
`;

const StyledHeaderCell = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledCell = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const getComisionStatusLabel = (estatus?: string | null): string => {
  if (estatus === 'APROBADA' || estatus === 'Aprobada') {
    return t`Aprobada`;
  }

  if (
    estatus === 'PENDIENTE' ||
    estatus === 'Pendiente' ||
    estatus === 'CALCULADA' ||
    estatus === 'Calculada'
  ) {
    return t`Pendiente`;
  }

  return estatus ?? t`Pendiente`;
};

const isPendingComision = (estatus?: string | null): boolean => {
  if (!estatus) {
    return true;
  }

  const normalized = estatus.toUpperCase();

  return (
    normalized.includes('PENDIENTE') || normalized.includes('CALCULADA')
  );
};

type ParksComisionesTableProps = {
  comisiones: ParksComisionRecord[];
};

export const ParksComisionesTable = ({
  comisiones,
}: ParksComisionesTableProps) => {
  const [items, setItems] = useState(comisiones);
  const [brokerFilter, setBrokerFilter] = useState('');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems(comisiones);
  }, [comisiones]);

  const filtered = useMemo(() => {
    if (!brokerFilter) {
      return items;
    }

    return items.filter((comision) =>
      (comision.beneficiario ?? '')
        .toLowerCase()
        .includes(brokerFilter.toLowerCase()),
    );
  }, [brokerFilter, items]);

  const totalPendiente = filtered
    .filter((comision) => isPendingComision(comision.estatus))
    .reduce((sum, comision) => sum + (comision.montoUsd ?? 0), 0);

  const handleRegisterPayment = async (comisionId: string) => {
    setItems((previous) =>
      previous.map((comision) =>
        comision.id === comisionId
          ? { ...comision, estatus: 'APROBADA' }
          : comision,
      ),
    );

    try {
      const result = await registerParksPayment(comisionId);
      setPaymentMessage(result.message);
    } catch {
      setItems(comisiones);
      setPaymentMessage(t`No se pudo registrar el pago`);
    }
  };

  return (
    <StyledParksPageStack>
      <ParksComisionesSummary comisiones={items} />

      <StyledFilter
        type="search"
        placeholder={t`Filtrar por broker...`}
        value={brokerFilter}
        onChange={(event) => setBrokerFilter(event.target.value)}
      />

      <ParksSectionCard title={t`Comisiones registradas`}>
        {filtered.length === 0 ? (
          <ParksEmptyState title={t`No hay comisiones para mostrar`} />
        ) : (
          <StyledTableWrapper>
            <StyledTable>
              <thead>
                <tr>
                  <StyledHeaderCell>{t`Broker`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Deal / contrato`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Nave`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Monto`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Estatus`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Acciones`}</StyledHeaderCell>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comision) => (
                  <tr key={comision.id}>
                    <StyledCell>{comision.beneficiario ?? '—'}</StyledCell>
                    <StyledCell>
                      {comision.casoLegal?.referencia ??
                        comision.hojaDeAcuerdos?.referencia ??
                        '—'}
                    </StyledCell>
                    <StyledCell>
                      {comision.hojaDeAcuerdos?.nave?.identificador ?? '—'}
                    </StyledCell>
                    <StyledCell>{formatParksUsd(comision.montoUsd)}</StyledCell>
                    <StyledCell>
                      <ParksStatusBadge
                        color={getParksComisionStatusColor(comision.estatus)}
                        label={getComisionStatusLabel(comision.estatus)}
                      />
                    </StyledCell>
                    <StyledCell>
                      {isPendingComision(comision.estatus) ? (
                        <Button
                          title={t`Registrar pago`}
                          onClick={() => void handleRegisterPayment(comision.id)}
                        />
                      ) : (
                        '—'
                      )}
                    </StyledCell>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </StyledTableWrapper>
        )}
      </ParksSectionCard>

      <StyledFooter>
        {paymentMessage ? `${paymentMessage} · ` : ''}
        {t`Total comisiones pendientes`}: {formatParksUsd(totalPendiente)}
      </StyledFooter>
    </StyledParksPageStack>
  );
};
