export type CemInboxItemKind =
  | 'lead-sin-asignar'
  | 'aprobacion-comercial'
  | 'firma-hoja';

export type CemInboxItem = {
  id: string;
  kind: CemInboxItemKind;
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

export type CemInboxSummary = {
  total: number;
  leadsSinAsignar: number;
  aprobacionesComerciales: number;
  firmasHoja: number;
  items: CemInboxItem[];
};
