export type CxcHandoffRecord = {
  id: string;
  casoLegalId: string;
  referencia: string;
  empresa: string;
  naveIdentificador: string;
  rentaMensualUsd: number;
  depositoEstimadoUsd: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
};

export type CxcHandoffResult = {
  handoff: CxcHandoffRecord;
  ticketsCreated: number;
  message: string;
};

export type PaymentCommissionResult = {
  comisionId: string;
  beneficiario?: string;
  montoUsd?: number;
  previousStatus?: string;
  newStatus: string;
  message: string;
};

export type BrokerDealSnapshot = {
  dealId: string;
  dealName: string;
  stage?: string;
  m2Requeridos?: number;
  ticketUsd?: number;
  updatedAt?: string;
};

export type BrokerPerformanceMetrics = {
  brokerName: string;
  rankingPosition: number;
  totalBrokers: number;
  dealsActivos: number;
  dealsCerrados: number;
  comisionesAprobadasUsd: number;
  comisionesPendientesUsd: number;
  ticketPromedioUsd: number;
  m2Totales: number;
  metaMensualUsd: number;
  avanceMetaPct: number;
  recentDeals: BrokerDealSnapshot[];
  generatedAt: string;
};
