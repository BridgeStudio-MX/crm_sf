export type ParksCemInboxItemKind =
  | 'lead-sin-asignar'
  | 'aprobacion-comercial'
  | 'firma-hoja';

export type ParksCemInboxItem = {
  id: string;
  kind: ParksCemInboxItemKind;
  title: string;
  subtitle: string;
  detail: string;
  amountLabel?: string;
  priority: 'high' | 'normal';
  actionPath: string;
  canResolve: boolean;
  entityId: string;
  createdAt?: string;
};

export type ParksCemInboxSummary = {
  total: number;
  leadsSinAsignar: number;
  aprobacionesComerciales: number;
  firmasHoja: number;
  items: ParksCemInboxItem[];
};
