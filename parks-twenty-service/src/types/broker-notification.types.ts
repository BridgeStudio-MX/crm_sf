export type BrokerNotificationType =
  | 'task'
  | 'enrichment'
  | 'alert'
  | 'email'
  | 'system';

export type BrokerNotificationPriority = 'high' | 'normal' | 'low';

export type BrokerNotification = {
  id: string;
  type: BrokerNotificationType;
  priority: BrokerNotificationPriority;
  title: string;
  body: string;
  area?: string;
  opportunityId?: string;
  opportunityName?: string;
  read: boolean;
  createdAt: string;
};

export type ProspectEnrichmentResult = {
  opportunityId: string;
  companyName: string;
  industry: string;
  employeeCountEstimate: string;
  revenueEstimateUsd: string;
  investmentSignals: string[];
  linkedInSignals: string[];
  fitScore: number;
  urgency: 'alta' | 'media' | 'baja';
  riskLevel: 'bajo' | 'medio' | 'alto';
  summary: string;
  suggestedActions: string[];
  usedLlm: boolean;
  enrichedAt: string;
};
