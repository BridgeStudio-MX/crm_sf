import { type CxcPipelineStageId } from '@/parks-industrial/types/parks-cxc.types';

export type ParksCxcPipelineStage = {
  id: CxcPipelineStageId;
  label: string;
  description: string;
};

export const CXC_PIPELINE_STAGES: ParksCxcPipelineStage[] = [
  {
    id: 'recibido_legal',
    label: 'Recibido Legal',
    description: 'Contrato firmado — handoff a CxC',
  },
  {
    id: 'alta_oracle',
    label: 'Alta Oracle',
    description: 'Jesús da de alta el contrato',
  },
  {
    id: 'setup_cobranza',
    label: 'Setup cobranza',
    description: 'Cuenta Fibra Uno + bienvenida',
  },
  {
    id: 'facturacion_portal',
    label: 'Facturación / Portal',
    description: 'Pagos iniciales, OC o carga a portal',
  },
  {
    id: 'cobranza_activa',
    label: 'Cobranza activa',
    description: 'Ciclo mensual en curso',
  },
  {
    id: 'holdover',
    label: 'Holdover',
    description: 'Contrato vencido sin renovación',
  },
  {
    id: 'salida',
    label: 'Salida',
    description: 'Devolución de depósito / cierre',
  },
];

export const resolveCxcPipelineStage = (account: {
  pipelineStage?: CxcPipelineStageId | null;
  cicloEstatus?: string;
  holdover?: unknown;
  jesusContratoDadoAlta?: boolean;
  cuentaBancaria?: string | null;
  requiereOc?: boolean;
  ordenCompra?: { estatus?: string } | null;
  facturas?: unknown[];
}): CxcPipelineStageId => {
  if (account.pipelineStage) {
    return account.pipelineStage;
  }

  if (account.cicloEstatus === 'Terminado') {
    return 'salida';
  }

  if (account.cicloEstatus === 'Holdover' || account.holdover) {
    return 'holdover';
  }

  if (!account.jesusContratoDadoAlta) {
    return account.cuentaBancaria ? 'alta_oracle' : 'recibido_legal';
  }

  if (!account.cuentaBancaria) {
    return 'setup_cobranza';
  }

  if (
    account.requiereOc &&
    (account.ordenCompra?.estatus === 'Esperando OC' ||
      account.ordenCompra?.estatus === 'OC Recibida' ||
      account.ordenCompra?.estatus === 'Cargada en portal')
  ) {
    return 'facturacion_portal';
  }

  if (
    account.cicloEstatus === 'Gracia' &&
    (account.facturas?.length ?? 0) === 0
  ) {
    return 'facturacion_portal';
  }

  return 'cobranza_activa';
};
