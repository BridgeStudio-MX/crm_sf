export type GraphQlEdge<TNode> = {
  node: TNode;
};

export type GraphQlConnection<TNode> = {
  edges: GraphQlEdge<TNode>[];
  totalCount?: number;
};

export type ParqueRecord = {
  id: string;
  nombre: string;
  ubicacion?: string;
  m2Totales?: number;
  m2Rentados?: number;
  administrador?: string;
};

export type NaveRecord = {
  id: string;
  identificador: string;
  m2?: number;
  precioBaseUsd?: number;
  estatus?: string;
  parque?: ParqueRecord | null;
};

export type InquilinoRecord = {
  id: string;
  empresa: string;
};

export type ExpedienteContratoRecord = {
  id: string;
  numeroExpediente?: string;
  fechaVencimiento?: string;
  fechaApertura?: string;
  rentaMensualUsd?: number;
  estatus?: string;
  inquilino?: InquilinoRecord | null;
  nave?: NaveRecord | null;
  casoLegal?: CasoLegalRecord | null;
};

export type CasoLegalRecord = {
  id: string;
  referencia: string;
  tipoDocumento?: string;
  estatus?: string;
  semaforo?: string;
  abogadoAsignado?: string;
  notasCatalina?: string;
  inquilino?: InquilinoRecord | null;
  nave?: NaveRecord | null;
  hojaDeAcuerdos?: {
    id: string;
    m2Acordados?: number;
    precioUsdM2?: number;
    plazoMeses?: number;
    fechaInicio?: string;
  } | null;
};

export type OpportunityRecord = {
  id: string;
  name: string;
  stage?: string;
  amount?: { amountMicros?: number; currencyCode?: string };
  m2Requeridos?: number;
  tipoOperacion?: string;
  pointOfContact?: { name?: { firstName?: string; lastName?: string } };
  owner?: { name?: { firstName?: string; lastName?: string } };
  naveVinculada?: NaveRecord | null;
  inquilinoVinculado?: InquilinoRecord | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ComisionRecord = {
  id: string;
  tipo?: string;
  beneficiario?: string;
  montoUsd?: number;
  baseCalculo?: string;
  estatus?: string;
  casoLegal?: CasoLegalRecord | null;
  hojaDeAcuerdos?: {
    id: string;
    referencia?: string;
    nave?: NaveRecord | null;
  } | null;
};

export type StackingPlanNave = NaveRecord & {
  expedienteActivo?: ExpedienteContratoRecord | null;
  diasRestantes?: number | null;
  statusColor: 'green' | 'yellow' | 'red' | 'gray';
  statusLabel: string;
};

export type ApprovalStageId =
  | 'comercial'
  | 'legal'
  | 'oracle'
  | 'firma';

export type ApprovalStage = {
  id: ApprovalStageId;
  label: string;
  responsable: string;
  status: 'completed' | 'active' | 'pending';
  fechaAprobacion?: string;
  comentarios?: string;
};
