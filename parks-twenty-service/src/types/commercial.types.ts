export type NaveMatchCandidate = {
  naveId: string;
  identificador: string;
  m2: number;
  parqueNombre?: string;
  ubicacion?: string;
  precioUsdM2?: number;
  matchScore: number;
  matchReasons: string[];
};

export type NaveMatchResult = {
  opportunityId?: string;
  m2Requeridos: number;
  industry?: string;
  matches: NaveMatchCandidate[];
  totalDisponibles: number;
};

export type FichaTecnicaSentVia = 'email' | 'whatsapp' | 'link' | null;

export type FichaTecnicaLink = {
  token: string;
  opportunityId: string;
  opportunityName: string;
  naveId: string;
  naveIdentificador: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2: number;
  precioUsdM2?: number;
  publicUrl: string;
  viewCount: number;
  lastViewedAt?: string;
  sentVia: FichaTecnicaSentVia;
  sentAt?: string;
  createdAt: string;
};

export type SalesScriptResult = {
  opportunityId?: string;
  companyName: string;
  industry: string;
  scriptTitle: string;
  openingLine: string;
  discoveryQuestions: string[];
  valueProposition: string;
  visitAgenda: string[];
  closingLine: string;
  usedLlm: boolean;
  generatedAt: string;
};
