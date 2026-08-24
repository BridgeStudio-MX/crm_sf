import {
  PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS,
  requiresParksComiteByGla,
} from '@/parks-industrial/constants/parks-comite-gates.constants';
import { type ComiteAutorizacion } from '@/parks-industrial/types/parks-comite.types';
import { formatComiteCurrency } from '@/parks-industrial/utils/parks-comite-format.util';

export const isComiteOnLiveAgenda = (comite: ComiteAutorizacion): boolean => {
  if (comite.estatus.startsWith('Resuelto')) {
    return false;
  }

  return (
    comite.estatus.startsWith('Abierto') ||
    comite.estatus === PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS ||
    comite.resolucion === 'Pendiente' ||
    comite.resolucion === 'Empate — escalar'
  );
};

export const getComiteLiveAgendaReasons = (
  comite: ComiteAutorizacion,
): string[] => {
  const reasons: string[] = [];
  const { deal } = comite;

  if (requiresParksComiteByGla(deal.glaM2)) {
    reasons.push(
      `Superficie ${deal.glaM2.toLocaleString('es-MX')} m² (umbral de comité)`,
    );
  }

  if (!deal.clienteHistorialParks) {
    reasons.push('Cliente nuevo en Parks');
  }

  if (deal.clienteAdeudosActivos) {
    reasons.push('Cliente con adeudos activos');
  }

  for (const flag of comite.flagsIaAtipicas) {
    reasons.push(flag.titulo);
  }

  return [...new Set(reasons)];
};

export const getComiteLiveAgreements = (
  comite: ComiteAutorizacion,
): Array<{ label: string; value: string }> => {
  const { deal } = comite;
  const agreements: Array<{ label: string; value: string }> = [
    {
      label: 'Precio lista vs acordado',
      value: `${formatComiteCurrency(deal.precioListaM2, deal.moneda)} → ${formatComiteCurrency(deal.precioAcordadoM2, deal.moneda)} / m² (${deal.descuentoPorcentaje}% desc.)`,
    },
    {
      label: 'Plazo',
      value: `${deal.plazoMeses} meses${deal.prorrogaMeses ? ` + ${deal.prorrogaMeses} prórroga` : ''}`,
    },
    {
      label: 'Gracia',
      value: `${deal.periodoGraciaMeses} meses`,
    },
    {
      label: 'Depósito / rentas adelantadas',
      value: `${deal.depositosGarantiaMeses} meses garantía · ${deal.rentasAdelantadasMeses} adelantadas`,
    },
    {
      label: 'Renta mensual',
      value: formatComiteCurrency(deal.rentaMensual, deal.moneda),
    },
  ];

  if (deal.guantePactado > 0) {
    agreements.push({
      label: 'Guante',
      value: formatComiteCurrency(deal.guantePactado, deal.moneda),
    });
  }

  if (deal.mantenimientoPactado > 0) {
    agreements.push({
      label: 'Mantenimiento',
      value: formatComiteCurrency(deal.mantenimientoPactado, deal.moneda),
    });
  }

  if (deal.rentaVariablePct) {
    agreements.push({
      label: 'Renta variable',
      value: `${deal.rentaVariablePct}%`,
    });
  }

  agreements.push({
    label: 'Incremento',
    value:
      deal.incrementoTipo === 'INPC'
        ? 'INPC'
        : `${deal.incrementoValor}% fijo`,
  });

  if (deal.condicionesEspeciales?.trim()) {
    agreements.push({
      label: 'Condiciones especiales',
      value: deal.condicionesEspeciales,
    });
  }

  if (deal.observacionesEntregaNave?.trim()) {
    agreements.push({
      label: 'Entrega de nave',
      value: deal.observacionesEntregaNave,
    });
  }

  return agreements;
};
