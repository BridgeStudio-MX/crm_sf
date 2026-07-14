export type ParksAiAction =
  | 'general'
  | 'checklist_review'
  | 'case_summary'
  | 'availability_search';

export type ParksAiScreen =
  | 'dashboard'
  | 'map'
  | 'pipeline'
  | 'contratos'
  | 'approval'
  | 'stacking-plan'
  | 'comisiones'
  | 'renovaciones'
  | 'reservas'
  | 'notificaciones'
  | 'mi-desempeno'
  | 'unknown';

export type ParksAiRouteContext = {
  screen: ParksAiScreen;
  casoLegalId?: string;
  parqueId?: string;
  cityFilterId?: string;
  searchQuery?: string;
  mapLayerId?: string;
};

export type ParksAiChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ParksAiQuickActionVisual =
  | 'briefing'
  | 'approvals'
  | 'risk'
  | 'cash'
  | 'pipeline';

export type ParksAiQuickAction = {
  id: string;
  label: string;
  message: string;
  description?: string;
  visual?: ParksAiQuickActionVisual;
  action?: ParksAiAction;
};
