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
  | 'unknown';

export type ParksAiRouteContext = {
  screen: ParksAiScreen;
  casoLegalId?: string;
  parqueId?: string;
  cityFilterId?: string;
  searchQuery?: string;
};

export type ParksAiChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ParksAiChatRequest = {
  message: string;
  action?: ParksAiAction;
  context?: ParksAiRouteContext;
  history?: ParksAiChatMessage[];
};

export type ParksAiChatResponse = {
  reply: string;
  action: ParksAiAction;
  usedLlm: boolean;
  suggestedFollowUps?: string[];
};

export type ParksAiChecklistDocument = {
  id: string;
  titulo?: string;
  tipoDocumento?: string;
  entregado?: boolean;
};

export type ParksAiNaveSnapshot = {
  identificador: string;
  m2?: number;
  parqueNombre?: string;
  ubicacion?: string;
};
